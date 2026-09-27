"""Validation schemas with evidence."""
from pydantic import BaseModel
from typing import Optional


class EvidenceItem(BaseModel):
    source: str
    value: str


class ValidationResultOut(BaseModel):
    id: Optional[int] = None
    rule_code: str = "RULE_UNKNOWN"
    rule: str
    status: str  # PASS, WARNING, WARN, FAIL, SKIP, REFERENCE_DATA_NOT_FOUND, AMBIGUOUS
    severity: Optional[str] = None  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    message: str
    uploaded_value: Optional[str] = None
    reference_values: Optional[dict] = None
    evidence: list[EvidenceItem] = []
    recommendation: Optional[str] = None
    extracted_field_id: Optional[int] = None

    class Config:
        from_attributes = True


class ValidationResponse(BaseModel):
    document_id: int
    risk_score: Optional[float] = None
    risk_level: str
    results: list[ValidationResultOut]


class RiskScore(BaseModel):
    score: Optional[float] = None
    level: str  # LOW, MODERATE, HIGH, CRITICAL, INSUFFICIENT_DATA
    summary: str
