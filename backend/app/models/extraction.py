"""TableExtraction and ExtractedField ORM models."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, func

from app.db.database import Base


class TableExtraction(Base):
    __tablename__ = "table_extractions"

    id = Column(Integer, primary_key=True, index=True)
    detected_region_id = Column(Integer, ForeignKey("detected_regions.id"), nullable=True)
    region_id = Column(Integer, nullable=True)  # Backwards compatibility alias
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    provider = Column(String, default="mock")  # mock, manual, ocr, paddle_ocr, custom
    extraction_method = Column(String, nullable=False, default="mock")
    raw_text = Column(Text)
    structured_raw_output = Column(Text)  # JSON representation of extracted rows/cols
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())

    def __init__(self, **kwargs):
        if "region_id" in kwargs and "detected_region_id" not in kwargs:
            kwargs["detected_region_id"] = kwargs["region_id"]
        elif "detected_region_id" in kwargs and "region_id" not in kwargs:
            kwargs["region_id"] = kwargs["detected_region_id"]
        super().__init__(**kwargs)


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    document_page_id = Column(Integer, ForeignKey("document_pages.id"), nullable=True)
    source_region_id = Column(Integer, ForeignKey("detected_regions.id"), nullable=True)
    source_detection_id = Column(String)
    table_extraction_id = Column(Integer, ForeignKey("table_extractions.id"), nullable=True)

    field_name = Column(String, nullable=False)
    raw_value = Column(String)
    value = Column(String)  # Current value (synced with raw_value or corrected)
    normalized_value = Column(String)
    unit = Column(String)
    confidence = Column(Float)

    source_page = Column(Integer)
    source_text = Column(Text)
    extraction_method = Column(String)
    verification_status = Column(String, default="UNVERIFIED")
    # UNVERIFIED, CONFIRMED, CORRECTED, FLAGGED

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
