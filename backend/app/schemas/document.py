"""Document schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentCreate(BaseModel):
    pass  # File is uploaded via multipart form


class DocumentOut(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: Optional[int] = None
    status: str
    village: Optional[str] = None
    khasra_number: Optional[str] = None
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    page_count: int = 0

    class Config:
        from_attributes = True


class DocumentList(BaseModel):
    documents: list[DocumentOut]
    total: int
