"""Registration record cross-check validator."""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.land_record import RegistrationRecord, Parcel
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class RegistrationValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []
        reg_no = (fields.get("registration_number") or "").strip()

        if not reg_no:
            return results

        record = db.query(RegistrationRecord).filter(
            RegistrationRecord.registration_number == reg_no
        ).first()

        if record:
            evidence = [
                ValidationEvidence(
                    source=f"Sub-Registrar Office ({record.document_type or 'Sale Deed'})",
                    value=f"Reg #{record.registration_number}, Date: {record.registration_date or 'N/A'}, Parcel ID: {record.parcel_id}",
                )
            ]

            ref_parcel: Optional[Parcel] = context.get("parcel") if context else None
            if ref_parcel and record.parcel_id and record.parcel_id != ref_parcel.id:
                results.append(ValidationResultData(
                    rule="Registration Record Consistency",
                    rule_code="REGISTRATION_PARCEL_MISMATCH",
                    status="FAIL",
                    severity="HIGH",
                    message=f"Registration #{reg_no} is registered to parcel #{record.parcel_id}, not current parcel #{ref_parcel.id} ({ref_parcel.khasra_number}).",
                    uploaded_value=reg_no,
                    reference_values={"record_parcel_id": record.parcel_id, "current_parcel_id": ref_parcel.id},
                    evidence=evidence,
                    recommendation="Investigate registration deed cross-indexing.",
                ))
            else:
                results.append(ValidationResultData(
                    rule="Registration Record Consistency",
                    rule_code="REGISTRATION_EXISTS",
                    status="PASS",
                    severity="INFO",
                    message=f"Registration #{reg_no} verified against sub-registrar database.",
                    uploaded_value=reg_no,
                    reference_values={
                        "registration_id": record.id,
                        "document_type": record.document_type,
                        "registration_date": record.registration_date,
                    },
                    evidence=evidence,
                ))
        else:
            results.append(ValidationResultData(
                rule="Registration Record Consistency",
                rule_code="REGISTRATION_NOT_FOUND",
                status="WARN",
                severity="MEDIUM",
                message=f"Registration #{reg_no} not found in sub-registrar reference database.",
                uploaded_value=reg_no,
                evidence=[],
                recommendation="Verify deed registration number with local Sub-Registrar Office.",
            ))

        return results

