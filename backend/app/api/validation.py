"""Validation router — runs validation engine and returns risk assessment."""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.models.validation import ValidationResult
from app.schemas.validation import ValidationResultOut, ValidationResponse, EvidenceItem
from app.services.validation import ValidationEngine
from app.services.risk_service import calculate_risk_score, get_risk_summary
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/api", tags=["validation"])

validation_engine = ValidationEngine()


@router.post("/documents/{document_id}/validate", response_model=ValidationResponse)
def validate_document(document_id: int, db: Session = Depends(get_db)):
    """Run the validation engine on extracted fields."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    fields = db.query(ExtractedField).filter(
        ExtractedField.document_id == document_id
    ).all()

    if not fields:
        raise HTTPException(
            status_code=400,
            detail="No extracted fields found. Parse document first.",
        )

    # Build field map
    field_map = {}
    for f in fields:
        val = f.normalized_value or f.value
        field_map[f.field_name] = val
        if f.unit:
            field_map[f"{f.field_name}_unit"] = f.unit

    doc.status = "VALIDATING"
    db.commit()

    # Run validators
    results = validation_engine.validate(field_map, db)

    # Calculate risk
    risk_score, risk_level = calculate_risk_score(results)

    # Store results
    # Clear old results first
    db.query(ValidationResult).filter(ValidationResult.document_id == document_id).delete()

    for r in results:
        vr = ValidationResult(
            document_id=document_id,
            rule=r.rule,
            status=r.status,
            severity=r.severity,
            message=r.message,
            uploaded_value=r.uploaded_value,
            evidence=json.dumps([{"source": e.source, "value": e.value} for e in r.evidence]) if r.evidence else None,
            recommendation=r.recommendation,
        )
        db.add(vr)

    # Update document risk
    doc.risk_score = risk_score
    doc.risk_level = risk_level
    doc.status = "REVIEW_REQUIRED"
    db.commit()

    log_audit_event(
        db, "VALIDATION_COMPLETED",
        f"Validation completed — Risk: {risk_level} ({risk_score}/100)",
        document_id=document_id,
        details={"risk_score": risk_score, "risk_level": risk_level},
    )

    # Log specific issues
    for r in results:
        if r.status == "FAIL":
            log_audit_event(
                db, "DISCREPANCY_DETECTED",
                f"{r.rule}: {r.message}",
                document_id=document_id,
            )

    return ValidationResponse(
        document_id=document_id,
        risk_score=risk_score,
        risk_level=risk_level,
        results=[
            ValidationResultOut(
                rule=r.rule,
                status=r.status,
                severity=r.severity,
                message=r.message,
                uploaded_value=r.uploaded_value,
                evidence=[EvidenceItem(source=e.source, value=e.value) for e in r.evidence],
                recommendation=r.recommendation,
            )
            for r in results
        ],
    )


@router.get("/documents/{document_id}/validation", response_model=ValidationResponse)
def get_validation(document_id: int, db: Session = Depends(get_db)):
    """Get stored validation results for a document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    vrs = db.query(ValidationResult).filter(
        ValidationResult.document_id == document_id
    ).all()

    results = []
    for vr in vrs:
        evidence = []
        if vr.evidence:
            try:
                ev_list = json.loads(vr.evidence)
                evidence = [EvidenceItem(source=e["source"], value=e["value"]) for e in ev_list]
            except (json.JSONDecodeError, KeyError):
                pass

        results.append(ValidationResultOut(
            id=vr.id,
            rule=vr.rule,
            status=vr.status,
            severity=vr.severity,
            message=vr.message,
            uploaded_value=vr.uploaded_value,
            evidence=evidence,
            recommendation=vr.recommendation,
        ))

    return ValidationResponse(
        document_id=document_id,
        risk_score=doc.risk_score or 0,
        risk_level=doc.risk_level or "LOW",
        results=results,
    )
