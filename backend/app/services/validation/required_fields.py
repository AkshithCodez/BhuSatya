"""Required fields validator."""
from sqlalchemy.orm import Session
from app.services.validation.base import Validator, ValidationResultData


REQUIRED_FIELDS = ["khasra_number", "holder_name", "area"]
RECOMMENDED_FIELDS = ["village", "khata_number", "mutation_number"]


class RequiredFieldsValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []

        for f in REQUIRED_FIELDS:
            if f in fields and fields[f]:
                results.append(ValidationResultData(
                    rule="REQUIRED_FIELD",
                    status="PASS",
                    message=f"Required field '{f}' is present",
                ))
            else:
                results.append(ValidationResultData(
                    rule="REQUIRED_FIELD",
                    status="FAIL",
                    severity="HIGH",
                    message=f"Required field '{f}' is missing",
                    recommendation="Ensure this field is extracted or entered manually",
                ))

        for f in RECOMMENDED_FIELDS:
            if f not in fields or not fields[f]:
                results.append(ValidationResultData(
                    rule="RECOMMENDED_FIELD",
                    status="WARN",
                    severity="LOW",
                    message=f"Recommended field '{f}' is missing",
                ))

        return results
