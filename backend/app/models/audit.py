"""AuditEvent ORM model — append-only audit trail."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func

from app.db.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    event_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    details = Column(Text)  # JSON string for additional context
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
