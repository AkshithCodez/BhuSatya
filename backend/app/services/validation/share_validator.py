"""Share fraction validator."""
from fractions import Fraction
from sqlalchemy.orm import Session
from app.models.land_record import ParcelRight, Parcel
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class ShareValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []
        khasra = fields.get("khasra_number", "")

        if not khasra:
            return results

        parcel = db.query(Parcel).filter(Parcel.khasra_number == khasra).first()
        if not parcel:
            return results

        current_rights = db.query(ParcelRight).filter(
            ParcelRight.parcel_id == parcel.id,
            ParcelRight.is_current == 1,
        ).all()

        if not current_rights:
            return results

        total = Fraction(0)
        evidence = []

        for right in current_rights:
            try:
                share = Fraction(right.share)
                total += share
                evidence.append(ValidationEvidence(
                    source=f"Right Holder (ID: {right.person_id})",
                    value=f"Share: {right.share}",
                ))
            except (ValueError, ZeroDivisionError):
                results.append(ValidationResultData(
                    rule="SHARE_TOTAL",
                    status="WARN",
                    severity="MEDIUM",
                    message=f"Invalid share fraction: '{right.share}'",
                ))

        if total == 1:
            results.append(ValidationResultData(
                rule="SHARE_TOTAL",
                status="PASS",
                message="Total shares sum to 1 (100%)",
                evidence=evidence,
            ))
        else:
            results.append(ValidationResultData(
                rule="SHARE_TOTAL",
                status="FAIL",
                severity="HIGH",
                message=f"Total shares sum to {total}, not 1",
                evidence=evidence,
                recommendation="Verify share allocation among right holders",
            ))

        return results
