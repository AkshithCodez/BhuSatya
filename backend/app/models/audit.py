"""AuditEvent ORM model — append-only audit trail."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func

from app.db.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    event_type = Column(String, nullable=False)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)

    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)

    description = Column(Text, nullable=False)
    details = Column(Text, nullable=True)  # JSON string for additional context
    metadata_json = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
