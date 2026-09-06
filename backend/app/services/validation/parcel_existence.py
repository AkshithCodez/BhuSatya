"""Parcel existence validator."""
from sqlalchemy.orm import Session
from app.models.land_record import Parcel
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class ParcelExistenceValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []
        khasra = fields.get("khasra_number", "")
        village = fields.get("village", "")

        if not khasra:
            return results

        query = db.query(Parcel).filter(Parcel.khasra_number == khasra)
        if village:
            query = query.filter(Parcel.village.ilike(f"%{village}%"))

        parcel = query.first()

        if parcel:
            results.append(ValidationResultData(
                rule="PARCEL_EXISTS",
                status="PASS",
                message=f"Parcel {khasra} exists in reference records",
                evidence=[
                    ValidationEvidence(
                        source="Reference Database",
                        value=f"Khasra {khasra}, Village {parcel.village}"
                    )
                ],
            ))
        else:
            results.append(ValidationResultData(
                rule="PARCEL_EXISTS",
                status="FAIL",
                severity="HIGH",
                message=f"Parcel {khasra} not found in reference records",
                uploaded_value=khasra,
                recommendation="Verify parcel number is correct or check alternate numbers",
            ))

        return results
