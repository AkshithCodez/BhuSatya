"""Audit service — append-only event logging with full provenance."""
import json
import logging
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

logger = logging.getLogger(__name__)


def log_audit_event(
    db: Session,
    event_type: str,
    description: str,
    document_id: Optional[int] = None,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    details: Optional[dict] = None,
    metadata_json: Optional[dict] = None,
    commit: bool = True,
) -> AuditEvent:
    """Create an append-only audit event in PostgreSQL."""
    event = AuditEvent(
        document_id=document_id,
        user_id=user_id or 1,  # Default to system / logged officer
        event_type=event_type,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None,
        description=description,
        details=json.dumps(details) if details else None,
        metadata_json=json.dumps(metadata_json) if metadata_json else None,
    )
    db.add(event)
    if commit:
        db.commit()
    logger.info(f"Audit: [{event_type}] {description}")
    return event

