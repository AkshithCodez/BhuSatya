"""Base validator interface."""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
from sqlalchemy.orm import Session


@dataclass
class ValidationEvidence:
    source: str
    value: str


@dataclass
class ValidationResultData:
    rule: str
    status: str  # PASS, WARNING, WARN, FAIL, SKIP, REFERENCE_DATA_NOT_FOUND, AMBIGUOUS
    rule_code: str = "RULE_UNKNOWN"
    severity: Optional[str] = None  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    message: str = ""
    uploaded_value: Optional[str] = None
    reference_values: Optional[dict] = None
    evidence: list[ValidationEvidence] = field(default_factory=list)
    recommendation: Optional[str] = None
    extracted_field_id: Optional[int] = None


class Validator(ABC):
    """Base class for all validators."""

    @abstractmethod
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        """
        Run validation checks against the extracted fields.

        Args:
            fields: Dict of field_name -> normalized_value
            db: Database session for reference lookups
            context: Optional shared resolution context (e.g. matched reference parcel)

        Returns:
            List of validation results.
        """
        ...
