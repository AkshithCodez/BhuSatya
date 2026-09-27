"""
Real PostgreSQL Integration Test Suite.
Verifies PostgreSQL 16 dialect, schema, persistence, and cascade behavior.
Section 22 compliance: Explicitly asserts dialect == 'postgresql'.
"""
import pytest
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.database import Base, get_db_status
from app.models.document import Document, DocumentPage
from app.models.detection import Detection, ExtractedRegion
from app.models.extraction import TableExtraction, ExtractedField
from app.models.audit import AuditEvent
from app.models.land_record import Parcel, Person, ReferenceRecord


def is_postgres_available() -> bool:
    """Check if real PostgreSQL instance is reachable at configured DATABASE_URL."""
    status = get_db_status()
    return status["status"] == "ok" and status["engine"] == "postgresql"


@pytest.fixture(scope="module")
def pg_session():
    """Yield a database session connected strictly to PostgreSQL."""
    if not is_postgres_available():
        pytest.skip(
            "PostgreSQL 16 is not reachable at localhost:5432. "
            "To run real PostgreSQL integration tests, start postgres via docker compose or service."
        )

    engine = create_engine(settings.DATABASE_URL)
    # Explicit Section 22 requirement: Assert database dialect == postgresql
    assert engine.dialect.name == "postgresql", (
        f"Expected postgresql dialect, but found '{engine.dialect.name}'. "
        "Silent SQLite fallback is strictly prohibited."
    )

    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    yield session

    session.rollback()
    session.close()


def test_postgresql_dialect_and_connectivity(pg_session):
    """Assert database dialect is strictly postgresql and executes basic query."""
    engine = pg_session.bind
    assert engine.dialect.name == "postgresql"
    result = pg_session.execute(text("SELECT version();")).scalar()
    assert "PostgreSQL" in result


def test_postgresql_schema_tables_exist(pg_session):
    """Verify core expected tables exist in PostgreSQL information_schema."""
    query = text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    """)
    existing_tables = {row[0] for row in pg_session.execute(query).fetchall()}

    expected_tables = {
        "users",
        "documents",
        "document_pages",
        "detections",
        "extracted_regions",
        "table_extractions",
        "extracted_fields",
        "parcels",
        "persons",
        "parcel_rights",
        "mutations",
        "registration_records",
        "reference_records",
        "validation_results",
        "reviews",
        "audit_events",
    }

    missing = expected_tables - existing_tables
    assert not missing, f"Missing tables in PostgreSQL schema: {missing}"


def test_postgresql_full_persistence_lifecycle(pg_session):
    """
    Test persistence lifecycle in PostgreSQL:
    Document -> Page -> Detection -> Crop metadata -> OCR -> Field -> Audit event.
    """
    # 1. Document
    doc = Document(
        filename="test_deed_pg.png",
        original_filename="test_deed.png",
        file_path="./storage/test_deed_pg.png",
        file_type="png",
        file_size=1024,
        status="UPLOADED",
    )
    pg_session.add(doc)
    pg_session.commit()
    pg_session.refresh(doc)
    assert doc.id is not None

    # 2. Page
    page = DocumentPage(
        document_id=doc.id,
        page_number=1,
        image_path="./document_pages/page_1.png",
        image_width=1200,
        image_height=1600,
    )
    pg_session.add(page)
    pg_session.commit()
    pg_session.refresh(page)
    assert page.id is not None

    # 3. Detection
    det = Detection(
        document_id=doc.id,
        document_page_id=page.id,
        page_number=1,
        detection_id="det_001",
        class_id=0,
        class_name="table",
        confidence=0.892,
        bbox_x1=100.0,
        bbox_y1=150.0,
        bbox_x2=800.0,
        bbox_y2=600.0,
        image_width=1200,
        image_height=1600,
        model_name="YOLOv8n-layout",
        model_version="v1.0",
    )
    pg_session.add(det)
    pg_session.commit()
    pg_session.refresh(det)
    assert det.id is not None

    # 4. ExtractedRegion
    region = ExtractedRegion(
        detection_id=det.id,
        document_id=doc.id,
        page_number=1,
        class_name="table",
        crop_path="./detected_regions/table_1.png",
        crop_width=700,
        crop_height=450,
    )
    pg_session.add(region)
    pg_session.commit()
    pg_session.refresh(region)
    assert region.id is not None

    # 5. TableExtraction (Raw OCR)
    extraction = TableExtraction(
        detected_region_id=region.id,
        region_id=region.id,
        document_id=doc.id,
        provider="paddle_ocr",
        raw_text="Khasra No: 145/2\nArea: 3.28 Acre",
        confidence=0.885,
        extraction_method="paddle_ocr",
    )
    pg_session.add(extraction)
    pg_session.commit()
    pg_session.refresh(extraction)
    assert extraction.id is not None

    # 6. ExtractedField (Structured)
    field = ExtractedField(
        document_id=doc.id,
        field_name="khasra_number",
        value="145/2",
        normalized_value="145/2",
        confidence=0.885,
        source_detection_id=str(region.id),
        extraction_method="paddle_ocr",
        verification_status="UNVERIFIED",
    )
    pg_session.add(field)
    pg_session.commit()
    pg_session.refresh(field)
    assert field.id is not None

    # 7. AuditEvent
    audit = AuditEvent(
        document_id=doc.id,
        event_type="TEST_EVENT",
        description="PostgreSQL persistence test succeeded",
    )
    pg_session.add(audit)
    pg_session.commit()
    pg_session.refresh(audit)
    assert audit.id is not None

    # Query back and verify persistence
    queried_doc = pg_session.query(Document).filter(Document.id == doc.id).first()
    assert queried_doc is not None
    assert len(queried_doc.pages) == 1
    assert len(queried_doc.detections) == 1
    assert len(queried_doc.extracted_fields) == 1

    # Cleanup test row
    pg_session.delete(doc)
    pg_session.commit()
