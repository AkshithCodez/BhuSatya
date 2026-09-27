from typing import Optional
from sqlalchemy.orm import Session
from app.services.validation.base import Validator, ValidationResultData


REQUIRED_FIELDS = ["khasra_number", "holder_name", "area"]
RECOMMENDED_FIELDS = ["village", "khata_number", "mutation_number"]


class RequiredFieldsValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []

        for f in REQUIRED_FIELDS:
            val = fields.get(f)
            if val:
                results.append(ValidationResultData(
                    rule="Required Field Check",
                    rule_code="REQUIRED_FIELD_PRESENT",
                    status="PASS",
                    severity="INFO",
                    message=f"Mandatory field '{f}' is present.",
                    uploaded_value=str(val),
                ))
            else:
                results.append(ValidationResultData(
                    rule="Required Field Check",
                    rule_code="REQUIRED_FIELD_MISSING",
                    status="FAIL",
                    severity="HIGH",
                    message=f"Mandatory land record field '{f}' is missing from extraction.",
                    recommendation="Ensure this field is extracted or entered manually by the verification officer.",
                ))

        for f in RECOMMENDED_FIELDS:
            val = fields.get(f)
            if not val:
                results.append(ValidationResultData(
                    rule="Recommended Field Check",
                    rule_code="RECOMMENDED_FIELD_MISSING",
                    status="WARN",
                    severity="LOW",
                    message=f"Recommended field '{f}' is not extracted.",
                    recommendation=f"Review deed for '{f}' if applicable.",
                ))

        return results

