"""Review router — officer actions, field corrections, approval."""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.models.review import Review, FieldCorrection
from app.schemas.review import ReviewRequest, ReviewOut, FieldCorrectionOut
from app.schemas.extraction import FieldUpdateRequest, ExtractedFieldOut
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/api", tags=["review"])


@router.put("/fields/{field_id}", response_model=ExtractedFieldOut)
def update_field(
    field_id: int,
    update: FieldUpdateRequest,
    db: Session = Depends(get_db),
):
    """Officer corrects an extracted field value."""
    field = db.query(ExtractedField).filter(ExtractedField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    previous_value = field.value

    # Store correction
    correction = FieldCorrection(
        field_id=field_id,
        document_id=field.document_id,
        field_name=field.field_name,
        previous_value=previous_value,
        new_value=update.value,
        reason=update.reason,
        changed_by=1,  # Prototype: default officer
    )
    db.add(correction)

    # Update field
    field.value = update.value
    field.normalized_value = update.value
    field.verification_status = "CORRECTED"
    db.commit()
    db.refresh(field)

    log_audit_event(
        db, "FIELD_CORRECTED",
        f"Officer corrected {field.field_name}: '{previous_value}' → '{update.value}'",
        document_id=field.document_id,
        details={
            "field_name": field.field_name,
            "previous_value": previous_value,
            "new_value": update.value,
            "reason": update.reason,
        },
    )

    return ExtractedFieldOut(
        id=field.id,
        document_id=field.document_id,
        field_name=field.field_name,
        value=field.value,
        normalized_value=field.normalized_value,
        unit=field.unit,
        confidence=field.confidence,
        source_page=field.source_page,
        source_detection_id=field.source_detection_id,
        source_text=field.source_text,
        extraction_method=field.extraction_method,
        verification_status=field.verification_status,
    )


@router.post("/documents/{document_id}/review", response_model=ReviewOut)
def submit_review(
    document_id: int,
    req: ReviewRequest,
    db: Session = Depends(get_db),
):
    """Submit a review action for a document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    review = Review(
        document_id=document_id,
        reviewer_id=1,  # Prototype: default officer
        action=req.action,
        notes=req.notes,
    )
    db.add(review)

    log_audit_event(
        db, f"REVIEW_{req.action}",
        f"Officer submitted review: {req.action}" + (f" — {req.notes}" if req.notes else ""),
        document_id=document_id,
    )

    db.commit()
    db.refresh(review)
    return ReviewOut(
        id=review.id,
        document_id=review.document_id,
        reviewer_id=review.reviewer_id,
        action=review.action,
        notes=review.notes,
        created_at=review.created_at,
    )


@router.post("/documents/{document_id}/approve")
def approve_document(document_id: int, db: Session = Depends(get_db)):
    """Approve a document — mark as verified."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    review = Review(
        document_id=document_id,
        reviewer_id=1,
        action="APPROVE",
    )
    db.add(review)

    doc.status = "VERIFIED"
    db.commit()

    log_audit_event(
        db, "DOCUMENT_APPROVED",
        "Document approved and verified",
        document_id=document_id,
    )

    # Build verified record
    fields = db.query(ExtractedField).filter(
        ExtractedField.document_id == document_id
    ).all()

    field_map = {f.field_name: f.normalized_value or f.value for f in fields}
    area_unit = next((f.unit for f in fields if f.field_name == "area"), "acre")

    verified_record = {
        "record_id": f"LR-{document_id:04d}",
        "village": field_map.get("village", ""),
        "khata_number": field_map.get("khata_number", ""),
        "parcel_number": field_map.get("khasra_number", ""),
        "area": {
            "value": float(field_map.get("area", 0)),
            "unit": area_unit or "acre",
        },
        "current_right_holders": [
            {
                "name": field_map.get("holder_name", ""),
                "share": "1/1",
            }
        ],
        "mutation_number": field_map.get("mutation_number", ""),
        "verification_status": "VERIFIED",
        "document_id": document_id,
    }

    return verified_record


@router.get("/review-queue")
def get_review_queue(db: Session = Depends(get_db)):
    """Get documents pending review."""
    docs = db.query(Document).filter(
        Document.status.in_(["REVIEW_REQUIRED", "READY_FOR_APPROVAL"])
    ).order_by(Document.risk_score.desc()).all()

    return [
        {
            "id": doc.id,
            "original_filename": doc.original_filename,
            "village": doc.village,
            "khasra_number": doc.khasra_number,
            "risk_score": doc.risk_score,
            "risk_level": doc.risk_level,
            "status": doc.status,
            "created_at": doc.created_at,
        }
        for doc in docs
    ]


@router.get("/documents/{document_id}/export")
def export_document(document_id: int, db: Session = Depends(get_db)):
    """Export verified document as JSON."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    fields = db.query(ExtractedField).filter(
        ExtractedField.document_id == document_id
    ).all()

    corrections = db.query(FieldCorrection).filter(
        FieldCorrection.document_id == document_id
    ).all()

    field_map = {f.field_name: f.normalized_value or f.value for f in fields}
    area_unit = next((f.unit for f in fields if f.field_name == "area"), "acre")

    return {
        "record_id": f"LR-{document_id:04d}",
        "document_id": document_id,
        "status": doc.status,
        "village": field_map.get("village", ""),
        "district": field_map.get("district", ""),
        "tehsil": field_map.get("tehsil", ""),
        "state": field_map.get("state", ""),
        "khata_number": field_map.get("khata_number", ""),
        "parcel_number": field_map.get("khasra_number", ""),
        "area": {
            "value": float(field_map.get("area", 0) or 0),
            "unit": area_unit or "acre",
        },
        "holder_name": field_map.get("holder_name", ""),
        "father_name": field_map.get("father_name", ""),
        "mutation_number": field_map.get("mutation_number", ""),
        "risk_score": doc.risk_score,
        "risk_level": doc.risk_level,
        "fields": [
            {
                "field_name": f.field_name,
                "value": f.value,
                "normalized_value": f.normalized_value,
                "unit": f.unit,
                "confidence": f.confidence,
                "extraction_method": f.extraction_method,
                "verification_status": f.verification_status,
            }
            for f in fields
        ],
        "corrections": [
            {
                "field_name": c.field_name,
                "previous_value": c.previous_value,
                "new_value": c.new_value,
                "reason": c.reason,
            }
            for c in corrections
        ],
    }
