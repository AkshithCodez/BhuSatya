"""Review router — officer review, field corrections, audit trail, and verified land record."""
import json
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import case

from app.db import get_db
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.models.review import Review, FieldCorrection
from app.models.validation import ValidationResult
from app.models.user import User
from app.schemas.review import (
    ReviewRequest, ReviewOut, FieldCorrectionOut,
    ApproveRequest, DecisionRequest, VerifiedRecordResponse, ReviewerInfo
)
from app.schemas.extraction import FieldUpdateRequest, ExtractedFieldOut
from app.services.audit_service import log_audit_event
from app.api.auth import require_roles, get_current_user

router = APIRouter(prefix="/api", tags=["review"])


@router.put("/fields/{field_id}", response_model=ExtractedFieldOut)
def update_field(
    field_id: int,
    update: FieldUpdateRequest,
    current_user: User = Depends(require_roles("VERIFICATION_OFFICER", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """
    Officer corrects an extracted field value.
    Preserves original raw_value, writes FieldCorrection history, and logs append-only audit event.
    """
    field = db.query(ExtractedField).filter(ExtractedField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    if not update.reason or not update.reason.strip():
        raise HTTPException(status_code=400, detail="Correction reason is mandatory for government auditability.")

    previous_value = field.value
    new_val = update.value.strip() if update.value is not None else ""

    try:
        # 1. Store immutable correction record in PostgreSQL
        correction = FieldCorrection(
            field_id=field_id,
            extracted_field_id=field_id,
            document_id=field.document_id,
            field_name=field.field_name,
            previous_value=previous_value,
            new_value=new_val,
            reason=update.reason.strip(),
            changed_by=current_user.id,
        )
        db.add(correction)

        # 2. Update effective field value (raw_value stays preserved)
        field.value = new_val
        field.normalized_value = new_val
        field.verification_status = "CORRECTED"

        # 3. Log append-only audit event
        log_audit_event(
            db,
            event_type="FIELD_CORRECTED",
            description=f"Officer corrected {field.field_name}: '{previous_value}' → '{new_val}' (Reason: {update.reason.strip()})",
            document_id=field.document_id,
            user_id=current_user.id,
            entity_type="ExtractedField",
            entity_id=str(field_id),
            old_value=previous_value,
            new_value=new_val,
            details={
                "field_name": field.field_name,
                "previous_value": previous_value,
                "new_value": new_val,
                "reason": update.reason.strip(),
                "officer_name": current_user.full_name or current_user.name,
            },
            commit=False,
        )

        db.commit()
        db.refresh(field)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record correction: {str(e)}")

    return ExtractedFieldOut(
        id=field.id,
        document_id=field.document_id,
        field_name=field.field_name,
        raw_value=field.raw_value,
        value=field.value,
        normalized_value=field.normalized_value,
        unit=field.unit,
        confidence=field.confidence,
        source_page=field.source_page,
        source_region_id=field.source_region_id,
        source_detection_id=field.source_detection_id,
        table_extraction_id=field.table_extraction_id,
        source_text=field.source_text,
        extraction_method=field.extraction_method,
        verification_status=field.verification_status,
    )


@router.put("/fields/{field_id}/status", response_model=ExtractedFieldOut)
def update_field_status(
    field_id: int,
    status: str,
    current_user: User = Depends(require_roles("VERIFICATION_OFFICER", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """
    Officer confirms or flags a field without changing text.
    Supports: CONFIRMED, FLAGGED, UNREADABLE, NOT_APPLICABLE, UNVERIFIED.
    """
    field = db.query(ExtractedField).filter(ExtractedField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    status_clean = status.upper().strip()
    valid_statuses = ("CONFIRMED", "FLAGGED", "UNREADABLE", "NOT_APPLICABLE", "UNVERIFIED", "CORRECTED")
    if status_clean not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid verification status. Must be one of: {', '.join(valid_statuses)}")

    previous_status = field.verification_status
    field.verification_status = status_clean

    event_type = f"FIELD_{status_clean}"
    log_audit_event(
        db,
        event_type=event_type,
        description=f"Field {field.field_name} marked as {status_clean} by {current_user.full_name or current_user.name}",
        document_id=field.document_id,
        user_id=current_user.id,
        entity_type="ExtractedField",
        entity_id=str(field_id),
        old_value=previous_status,
        new_value=status_clean,
        details={"field_id": field.id, "field_name": field.field_name, "status": status_clean},
    )

    db.commit()
    db.refresh(field)

    return ExtractedFieldOut(
        id=field.id,
        document_id=field.document_id,
        field_name=field.field_name,
        raw_value=field.raw_value,
        value=field.value,
        normalized_value=field.normalized_value,
        unit=field.unit,
        confidence=field.confidence,
        source_page=field.source_page,
        source_region_id=field.source_region_id,
        source_detection_id=field.source_detection_id,
        table_extraction_id=field.table_extraction_id,
        source_text=field.source_text,
        extraction_method=field.extraction_method,
        verification_status=field.verification_status,
    )


@router.get("/documents/{document_id}/corrections")
def get_document_corrections(
    document_id: int,
    db: Session = Depends(get_db),
):
    """
    List historical field corrections for a document (Section 11).
    Preserves extracted_field_id, previous_value, new_value, changed_by, reason, changed_at.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    corrs = db.query(FieldCorrection).filter(
        FieldCorrection.document_id == document_id
    ).order_by(FieldCorrection.created_at.asc()).all()

    return [
        {
            "id": c.id,
            "document_id": c.document_id,
            "extracted_field_id": c.extracted_field_id,
            "field_name": c.field_name,
            "previous_value": c.previous_value,
            "new_value": c.new_value,
            "reason": c.reason,
            "changed_by": c.changed_by,
            "changed_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in corrs
    ]


@router.post("/documents/{document_id}/review", response_model=ReviewOut)
def submit_review(
    document_id: int,
    req: ReviewRequest,
    current_user: User = Depends(require_roles("VERIFICATION_OFFICER", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Submit a formal review decision for a document with audit tracking."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    action_clean = req.action.upper().strip()
    decision_clean = action_clean

    if action_clean in ("APPROVE", "APPROVED"):
        # Enforce override rule if unresolved critical discrepancies exist
        critical_discrepancies = db.query(ValidationResult).filter(
            ValidationResult.document_id == document_id,
            ValidationResult.status.in_(["FAIL", "AMBIGUOUS"]),
            ValidationResult.severity == "CRITICAL",
        ).all()

        unresolved_discrepancies = []
        for vr in critical_discrepancies:
            if vr.extracted_field_id:
                ef = db.query(ExtractedField).filter(ExtractedField.id == vr.extracted_field_id).first()
                if ef and ef.verification_status in ("CORRECTED", "CONFIRMED"):
                    continue
            unresolved_discrepancies.append(vr)

        justification = (req.override_reason or req.notes or "").strip()
        if unresolved_discrepancies:
            if not justification:
                failed_rules = [f"{vr.rule} ({vr.rule_code})" for vr in unresolved_discrepancies]
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot approve document with unresolved critical validation discrepancies: {', '.join(failed_rules)}. Explicit justification/override reason is required.",
                )
            # Log override
            log_audit_event(
                db,
                event_type="OVERRIDE_APPLIED",
                description=f"Officer {current_user.full_name or current_user.name} applied override for approval: {justification}",
                document_id=document_id,
                user_id=current_user.id,
                details={"override_reason": justification, "unresolved_count": len(unresolved_discrepancies)},
                commit=False,
            )

        doc.status = "VERIFIED"
        action_clean = "APPROVE"
        decision_clean = "APPROVED"
        log_event = "RECORD_APPROVED"
        desc = f"Document approved and verified by {current_user.full_name or current_user.name}"

    elif action_clean in ("REJECT", "REJECTED"):
        doc.status = "REJECTED"
        action_clean = "REJECT"
        decision_clean = "REJECTED"
        log_event = "RECORD_REJECTED"
        desc = f"Document rejected by {current_user.full_name or current_user.name}: {req.notes or 'No reason provided'}"
    elif action_clean in ("INVESTIGATE", "INVESTIGATION_REQUIRED"):
        doc.status = "INVESTIGATION_REQUIRED"
        action_clean = "INVESTIGATE"
        decision_clean = "INVESTIGATION_REQUIRED"
        log_event = "INVESTIGATION_REQUIRED"
        desc = f"Investigation requested by {current_user.full_name or current_user.name}: {req.notes or 'Field verification required'}"
    else:
        raise HTTPException(status_code=400, detail="Action must be APPROVE, REJECT, or INVESTIGATE.")

    review = Review(
        document_id=document_id,
        reviewer_id=current_user.id,
        action=action_clean,
        decision=decision_clean,
        notes=req.notes or req.override_reason,
    )
    db.add(review)

    log_audit_event(
        db,
        event_type=log_event,
        description=desc,
        document_id=document_id,
        user_id=current_user.id,
        details={"notes": req.notes, "override_reason": req.override_reason},
        commit=False,
    )

    log_audit_event(
        db,
        event_type="REVIEW_COMPLETED",
        description=f"Review decision persisted: {decision_clean}",
        document_id=document_id,
        user_id=current_user.id,
        details={"action": action_clean, "decision": decision_clean, "notes": req.notes},
        commit=False,
    )

    db.commit()
    db.refresh(review)

    return ReviewOut(
        id=review.id,
        document_id=review.document_id,
        reviewer_id=review.reviewer_id,
        action=review.action,
        decision=review.decision,
        notes=review.notes,
        created_at=review.created_at,
    )


@router.post("/documents/{document_id}/approve")
def approve_document(
    document_id: int,
    req: Optional[ApproveRequest] = Body(None),
    current_user: User = Depends(require_roles("VERIFICATION_OFFICER", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """
    Approve a document and endorse it as an official verified land record.
    Checks for unresolved critical validation discrepancies. Requires override_reason if critical failures exist.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    critical_discrepancies = db.query(ValidationResult).filter(
        ValidationResult.document_id == document_id,
        ValidationResult.status.in_(["FAIL", "AMBIGUOUS"]),
        ValidationResult.severity == "CRITICAL",
    ).all()

    override_reason = req.override_reason if req else None
    notes = req.notes if req else None
    justification = (override_reason or notes or "").strip()

    # Check which discrepancies remain unresolved (i.e. field has not been confirmed or corrected)
    unresolved_discrepancies = []
    for vr in critical_discrepancies:
        if vr.extracted_field_id:
            ef = db.query(ExtractedField).filter(ExtractedField.id == vr.extracted_field_id).first()
            if ef and ef.verification_status in ("CORRECTED", "CONFIRMED"):
                continue  # Resolved by officer action
        unresolved_discrepancies.append(vr)

    if unresolved_discrepancies:
        if not justification:
            failed_rules = [f"{vr.rule} ({vr.rule_code})" for vr in unresolved_discrepancies]
            raise HTTPException(
                status_code=400,
                detail=f"Cannot approve document with unresolved critical validation discrepancies: {', '.join(failed_rules)}. Explicit 'override_reason' justification is required.",
            )

        log_audit_event(
            db,
            event_type="OVERRIDE_APPLIED",
            description=f"Officer {current_user.full_name or current_user.name} applied override for approval: {justification}",
            document_id=document_id,
            user_id=current_user.id,
            details={"override_reason": justification, "unresolved_count": len(unresolved_discrepancies)},
            commit=False,
        )

    review = Review(
        document_id=document_id,
        reviewer_id=current_user.id,
        action="APPROVE",
        decision="APPROVED",
        notes=notes or override_reason,
    )
    db.add(review)

    doc.status = "VERIFIED"

    log_audit_event(
        db,
        event_type="DOCUMENT_APPROVED",
        description=f"Document verified and officially approved by {current_user.full_name or current_user.name}",
        document_id=document_id,
        user_id=current_user.id,
        details={"notes": notes, "override_reason": override_reason},
        commit=False,
    )
    log_audit_event(
        db,
        event_type="RECORD_APPROVED",
        description=f"Document verified and officially approved by {current_user.full_name or current_user.name}",
        document_id=document_id,
        user_id=current_user.id,
        details={"notes": notes, "override_reason": override_reason},
        commit=False,
    )
    log_audit_event(
        db,
        event_type="REVIEW_COMPLETED",
        description="Review completed with action APPROVED",
        document_id=document_id,
        user_id=current_user.id,
        commit=False,
    )

    db.commit()

    return build_verified_record_response(document_id, db)



@router.post("/documents/{document_id}/reject")
def reject_document(
    document_id: int,
    req: Optional[DecisionRequest] = Body(None),
    current_user: User = Depends(require_roles("VERIFICATION_OFFICER", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Reject a document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    reason = (req.reason if req else None) or (req.notes if req else None) or "Rejected by verification officer"

    review = Review(
        document_id=document_id,
        reviewer_id=current_user.id,
        action="REJECT",
        decision="REJECTED",
        notes=reason,
    )
    db.add(review)

    doc.status = "REJECTED"

    log_audit_event(
        db,
        event_type="RECORD_REJECTED",
        description=f"Document rejected by {current_user.full_name or current_user.name}: {reason}",
        document_id=document_id,
        user_id=current_user.id,
        details={"reason": reason},
        commit=False,
    )
    log_audit_event(
        db,
        event_type="REVIEW_COMPLETED",
        description="Review completed with action REJECTED",
        document_id=document_id,
        user_id=current_user.id,
        commit=False,
    )

    db.commit()
    return {"status": "REJECTED", "decision": "REJECTED", "document_id": document_id, "notes": reason}


@router.post("/documents/{document_id}/investigate")
def investigate_document(
    document_id: int,
    req: Optional[DecisionRequest] = Body(None),
    current_user: User = Depends(require_roles("VERIFICATION_OFFICER", "ADMINISTRATOR")),
    db: Session = Depends(get_db),
):
    """Send document for formal administrative investigation."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    reason = (req.reason if req else None) or (req.notes if req else None) or "Referred for field and survey investigation"

    review = Review(
        document_id=document_id,
        reviewer_id=current_user.id,
        action="INVESTIGATE",
        decision="INVESTIGATION_REQUIRED",
        notes=reason,
    )
    db.add(review)

    doc.status = "INVESTIGATION_REQUIRED"

    log_audit_event(
        db,
        event_type="INVESTIGATION_REQUIRED",
        description=f"Document referred for investigation by {current_user.full_name or current_user.name}: {reason}",
        document_id=document_id,
        user_id=current_user.id,
        details={"reason": reason},
        commit=False,
    )
    log_audit_event(
        db,
        event_type="REVIEW_COMPLETED",
        description="Review completed with action INVESTIGATION_REQUIRED",
        document_id=document_id,
        user_id=current_user.id,
        commit=False,
    )

    db.commit()
    return {"status": "INVESTIGATION_REQUIRED", "decision": "INVESTIGATION_REQUIRED", "document_id": document_id, "notes": reason}


def build_verified_record_response(document_id: int, db: Session) -> dict:
    """Derives genuine verified record: original extracted fields + approved corrections + review decision."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    fields = db.query(ExtractedField).filter(
        ExtractedField.document_id == document_id
    ).order_by(ExtractedField.id).all()

    corrections = db.query(FieldCorrection).filter(
        FieldCorrection.document_id == document_id
    ).all()

    latest_review = db.query(Review).filter(
        Review.document_id == document_id
    ).order_by(Review.created_at.desc()).first()

    reviewer_user = None
    if latest_review:
        reviewer_user = db.query(User).filter(User.id == latest_review.reviewer_id).first()

    # Build fields dict from effective values (preserving None for missing fields)
    fields_dict = {}
    for f in fields:
        if f.value is not None and f.value != "":
            fields_dict[f.field_name] = f.value
        elif f.raw_value is not None and f.raw_value != "":
            fields_dict[f.field_name] = f.raw_value
        if f.unit:
            fields_dict[f"{f.field_name}_unit"] = f.unit

    return {
        "document_id": doc.id,
        "verification_status": doc.status,
        "is_verified": doc.status == "VERIFIED",
        "fields": fields_dict,
        "corrections_count": len(corrections),
        "review": {
            "reviewer_id": latest_review.reviewer_id,
            "reviewer_name": (reviewer_user.full_name or reviewer_user.name) if reviewer_user else "Verification Officer",
            "action": latest_review.action,
            "decision": latest_review.decision or latest_review.action,
            "notes": latest_review.notes,
            "reviewed_at": latest_review.created_at.isoformat() if latest_review.created_at else None,
        } if latest_review else None,
    }


@router.get("/documents/{document_id}/verified-record", response_model=VerifiedRecordResponse)
def get_verified_record(document_id: int, db: Session = Depends(get_db)):
    """
    Get the official verified land record representation.
    Section 14: Never overwrites raw extraction. Derived from original fields + approved corrections + review decision.
    """
    return build_verified_record_response(document_id, db)


@router.get("/review-queue")
def get_review_queue(db: Session = Depends(get_db)):
    """
    Get documents pending officer review from PostgreSQL.
    Section 16: Sort order: Critical/High priority first, then oldest pending.
    Proper empty state when no pending documents exist.
    """
    # Priority sorting: CRITICAL = 1, HIGH = 2, MEDIUM = 3, LOW = 4, else 5
    priority_order = case(
        (Document.risk_level == "CRITICAL", 1),
        (Document.risk_level == "HIGH", 2),
        (Document.risk_level.in_(["MEDIUM", "MODERATE"]), 3),
        (Document.risk_level == "LOW", 4),
        else_=5,
    )

    docs = db.query(Document).filter(
        Document.status.in_(["REVIEW_REQUIRED", "READY_FOR_APPROVAL", "INVESTIGATION_REQUIRED"])
    ).order_by(priority_order.asc(), Document.created_at.asc()).all()

    return [
        {
            "id": doc.id,
            "original_filename": doc.original_filename,
            "village": doc.village,
            "khasra_number": doc.khasra_number,
            "risk_score": doc.risk_score,
            "risk_level": doc.risk_level or "INSUFFICIENT_DATA",
            "status": doc.status,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
        }
        for doc in docs
    ]


@router.get("/documents/{document_id}/export")
def export_document(document_id: int, db: Session = Depends(get_db)):
    """
    Export verified document as JSON with genuine provenance, validation outcomes, and audit history.
    Section 15: Zero dummy values.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    fields = db.query(ExtractedField).filter(
        ExtractedField.document_id == document_id
    ).order_by(ExtractedField.id).all()

    corrections = db.query(FieldCorrection).filter(
        FieldCorrection.document_id == document_id
    ).order_by(FieldCorrection.created_at).all()

    reviews = db.query(Review).filter(
        Review.document_id == document_id
    ).order_by(Review.created_at.desc()).all()

    validation_results = db.query(ValidationResult).filter(
        ValidationResult.document_id == document_id
    ).order_by(ValidationResult.id).all()

    latest_review = reviews[0] if reviews else None
    reviewer_user = None
    if latest_review:
        reviewer_user = db.query(User).filter(User.id == latest_review.reviewer_id).first()

    field_map = {f.field_name: f.value for f in fields if f.value is not None}

    # Validation summary counts
    val_summary = {
        "total_rules": len(validation_results),
        "passed": sum(1 for vr in validation_results if vr.status == "PASS"),
        "failed": sum(1 for vr in validation_results if vr.status in ("FAIL", "AMBIGUOUS")),
        "discrepancy_count": sum(1 for vr in validation_results if vr.status in ("FAIL", "AMBIGUOUS")),
        "warnings": sum(1 for vr in validation_results if vr.status in ("WARN", "WARNING")),
        "skipped": sum(1 for vr in validation_results if vr.status in ("SKIP", "REFERENCE_DATA_NOT_FOUND")),
    }

    return {
        "document_id": doc.id,
        "original_filename": doc.original_filename,
        "verification_status": doc.status,
        "is_verified": doc.status == "VERIFIED",
        "reviewer": {
            "reviewer_id": latest_review.reviewer_id,
            "reviewer_name": (reviewer_user.full_name or reviewer_user.name) if reviewer_user else "Verification Officer",
            "action": latest_review.action,
            "decision": latest_review.decision or latest_review.action,
            "notes": latest_review.notes,
            "reviewed_at": latest_review.created_at.isoformat() if latest_review.created_at else None,
        } if latest_review else None,
        "timestamps": {
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "updated_at": doc.updated_at.isoformat() if doc.updated_at else None,
        },
        "risk_assessment": {
            "risk_score": doc.risk_score,
            "risk_level": doc.risk_level or "INSUFFICIENT_DATA",
        },
        "status": doc.status,
        "fields": field_map,
        "structured_fields": field_map,
        "verified_fields": field_map,
        "extracted_fields": [
            {
                "field_id": f.id,
                "field_name": f.field_name,
                "raw_value": f.raw_value,
                "effective_value": f.value,
                "normalized_value": f.normalized_value,
                "unit": f.unit,
                "confidence": f.confidence,
                "provenance": {
                    "source_page": f.source_page,
                    "source_region_id": f.source_region_id,
                    "source_detection_id": f.source_detection_id,
                    "table_extraction_id": f.table_extraction_id,
                    "source_text": f.source_text,
                    "extraction_method": f.extraction_method,
                },
                "verification_status": f.verification_status,
            }
            for f in fields
        ],
        "corrections": [
            {
                "id": c.id,
                "field_name": c.field_name,
                "previous_value": c.previous_value,
                "new_value": c.new_value,
                "reason": c.reason,
                "changed_by": c.changed_by,
                "changed_at": c.changed_at.isoformat() if c.changed_at else None,
            }
            for c in corrections
        ],
        "validation_summary": val_summary,
        "validation_results": [
            {
                "rule_code": vr.rule_code,
                "rule": vr.rule,
                "status": vr.status,
                "severity": vr.severity,
                "message": vr.message,
                "uploaded_value": vr.uploaded_value,
                "recommendation": vr.recommendation,
            }
            for vr in validation_results
        ],
    }
