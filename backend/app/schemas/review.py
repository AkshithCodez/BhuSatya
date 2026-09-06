"""Review schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewRequest(BaseModel):
    action: str  # APPROVE, REJECT, INVESTIGATE, REVIEW
    notes: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    document_id: int
    reviewer_id: int
    action: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FieldCorrectionOut(BaseModel):
    id: int
    field_id: int
    field_name: str
    previous_value: Optional[str] = None
    new_value: str
    reason: Optional[str] = None
    changed_by: int
    changed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
