"""TableExtraction and ExtractedField ORM models."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, func

from app.db.database import Base


class TableExtraction(Base):
    __tablename__ = "table_extractions"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("extracted_regions.id"), nullable=False)
    document_id = Column(Integer, nullable=False)
    raw_text = Column(Text)
    extraction_method = Column(String, nullable=False)  # temporary_mock, manual, ocr, custom_model
    created_at = Column(DateTime, server_default=func.now())


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    field_name = Column(String, nullable=False)
    value = Column(String)
    normalized_value = Column(String)
    unit = Column(String)
    confidence = Column(Float)
    source_page = Column(Integer)
    source_detection_id = Column(String)
    source_text = Column(Text)
    extraction_method = Column(String)
    verification_status = Column(String, default="UNVERIFIED")
    # UNVERIFIED, CONFIRMED, CORRECTED, FLAGGED
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
