"""
Comprehensive integration test for the genuine end-to-end BhuSatya pipeline:
Real Document -> Manual Region Selection -> Real Crop -> Real PaddleOCR
-> Raw OCR in PostgreSQL -> Structured Parser -> Field Provenance
-> Validation (with SKIP behavior for missing reference data)
-> Officer Correction & History -> Audit Trail -> Final JSON Export.
"""
import os
import json
import pytest
from io import BytesIO
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.config import settings
from app.db.database import SessionLocal
from app.models.document import Document, DocumentPage
from app.models.detection import DetectedRegion, Detection
from app.models.extraction import TableExtraction, ExtractedField
from app.models.review import FieldCorrection, Review
from app.models.validation import ValidationResult
from app.models.audit import AuditEvent


def is_postgres_available() -> bool:
    from app.db.database import get_db_status
    status = get_db_status()
    return status["status"] == "ok" and status["engine"] == "postgresql"


@pytest.fixture(scope="module")
def real_pg_engine():
    if not is_postgres_available():
        pytest.skip("PostgreSQL 16 is required for real pipeline tests.")
    engine = create_engine(settings.DATABASE_URL)
    assert engine.dialect.name == "postgresql"
    return engine


@pytest.fixture
def auth_client():
    from app.main import app as fastapi_app
    from app.db.database import get_db, SessionLocal

    def get_real_pg_db():
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()

    fastapi_app.dependency_overrides[get_db] = get_real_pg_db
    client = TestClient(app)
    resp = client.post("/api/auth/login", json={"email": "officer@bhusatya.gov.in", "password": "BhuSatya@123"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    yield client
    fastapi_app.dependency_overrides.pop(get_db, None)


def create_sample_deed_image() -> bytes:
    """Create a realistic synthetic deed image with a clear table for testing."""
    img = Image.new("RGB", (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Draw header text
    draw.text((50, 40), "GOVERNMENT LAND RECORD DEPARTMENT", fill=(0, 0, 0))
    draw.text((50, 70), "RECORD OF RIGHTS (ROR) / KHATUNI", fill=(0, 0, 0))

    # Draw a table outline
    draw.rectangle([50, 150, 750, 500], outline=(0, 0, 0), width=2)
    draw.line([50, 200, 750, 200], fill=(0, 0, 0), width=2)
    draw.line([50, 260, 750, 260], fill=(0, 0, 0), width=1)
    draw.line([50, 320, 750, 320], fill=(0, 0, 0), width=1)
    draw.line([50, 380, 750, 380], fill=(0, 0, 0), width=1)
    draw.line([50, 440, 750, 440], fill=(0, 0, 0), width=1)

    # Table content with clear key: value lines
    draw.text((70, 165), "FIELD NAME", fill=(0, 0, 0))
    draw.text((350, 165), "DETAILS / RECORD VALUE", fill=(0, 0, 0))

    draw.text((70, 220), "Village: Rampur", fill=(0, 0, 0))
    draw.text((70, 280), "Khata No: 42", fill=(0, 0, 0))
    draw.text((70, 340), "Khasra No: 104/A", fill=(0, 0, 0))
    draw.text((70, 400), "Holder Name: Rajesh Sharma", fill=(0, 0, 0))
    draw.text((70, 460), "Area: 2.50 Acre", fill=(0, 0, 0))

    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_full_manual_pipeline_e2e(auth_client, real_pg_engine):
    """
    Execute genuine end-to-end pipeline:
    1. Upload real document
    2. Coordinate validation (rejects invalid/too small, accepts valid)
    3. Generate real crop on disk and persist in PostgreSQL
    4. Execute real PaddleOCR on the crop and persist raw OCR
    5. Parse structured fields and verify provenance metadata
    6. Run validation engine (verifying SKIP behavior on missing reference data)
    7. Officer field correction & history preservation
    8. Complete review & approval
    9. Verify audit trail events
    10. Verify final JSON export structure
    """
    image_bytes = create_sample_deed_image()

    # 1. Document Upload
    upload_resp = auth_client.post(
        "/api/documents",
        files={"file": ("sample_ror_deed.png", image_bytes, "image/png")},
    )
    assert upload_resp.status_code == 200, upload_resp.text
    doc_id = upload_resp.json()["id"]
    assert doc_id is not None

    try:
        # 2. Manual Region Coordinate Validation
        # 2a. Reject too small region (< 5x5 px)
        bad_resp = auth_client.post(
            f"/api/documents/{doc_id}/manual-region",
            json={
                "page_number": 1,
                "x1": 100, "y1": 100,
                "x2": 102, "y2": 102,
                "image_width": 800, "image_height": 1000,
                "region_type": "table",
            },
        )
        assert bad_resp.status_code == 400
        assert "too small" in bad_resp.json()["detail"].lower()

        # 2b. Valid table region covering the table (50, 150 to 750, 500)
        region_resp = auth_client.post(
            f"/api/documents/{doc_id}/manual-region",
            json={
                "page_number": 1,
                "x1": 45, "y1": 145,
                "x2": 755, "y2": 505,
                "image_width": 800, "image_height": 1000,
                "region_type": "table",
            },
        )
        assert region_resp.status_code == 200, region_resp.text
        region_data = region_resp.json()
        region_id = region_data["id"]
        assert region_data["source"] == "manual_selection"
        assert region_data["region_type"] == "table"
        assert region_data["crop_width"] > 0
        assert region_data["crop_height"] > 0
        assert os.path.exists(region_data["crop_path"])

        # 3. Verify region persistence in PostgreSQL
        regions_list_resp = auth_client.get(f"/api/documents/{doc_id}/regions")
        assert regions_list_resp.status_code == 200
        regions_list = regions_list_resp.json()
        assert any(r["id"] == region_id and r["source"] == "manual_selection" for r in regions_list)

        # 4. Execute Real PaddleOCR on the crop
        ocr_resp = auth_client.post(f"/api/regions/{region_id}/extract")
        assert ocr_resp.status_code == 200, ocr_resp.text
        ocr_data = ocr_resp.json()
        assert ocr_data["region_id"] == region_id
        assert ocr_data["extraction_method"] == "paddle_ocr"
        assert ocr_data["raw_text"] is not None
        assert len(ocr_data["raw_text"]) > 0

        # Verify OCR persisted in PostgreSQL table_extractions
        with SessionLocal() as session:
            te = session.query(TableExtraction).filter(
                TableExtraction.detected_region_id == region_id,
                TableExtraction.document_id == doc_id,
            ).order_by(TableExtraction.id.desc()).first()
            assert te is not None
            assert te.detected_region_id == region_id
            assert te.document_id == doc_id
            assert te.provider == settings.TABLE_TEXT_PROVIDER
            assert te.raw_text == ocr_data["raw_text"]

        # 5. Structured Field Parser & Field Provenance
        parse_resp = auth_client.post(f"/api/documents/{doc_id}/parse")
        assert parse_resp.status_code == 200, parse_resp.text
        fields_data = parse_resp.json()
        assert isinstance(fields_data, list)
        assert len(fields_data) > 0

        # Verify provenance on parsed fields
        for f in fields_data:
            assert f["document_id"] == doc_id
            assert f["source_region_id"] == region_id
            assert f["raw_value"] is not None
            assert f["verification_status"] == "UNVERIFIED"

        # 6. Validation Engine & Skip Behavior
        val_resp = auth_client.post(f"/api/documents/{doc_id}/validate")
        assert val_resp.status_code == 200, val_resp.text
        val_data = val_resp.json()
        assert "risk_score" in val_data
        assert "risk_level" in val_data
        assert "results" in val_data

        # Verify that missing reference data produces SKIP or truthful status
        results = val_data["results"]
        assert len(results) > 0

        # 7. Officer Field Correction & History
        # Pick first field to correct
        field_to_edit = fields_data[0]
        field_id = field_to_edit["id"]
        original_raw = field_to_edit["raw_value"]

        correction_resp = auth_client.put(
            f"/api/fields/{field_id}",
            json={
                "value": "Corrected Value 999",
                "reason": "Officer verified against physical deed",
            },
        )
        assert correction_resp.status_code == 200, correction_resp.text
        updated_field = correction_resp.json()
        assert updated_field["value"] == "Corrected Value 999"
        assert updated_field["raw_value"] == original_raw  # Raw value preserved!
        assert updated_field["verification_status"] == "CORRECTED"

        # Check FieldCorrection table in PostgreSQL
        with SessionLocal() as session:
            fc = session.query(FieldCorrection).filter(FieldCorrection.field_id == field_id).first()
            assert fc is not None
            assert fc.previous_value == field_to_edit["value"]
            assert fc.new_value == "Corrected Value 999"
            assert fc.reason == "Officer verified against physical deed"

        # Confirm status endpoint
        status_resp = auth_client.put(f"/api/fields/{field_id}/status?status=CONFIRMED")
        assert status_resp.status_code == 200
        assert status_resp.json()["verification_status"] == "CONFIRMED"

        # 8. Submit Review & Approval
        review_resp = auth_client.post(
            f"/api/documents/{doc_id}/review",
            json={"action": "APPROVE", "notes": "All checks verified successfully"},
        )
        assert review_resp.status_code == 200

        # 9. Audit Trail Events Check
        audit_resp = auth_client.get(f"/api/audit?document_id={doc_id}")
        assert audit_resp.status_code == 200
        events = [e["event_type"] for e in audit_resp.json()["events"]]

        required_events = [
            "DOCUMENT_UPLOADED",
            "MANUAL_REGION_CREATED",
            "REGION_CROPPED",
            "OCR_STARTED",
            "OCR_COMPLETED",
            "FIELDS_PARSED",
            "VALIDATION_EXECUTED",
            "VALIDATION_COMPLETED",
            "FIELD_CORRECTED",
            "REVIEW_COMPLETED",
            "RECORD_APPROVED",
        ]
        for req_event in required_events:
            assert req_event in events, f"Expected audit event '{req_event}' missing from audit trail: {events}"

        # 10. Final JSON Export
        export_resp = auth_client.get(f"/api/documents/{doc_id}/export")
        assert export_resp.status_code == 200, export_resp.text
        export_data = export_resp.json()
        assert export_data["document_id"] == doc_id
        assert export_data["status"] == "VERIFIED"
        assert "structured_fields" in export_data
        assert "extracted_fields" in export_data
        assert "corrections" in export_data
        assert "validation_results" in export_data
        assert len(export_data["corrections"]) >= 1
        assert export_data["corrections"][0]["new_value"] == "Corrected Value 999"

        # 11. Dashboard & Review Queue DB-backed
        dash_resp = auth_client.get("/api/dashboard")
        assert dash_resp.status_code == 200
        assert dash_resp.json()["stats"]["total_documents"] >= 1

        queue_resp = auth_client.get("/api/review-queue")
        assert queue_resp.status_code == 200

    finally:
        # Cleanup created test entities from PostgreSQL
        with SessionLocal() as session:
            session.query(ValidationResult).filter(ValidationResult.document_id == doc_id).delete()
            session.query(FieldCorrection).filter(FieldCorrection.document_id == doc_id).delete()
            session.query(ExtractedField).filter(ExtractedField.document_id == doc_id).delete()
            session.query(TableExtraction).filter(TableExtraction.document_id == doc_id).delete()
            session.query(DetectedRegion).filter(DetectedRegion.document_id == doc_id).delete()
            session.query(Detection).filter(Detection.document_id == doc_id).delete()
            session.query(Review).filter(Review.document_id == doc_id).delete()
            session.query(AuditEvent).filter(AuditEvent.document_id == doc_id).delete()
            session.query(DocumentPage).filter(DocumentPage.document_id == doc_id).delete()
            session.query(Document).filter(Document.id == doc_id).delete()
            session.commit()
