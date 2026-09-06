"""Registration record cross-check validator."""
from sqlalchemy.orm import Session
from app.models.land_record import RegistrationRecord
from app.services.validation.base import Validator, ValidationResultData


class RegistrationValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []
        reg_no = fields.get("registration_number", "")

        if not reg_no:
            return results

        record = db.query(RegistrationRecord).filter(
            RegistrationRecord.registration_number == reg_no
        ).first()

        if record:
            results.append(ValidationResultData(
                rule="REGISTRATION_EXISTS",
                status="PASS",
                message=f"Registration #{reg_no} found in records",
            ))
        else:
            results.append(ValidationResultData(
                rule="REGISTRATION_EXISTS",
                status="WARN",
                severity="MEDIUM",
                message=f"Registration #{reg_no} not found in reference data",
                uploaded_value=reg_no,
                recommendation="Verify registration number with sub-registrar office",
            ))

        return results
