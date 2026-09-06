"""Parcel format validator."""
import re
from sqlalchemy.orm import Session
from app.services.validation.base import Validator, ValidationResultData


class ParcelFormatValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []
        khasra = fields.get("khasra_number", "")
        if not khasra:
            return results

        # Common Khasra formats: 145, 145/2, 145/2-A, 145/2/3
        pattern = r'^\d+(/\d+)*(-[A-Za-z])?$'
        if re.match(pattern, khasra):
            results.append(ValidationResultData(
                rule="PARCEL_FORMAT",
                status="PASS",
                message=f"Khasra number '{khasra}' has valid format",
            ))
        else:
            results.append(ValidationResultData(
                rule="PARCEL_FORMAT",
                status="WARN",
                severity="MEDIUM",
                message=f"Khasra number '{khasra}' has unusual format",
                uploaded_value=khasra,
                recommendation="Verify format is correct for this jurisdiction",
            ))

        return results
