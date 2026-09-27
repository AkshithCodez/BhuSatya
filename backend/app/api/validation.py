"""Validation router — runs validation engine against PostgreSQL reference data and logs audit events."""
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
    """Run the validation engine on extracted fields within an atomic database transaction."""
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

    # Build field map and field ID map
    field_map = {}
    field_id_map = {}
    total_conf = 0.0
    conf_count = 0

    for f in fields:
        val = f.normalized_value or f.value
        field_map[f.field_name] = val
        field_id_map[f.field_name] = f.id
        if f.unit:
            field_map[f"{f.field_name}_unit"] = f.unit
        if f.confidence is not None:
            total_conf += f.confidence
            conf_count += 1

    avg_conf = (total_conf / conf_count) if conf_count > 0 else None

    # Atomic transaction
    try:
        doc.status = "VALIDATING"
        db.flush()

        log_audit_event(
            db,
            event_type="VALIDATION_STARTED",
            description="Validation engine initiated against PostgreSQL reference records",
            document_id=document_id,
            details={"field_count": len(field_map)},
            commit=False,
        )
        log_audit_event(
            db,
            event_type="VALIDATION_EXECUTED",
            description="Validation engine executed against PostgreSQL reference records",
            document_id=document_id,
            details={"field_count": len(field_map)},
            commit=False,
        )


        # Run validation engine
        results = validation_engine.validate(field_map, db, document_id=document_id)

        # Calculate deterministic review priority
        risk_score, risk_level = calculate_risk_score(results, ocr_confidence=avg_conf)

        # Clear old validation results for this document
        db.query(ValidationResult).filter(ValidationResult.document_id == document_id).delete()

        # Insert new validation result rows
        for r in results:
            # Map extracted field id if applicable
            f_id = r.extracted_field_id
            if not f_id:
                if "area" in r.rule_code.lower():
                    f_id = field_id_map.get("area")
                elif "holder" in r.rule_code.lower():
                    f_id = field_id_map.get("holder_name")
                elif "mutation" in r.rule_code.lower():
                    f_id = field_id_map.get("mutation_number")
                elif "parcel" in r.rule_code.lower():
                    f_id = field_id_map.get("khasra_number")

            vr = ValidationResult(
                document_id=document_id,
                extracted_field_id=f_id,
                rule_code=r.rule_code,
                rule=r.rule,
                status=r.status,
                severity=r.severity,
                message=r.message,
                uploaded_value=r.uploaded_value,
                reference_values=json.dumps(r.reference_values) if r.reference_values else None,
                evidence=json.dumps([{"source": e.source, "value": e.value} for e in r.evidence]) if r.evidence else None,
                recommendation=r.recommendation,
            )
            db.add(vr)

            # Log granular rule audit event
            if r.status == "PASS":
                log_audit_event(
                    db,
                    event_type="VALIDATION_RULE_PASSED",
                    description=f"Rule {r.rule_code} passed: {r.message}",
                    document_id=document_id,
                    entity_type="VALIDATION_RULE",
                    entity_id=r.rule_code,
                    details={"rule": r.rule, "status": r.status},
                    commit=False,
                )
            elif r.status in ("FAIL", "AMBIGUOUS"):
                log_audit_event(
                    db,
                    event_type="VALIDATION_RULE_FAILED",
                    description=f"Rule {r.rule_code} discrepancy: {r.message}",
                    document_id=document_id,
                    entity_type="VALIDATION_RULE",
                    entity_id=r.rule_code,
                    details={"rule": r.rule, "severity": r.severity, "recommendation": r.recommendation},
                    commit=False,
                )
            else:  # SKIP, WARN, REFERENCE_DATA_NOT_FOUND
                log_audit_event(
                    db,
                    event_type="VALIDATION_SKIPPED" if r.status in ("SKIP", "REFERENCE_DATA_NOT_FOUND") else "VALIDATION_RULE_WARNED",
                    description=f"Rule {r.rule_code} ({r.status}): {r.message}",
                    document_id=document_id,
                    entity_type="VALIDATION_RULE",
                    entity_id=r.rule_code,
                    details={"rule": r.rule, "status": r.status},
                    commit=False,
                )

        # Update document
        doc.risk_score = risk_score
        doc.risk_level = risk_level
        doc.status = "REVIEW_REQUIRED"

        # Log completion audit event
        score_str = f"{risk_score:.1f}/100" if risk_score is not None else "N/A"
        log_audit_event(
            db,
            event_type="VALIDATION_COMPLETED",
            description=f"Validation completed — Priority: {risk_level} ({score_str})",
            document_id=document_id,
            details={"risk_score": risk_score, "risk_level": risk_level, "rules_count": len(results)},
            commit=False,
        )

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction error during validation: {str(e)}")

    return ValidationResponse(
        document_id=document_id,
        risk_score=risk_score,
        risk_level=risk_level,
        results=[
            ValidationResultOut(
                rule_code=r.rule_code,
                rule=r.rule,
                status=r.status,
                severity=r.severity,
                message=r.message,
                uploaded_value=r.uploaded_value,
                reference_values=r.reference_values,
                evidence=[EvidenceItem(source=e.source, value=e.value) for e in r.evidence],
                recommendation=r.recommendation,
                extracted_field_id=r.extracted_field_id,
            )
            for r in results
        ],
    )


@router.get("/documents/{document_id}/validation", response_model=ValidationResponse)
def get_validation(document_id: int, db: Session = Depends(get_db)):
    """Get stored validation results for a document from PostgreSQL."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    vrs = db.query(ValidationResult).filter(
        ValidationResult.document_id == document_id
    ).order_by(ValidationResult.id).all()

    results = []
    for vr in vrs:
        evidence = []
        if vr.evidence:
            try:
                ev_list = json.loads(vr.evidence)
                evidence = [EvidenceItem(source=e["source"], value=e["value"]) for e in ev_list]
            except (json.JSONDecodeError, KeyError):
                pass

        ref_vals = None
        if vr.reference_values:
            try:
                ref_vals = json.loads(vr.reference_values)
            except json.JSONDecodeError:
                pass

        results.append(ValidationResultOut(
            id=vr.id,
            rule_code=vr.rule_code or "RULE_UNKNOWN",
            rule=vr.rule,
            status=vr.status,
            severity=vr.severity,
            message=vr.message,
            uploaded_value=vr.uploaded_value,
            reference_values=ref_vals,
            evidence=evidence,
            recommendation=vr.recommendation,
            extracted_field_id=vr.extracted_field_id,
        ))

    return ValidationResponse(
        document_id=document_id,
        risk_score=doc.risk_score,
        risk_level=doc.risk_level or "INSUFFICIENT_DATA",
        results=results,
    )

