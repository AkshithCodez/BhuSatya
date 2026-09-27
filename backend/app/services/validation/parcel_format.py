"""Parcel format validator."""
import re
from typing import Optional
from sqlalchemy.orm import Session
from app.services.validation.base import Validator, ValidationResultData


class ParcelFormatValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []
        khasra = (fields.get("khasra_number") or "").strip()
        if not khasra:
            return results

        # Common Khasra formats: 145, 145/2, 145/2-A, 145/2/3, 104/A
        pattern = r'^\d+([/-][A-Za-z0-9]+)*$'
        if re.match(pattern, khasra):
            results.append(ValidationResultData(
                rule="Parcel Format Syntax",
                rule_code="PARCEL_FORMAT",
                status="PASS",
                severity="INFO",
                message=f"Khasra/Parcel number '{khasra}' conforms to cadastral format standards.",
                uploaded_value=khasra,
            ))
        else:
            results.append(ValidationResultData(
                rule="Parcel Format Syntax",
                rule_code="PARCEL_FORMAT_UNUSUAL",
                status="WARN",
                severity="LOW",
                message=f"Khasra number '{khasra}' has unusual format syntax.",
                uploaded_value=khasra,
                recommendation="Verify format is correct for this state cadastral jurisdiction.",
            ))

        return results

