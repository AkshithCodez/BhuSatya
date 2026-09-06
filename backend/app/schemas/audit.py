"""Audit event schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditEventOut(BaseModel):
    id: int
    document_id: Optional[int] = None
    event_type: str
    description: str
    details: Optional[str] = None
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuditList(BaseModel):
    events: list[AuditEventOut]
    total: int
