"""Review and FieldCorrection ORM models."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func

from app.db.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # APPROVE, REJECT, INVESTIGATE, REVIEW
    decision = Column(String)  # APPROVE, REJECT, INVESTIGATION_REQUIRED
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    reviewed_at = Column(DateTime, server_default=func.now())


class FieldCorrection(Base):
    __tablename__ = "field_corrections"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("extracted_fields.id"), nullable=False)
    extracted_field_id = Column(Integer)  # Backwards compatibility alias
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    field_name = Column(String, nullable=False)
    previous_value = Column(String)
    new_value = Column(String, nullable=False)
    reason = Column(Text)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
