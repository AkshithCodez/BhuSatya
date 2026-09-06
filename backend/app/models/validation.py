"""Validation result ORM model."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, func

from app.db.database import Base


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    rule = Column(String, nullable=False)
    status = Column(String, nullable=False)  # PASS, FAIL, WARN, INFO, SKIP
    severity = Column(String)  # LOW, MEDIUM, HIGH, CRITICAL
    message = Column(Text, nullable=False)
    uploaded_value = Column(String)
    evidence = Column(Text)  # JSON string
    recommendation = Column(String)
    created_at = Column(DateTime, server_default=func.now())
