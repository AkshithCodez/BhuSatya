"""Extraction schemas with data provenance."""
from pydantic import BaseModel
from typing import Optional


class ExtractedFieldOut(BaseModel):
    id: int
    document_id: int
    field_name: str
    value: Optional[str] = None
    normalized_value: Optional[str] = None
    unit: Optional[str] = None
    confidence: Optional[float] = None
    source_page: Optional[int] = None
    source_detection_id: Optional[str] = None
    source_text: Optional[str] = None
    extraction_method: Optional[str] = None
    verification_status: str = "UNVERIFIED"

    class Config:
        from_attributes = True


class FieldUpdateRequest(BaseModel):
    value: str
    reason: Optional[str] = None


class TableExtractionOut(BaseModel):
    id: int
    region_id: int
    document_id: int
    raw_text: Optional[str] = None
    extraction_method: str

    class Config:
        from_attributes = True


class ManualTextInput(BaseModel):
    text: str
