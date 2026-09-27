"""Extraction router — table text extraction and structured field parsing."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.config import settings
from app.models.document import Document
from app.models.detection import ExtractedRegion
from app.models.extraction import TableExtraction, ExtractedField
from app.schemas.extraction import ExtractedFieldOut, TableExtractionOut, ManualTextInput
from app.services.table_extraction import create_table_extractor
from app.services.table_extraction.base import TableExtractionResult
from app.services.field_parser import parse_fields
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/api", tags=["extraction"])


@router.post("/regions/{region_id}/extract", response_model=TableExtractionOut)
def extract_table_text(
    region_id: int,
    manual_input: ManualTextInput | None = None,
    db: Session = Depends(get_db),
):
    """Extract text from a cropped table region using the configured provider."""
    region = db.query(ExtractedRegion).filter(ExtractedRegion.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")

    if region.class_name != "table":
        raise HTTPException(status_code=400, detail="Region is not a table")

    if manual_input and manual_input.text:
        result = TableExtractionResult(
            raw_text=manual_input.text,
            extraction_method="manual",
            confidence=None,
        )
    else:
        extractor = create_table_extractor(settings.TABLE_TEXT_PROVIDER)
        result = extractor.extract(region.crop_path)

    if result.error:
        raise HTTPException(status_code=503, detail=f"Table extraction failed: {result.error}")

    extraction = TableExtraction(
        detected_region_id=region_id,
        region_id=region_id,
        document_id=region.document_id,
        provider=settings.TABLE_TEXT_PROVIDER,
        raw_text=result.raw_text,
        confidence=result.confidence,
        extraction_method=result.extraction_method,
    )
    db.add(extraction)
    db.commit()
    db.refresh(extraction)

    # Update document status
    doc = db.query(Document).filter(Document.id == region.document_id).first()
    if doc:
        doc.status = "TEXT_EXTRACTED"
        db.commit()

    log_audit_event(
        db, "TEXT_EXTRACTED",
        f"Table text extracted via {result.extraction_method}",
        document_id=region.document_id,
    )

    return TableExtractionOut(
        id=extraction.id,
        region_id=region_id,
        document_id=region.document_id,
        raw_text=result.raw_text,
        extraction_method=result.extraction_method,
    )


@router.post("/documents/{document_id}/parse")
def parse_document_fields(document_id: int, db: Session = Depends(get_db)):
    """Parse raw extracted text into structured land record fields."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get all table extractions for this document
    extractions = db.query(TableExtraction).filter(
        TableExtraction.document_id == document_id
    ).all()

    if not extractions:
        raise HTTPException(
            status_code=400,
            detail="No text extractions found. Extract table text first.",
        )

    all_fields = []

    for extraction in extractions:
        result = parse_fields(
            extraction.raw_text,
            extraction.extraction_method,
            source_confidence=extraction.confidence,
        )

        for parsed in result.fields:
            field = ExtractedField(
                document_id=document_id,
                field_name=parsed.field_name,
                value=parsed.value,
                normalized_value=parsed.normalized_value,
                unit=parsed.unit,
                confidence=parsed.confidence,
                source_page=1,
                source_detection_id=str(extraction.region_id),
                source_text=parsed.source_text,
                extraction_method=extraction.extraction_method,
                verification_status="UNVERIFIED",
            )
            db.add(field)
            all_fields.append(field)

    # Update document metadata from parsed fields
    field_map = {f.field_name: f.normalized_value or f.value for f in all_fields}
    if "village" in field_map:
        doc.village = field_map["village"]
    if "khasra_number" in field_map:
        doc.khasra_number = field_map["khasra_number"]
    doc.status = "STRUCTURED"
    db.commit()

    log_audit_event(
        db, "FIELDS_PARSED",
        f"Parsed {len(all_fields)} structured fields",
        document_id=document_id,
        details={"fields": [f.field_name for f in all_fields]},
    )

    # Refresh and return
    for f in all_fields:
        db.refresh(f)

    return [
        ExtractedFieldOut(
            id=f.id,
            document_id=f.document_id,
            field_name=f.field_name,
            value=f.value,
            normalized_value=f.normalized_value,
            unit=f.unit,
            confidence=f.confidence,
            source_page=f.source_page,
            source_detection_id=f.source_detection_id,
            source_text=f.source_text,
            extraction_method=f.extraction_method,
            verification_status=f.verification_status,
        )
        for f in all_fields
    ]


@router.get("/documents/{document_id}/fields", response_model=list[ExtractedFieldOut])
def get_fields(document_id: int, db: Session = Depends(get_db)):
    """Get extracted fields for a document."""
    fields = db.query(ExtractedField).filter(
        ExtractedField.document_id == document_id
    ).all()
    return [
        ExtractedFieldOut(
            id=f.id,
            document_id=f.document_id,
            field_name=f.field_name,
            value=f.value,
            normalized_value=f.normalized_value,
            unit=f.unit,
            confidence=f.confidence,
            source_page=f.source_page,
            source_detection_id=f.source_detection_id,
            source_text=f.source_text,
            extraction_method=f.extraction_method,
            verification_status=f.verification_status,
        )
        for f in fields
    ]
