"""Audit trail router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.audit import AuditEvent
from app.schemas.audit import AuditEventOut, AuditList

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("", response_model=AuditList)
def list_audit_events(
    document_id: int = 0,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List audit events, optionally filtered by document."""
    query = db.query(AuditEvent)
    if document_id > 0:
        query = query.filter(AuditEvent.document_id == document_id)

    total = query.count()
    events = query.order_by(AuditEvent.created_at.desc()).offset(skip).limit(limit).all()

    return AuditList(
        events=[
            AuditEventOut(
                id=e.id,
                document_id=e.document_id,
                event_type=e.event_type,
                description=e.description,
                details=e.details,
                user_id=e.user_id,
                created_at=e.created_at,
            )
            for e in events
        ],
        total=total,
    )
