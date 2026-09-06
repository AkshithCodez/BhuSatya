"""Dashboard schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DashboardStats(BaseModel):
    total_documents: int = 0
    processed: int = 0
    needs_review: int = 0
    verified: int = 0
    high_risk: int = 0


class RecentDocument(BaseModel):
    id: int
    original_filename: str
    village: Optional[str] = None
    khasra_number: Optional[str] = None
    created_at: Optional[datetime] = None
    risk_level: Optional[str] = None
    status: str


class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_documents: list[RecentDocument]
