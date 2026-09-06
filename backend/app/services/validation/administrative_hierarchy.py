"""Administrative hierarchy validator."""
from sqlalchemy.orm import Session
from app.models.land_record import Parcel
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class AdministrativeHierarchyValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []
        village = fields.get("village", "")
        tehsil = fields.get("tehsil", "")
        district = fields.get("district", "")
        state = fields.get("state", "")

        if not village:
            return results

        # Check if village exists in our reference data
        parcel = db.query(Parcel).filter(
            Parcel.village.ilike(f"%{village}%")
        ).first()

        if not parcel:
            results.append(ValidationResultData(
                rule="ADMIN_HIERARCHY",
                status="WARN",
                severity="MEDIUM",
                message=f"Village '{village}' not found in reference data",
                uploaded_value=village,
                recommendation="Verify village name or check for spelling variations",
            ))
            return results

        # Check hierarchy matches
        mismatches = []
        if tehsil and parcel.tehsil.lower() != tehsil.lower():
            mismatches.append(("tehsil", tehsil, parcel.tehsil))
        if district and parcel.district.lower() != district.lower():
            mismatches.append(("district", district, parcel.district))
        if state and parcel.state.lower() != state.lower():
            mismatches.append(("state", state, parcel.state))

        if mismatches:
            evidence = [
                ValidationEvidence(source=f"Reference {m[0]}", value=m[2])
                for m in mismatches
            ]
            results.append(ValidationResultData(
                rule="ADMIN_HIERARCHY",
                status="FAIL",
                severity="HIGH",
                message="Administrative hierarchy mismatch",
                evidence=evidence,
                recommendation="Verify correct village/tehsil/district mapping",
            ))
        else:
            results.append(ValidationResultData(
                rule="ADMIN_HIERARCHY",
                status="PASS",
                message="Village hierarchy matches reference data",
            ))

        return results
