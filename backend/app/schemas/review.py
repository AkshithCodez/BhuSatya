"""Review schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewRequest(BaseModel):
    action: str  # APPROVE, REJECT, INVESTIGATE, REVIEW
    notes: Optional[str] = None
    override_reason: Optional[str] = None


class ApproveRequest(BaseModel):
    notes: Optional[str] = None
    override_reason: Optional[str] = None


class DecisionRequest(BaseModel):
    notes: Optional[str] = None
    reason: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    document_id: int
    reviewer_id: int
    action: str
    decision: Optional[str] = None
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


class ReviewerInfo(BaseModel):
    reviewer_id: int
    reviewer_name: Optional[str] = None
    action: str
    decision: Optional[str] = None
    notes: Optional[str] = None
    reviewed_at: Optional[str] = None


class VerifiedRecordResponse(BaseModel):
    document_id: int
    verification_status: str
    is_verified: bool
    fields: dict
    corrections_count: int
    review: Optional[ReviewerInfo] = None

