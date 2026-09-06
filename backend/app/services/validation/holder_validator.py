"""Holder name validator."""
from sqlalchemy.orm import Session
from app.models.land_record import Parcel, ParcelRight, Person
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class HolderValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []
        holder = fields.get("holder_name", "")
        khasra = fields.get("khasra_number", "")

        if not holder or not khasra:
            return results

        parcel = db.query(Parcel).filter(Parcel.khasra_number == khasra).first()
        if not parcel:
            return results

        # Get current right holders
        current_rights = db.query(ParcelRight).filter(
            ParcelRight.parcel_id == parcel.id,
        ).all()

        holder_normalized = holder.lower().strip()
        found_match = False
        evidence = []

        for right in current_rights:
            person = db.query(Person).filter(Person.id == right.person_id).first()
            if person:
                person_name = person.name.lower().strip()
                evidence.append(ValidationEvidence(
                    source=f"{'Current' if right.is_current else 'Historical'} Right Holder",
                    value=f"{person.name} (Share: {right.share})",
                ))
                if holder_normalized in person_name or person_name in holder_normalized:
                    found_match = True

        if found_match:
            results.append(ValidationResultData(
                rule="HOLDER_MATCH",
                status="PASS",
                message=f"Holder '{holder}' found in parcel records",
                evidence=evidence,
            ))
        elif evidence:
            results.append(ValidationResultData(
                rule="HOLDER_MATCH",
                status="WARN",
                severity="MEDIUM",
                message=f"Holder '{holder}' does not match current right holders",
                uploaded_value=holder,
                evidence=evidence,
                recommendation="Verify if this is a previous holder or a name variation",
            ))

        return results
