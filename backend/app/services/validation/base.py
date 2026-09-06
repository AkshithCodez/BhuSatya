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
    status: str  # PASS, FAIL, WARN, INFO, SKIP
    severity: Optional[str] = None  # LOW, MEDIUM, HIGH, CRITICAL
    message: str = ""
    uploaded_value: Optional[str] = None
    evidence: list[ValidationEvidence] = field(default_factory=list)
    recommendation: Optional[str] = None


class Validator(ABC):
    """Base class for all validators."""

    @abstractmethod
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        """
        Run validation checks against the extracted fields.

        Args:
            fields: Dict of field_name -> normalized_value
            db: Database session for reference lookups

        Returns:
            List of validation results.
        """
        ...
