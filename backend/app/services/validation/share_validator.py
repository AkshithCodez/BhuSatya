"""Share fraction validator — verifies total share allocation among current right holders."""
from fractions import Fraction
from typing import Optional
from sqlalchemy.orm import Session
from app.models.land_record import ParcelRight, Parcel, Person
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class ShareValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []
        khasra = (fields.get("khasra_number") or "").strip()

        parcel: Optional[Parcel] = context.get("parcel") if context else None
        if not parcel and khasra:
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
        invalid_fractions = []

        for right in current_rights:
            person = db.query(Person).filter(Person.id == right.person_id).first()
            name_str = person.name if person else f"Person #{right.person_id}"
            try:
                share_frac = Fraction(str(right.share).strip())
                total += share_frac
                evidence.append(ValidationEvidence(
                    source=f"Current Right Holder: {name_str}",
                    value=f"Share: {right.share} ({float(share_frac) * 100:.1f}%)",
                ))
            except (ValueError, ZeroDivisionError):
                invalid_fractions.append((name_str, right.share))

        if invalid_fractions:
            results.append(ValidationResultData(
                rule="Share Allocation Consistency",
                rule_code="SHARE_FORMAT_INVALID",
                status="WARN",
                severity="MEDIUM",
                message=f"Invalid share fraction recorded for: {', '.join([f'{name}: {s}' for name, s in invalid_fractions])}.",
                recommendation="Rectify share fraction notation in cadastral rights record.",
            ))

        if total == 1:
            results.append(ValidationResultData(
                rule="Share Allocation Consistency",
                rule_code="SHARE_TOTAL",
                status="PASS",
                severity="INFO",
                message="Total registered shares sum exactly to 100% (1/1).",
                reference_values={"total_shares": str(total), "holder_count": len(current_rights)},
                evidence=evidence,
            ))
        else:
            results.append(ValidationResultData(
                rule="Share Allocation Consistency",
                rule_code="SHARE_TOTAL",
                status="FAIL",
                severity="HIGH",
                message=f"Total registered rights shares sum to {total} ({float(total) * 100:.1f}%), not 100%.",
                reference_values={"total_shares": str(total), "holder_count": len(current_rights)},
                evidence=evidence,
                recommendation="Investigate ownership share deficit/surplus among co-sharers.",
            ))

        return results

