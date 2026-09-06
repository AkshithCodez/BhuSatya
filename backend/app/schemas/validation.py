"""Validation schemas with evidence."""
from pydantic import BaseModel
from typing import Optional


class EvidenceItem(BaseModel):
    source: str
    value: str


class ValidationResultOut(BaseModel):
    id: Optional[int] = None
    rule: str
    status: str  # PASS, FAIL, WARN, INFO, SKIP
    severity: Optional[str] = None
    message: str
    uploaded_value: Optional[str] = None
    evidence: list[EvidenceItem] = []
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True


class ValidationResponse(BaseModel):
    document_id: int
    risk_score: float
    risk_level: str
    results: list[ValidationResultOut]


class RiskScore(BaseModel):
    score: float
    level: str  # LOW, MODERATE, HIGH, CRITICAL
    summary: str
