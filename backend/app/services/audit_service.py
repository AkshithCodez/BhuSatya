"""Audit service — append-only event logging."""
import json
import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

logger = logging.getLogger(__name__)


def log_audit_event(
    db: Session,
    event_type: str,
    description: str,
    document_id: Optional[int] = None,
    user_id: Optional[int] = None,
    details: Optional[dict] = None,
):
    """Create an append-only audit event."""
    event = AuditEvent(
        document_id=document_id,
        event_type=event_type,
        description=description,
        user_id=user_id,
        details=json.dumps(details) if details else None,
    )
    db.add(event)
    db.commit()
    logger.info(f"Audit: [{event_type}] {description}")
    return event
