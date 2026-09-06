"""Mutation validator."""
from sqlalchemy.orm import Session
from app.models.land_record import Mutation, Parcel
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class MutationValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []
        mutation_no = fields.get("mutation_number", "")
        khasra = fields.get("khasra_number", "")

        if not mutation_no:
            return results

        mutation = db.query(Mutation).filter(
            Mutation.mutation_number == mutation_no
        ).first()

        if not mutation:
            results.append(ValidationResultData(
                rule="MUTATION_EXISTS",
                status="FAIL",
                severity="HIGH",
                message=f"Mutation #{mutation_no} not found in records",
                uploaded_value=mutation_no,
                recommendation="Verify mutation number is correct",
            ))
            return results

        results.append(ValidationResultData(
            rule="MUTATION_EXISTS",
            status="PASS",
            message=f"Mutation #{mutation_no} exists in records",
        ))

        # Check if mutation references the same parcel
        if khasra:
            parcel = db.query(Parcel).filter(
                Parcel.id == mutation.parcel_id
            ).first()

            if parcel and parcel.khasra_number != khasra:
                results.append(ValidationResultData(
                    rule="MUTATION_PARCEL_MATCH",
                    status="FAIL",
                    severity="HIGH",
                    message=f"Mutation #{mutation_no} references parcel {parcel.khasra_number}, not {khasra}",
                    uploaded_value=khasra,
                    evidence=[
                        ValidationEvidence(
                            source=f"Mutation #{mutation_no}",
                            value=f"References Khasra {parcel.khasra_number}"
                        )
                    ],
                    recommendation="Verify parcel and mutation association",
                ))
            elif parcel:
                results.append(ValidationResultData(
                    rule="MUTATION_PARCEL_MATCH",
                    status="PASS",
                    message=f"Mutation #{mutation_no} correctly references parcel {khasra}",
                ))

        return results
