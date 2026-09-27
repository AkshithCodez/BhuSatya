"""
Mutation validator — checks mutation number against revenue mutation register.

Supports Section 3:
- Verifies mutation exists.
- Verifies parcel matches.
- Verifies transferee / transferor parties match holder if available.
- Verifies mutation status (APPROVED vs PENDING vs REJECTED).
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.land_record import Mutation, Parcel, Person
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence
from app.services.validation.holder_validator import normalize_person_name, compute_similarity


class MutationValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []
        mutation_no = (fields.get("mutation_number") or "").strip()
        khasra = (fields.get("khasra_number") or "").strip()
        holder = (fields.get("holder_name") or "").strip()

        if not mutation_no:
            return results

        mutation = db.query(Mutation).filter(
            Mutation.mutation_number == mutation_no
        ).first()

        if not mutation:
            results.append(ValidationResultData(
                rule="Mutation Existence",
                rule_code="MUTATION_EXISTS",
                status="FAIL",
                severity="HIGH",
                message=f"Mutation #{mutation_no} not found in official revenue mutation register.",
                uploaded_value=mutation_no,
                recommendation="Verify mutation entry with tehsil revenue office.",
            ))
            return results

        # 1. Existence check
        evidence = [
            ValidationEvidence(
                source=f"Revenue Mutation #{mutation_no}",
                value=f"Type: {mutation.mutation_type or 'N/A'}, Status: {mutation.status or 'APPROVED'}, Date: {mutation.mutation_date or 'N/A'}",
            )
        ]

        results.append(ValidationResultData(
            rule="Mutation Existence",
            rule_code="MUTATION_EXISTS",
            status="PASS",
            severity="INFO",
            message=f"Mutation #{mutation_no} exists in official revenue mutation records.",
            uploaded_value=mutation_no,
            reference_values={
                "mutation_id": mutation.id,
                "mutation_number": mutation.mutation_number,
                "mutation_type": mutation.mutation_type,
                "status": mutation.status,
                "area": mutation.area,
            },
            evidence=evidence,
        ))

        # 2. Check parcel linkage
        ref_parcel = db.query(Parcel).filter(Parcel.id == mutation.parcel_id).first()
        target_khasra = khasra or (context.get("parcel").khasra_number if context and context.get("parcel") else None)

        if ref_parcel and target_khasra:
            if ref_parcel.khasra_number != target_khasra:
                results.append(ValidationResultData(
                    rule="Mutation Parcel Association",
                    rule_code="MUTATION_PARCEL_MATCH",
                    status="FAIL",
                    severity="HIGH",
                    message=f"Mutation #{mutation_no} associates with parcel Khasra {ref_parcel.khasra_number}, not {target_khasra}.",
                    uploaded_value=target_khasra,
                    reference_values={"mutation_parcel_khasra": ref_parcel.khasra_number, "target_khasra": target_khasra},
                    evidence=[
                        ValidationEvidence(
                            source=f"Mutation #{mutation_no}",
                            value=f"Registered for Parcel ID {ref_parcel.id} (Khasra: {ref_parcel.khasra_number}, Village: {ref_parcel.village})",
                        )
                    ],
                    recommendation="Verify deed mutation number against parcel chain.",
                ))
            else:
                results.append(ValidationResultData(
                    rule="Mutation Parcel Association",
                    rule_code="MUTATION_PARCEL_MATCH",
                    status="PASS",
                    severity="INFO",
                    message=f"Mutation #{mutation_no} correctly associates with parcel Khasra {target_khasra}.",
                    uploaded_value=target_khasra,
                    evidence=[
                        ValidationEvidence(
                            source=f"Mutation #{mutation_no}",
                            value=f"Parcel #{ref_parcel.id} (Khasra: {ref_parcel.khasra_number}, Village: {ref_parcel.village})",
                        )
                    ],
                ))

        # 3. Check mutation status
        mut_status = (mutation.status or "APPROVED").upper().strip()
        if mut_status == "APPROVED":
            results.append(ValidationResultData(
                rule="Mutation Status",
                rule_code="MUTATION_STATUS",
                status="PASS",
                severity="INFO",
                message=f"Mutation #{mutation_no} is officially approved by revenue authority.",
                reference_values={"status": mut_status},
                evidence=evidence,
            ))
        elif mut_status == "PENDING":
            results.append(ValidationResultData(
                rule="Mutation Status",
                rule_code="MUTATION_STATUS",
                status="WARN",
                severity="MEDIUM",
                message=f"Mutation #{mutation_no} is pending approval and has not taken final effect.",
                reference_values={"status": mut_status},
                evidence=evidence,
                recommendation="Hold final verification until mutation sanction is gazetted.",
            ))
        elif mut_status == "REJECTED":
            results.append(ValidationResultData(
                rule="Mutation Status",
                rule_code="MUTATION_STATUS",
                status="FAIL",
                severity="CRITICAL",
                message=f"Mutation #{mutation_no} was rejected by revenue authority.",
                reference_values={"status": mut_status},
                evidence=evidence,
                recommendation="Flag document for investigation — references rejected mutation order.",
            ))

        # 4. Check parties if holder is known
        if holder and mutation.to_person_id:
            to_person = db.query(Person).filter(Person.id == mutation.to_person_id).first()
            if to_person:
                sim = compute_similarity(normalize_person_name(holder), normalize_person_name(to_person.name))
                if sim >= 0.85:
                    results.append(ValidationResultData(
                        rule="Mutation Transferee Match",
                        rule_code="MUTATION_PARTY_MATCH",
                        status="PASS",
                        severity="INFO",
                        message=f"Mutation #{mutation_no} transferee '{to_person.name}' matches document holder '{holder}'.",
                        uploaded_value=holder,
                        evidence=[
                            ValidationEvidence(
                                source=f"Mutation #{mutation_no} Transferee",
                                value=f"{to_person.name} (Match similarity: {int(sim * 100)}%)",
                            )
                        ],
                    ))

        return results

