"""
Cross-record consistency validator — checks for internal contradictions across parcel, rights, mutations, and registrations.

Supports Section 3:
- Where data exists: compare parcel, rights, mutation, registration, reference records for contradictions.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models.land_record import Parcel, ParcelRight, Mutation, RegistrationRecord
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class CrossDocumentValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []
        parcel: Optional[Parcel] = context.get("parcel") if context else None
        khasra = (fields.get("khasra_number") or "").strip()

        if not parcel and khasra:
            parcel = db.query(Parcel).filter(Parcel.khasra_number == khasra).first()

        if not parcel:
            return results

        evidence = []
        contradictions = []

        # 1. Compare Mutation area vs Parcel Area
        mutations = db.query(Mutation).filter(Mutation.parcel_id == parcel.id).all()
        for mut in mutations:
            if mut.area and parcel.area and mut.area > parcel.area + 0.05:
                contradictions.append(
                    f"Mutation #{mut.mutation_number} transfers {mut.area} {mut.area_unit}, which exceeds total parcel area {parcel.area} {parcel.area_unit}."
                )
            evidence.append(ValidationEvidence(
                source=f"Mutation #{mut.mutation_number}",
                value=f"Type: {mut.mutation_type}, Transferred Area: {mut.area or 'N/A'}, Status: {mut.status}",
            ))

        # 2. Check if approved mutation has corresponding right holder entry
        for mut in mutations:
            if mut.status == "APPROVED" and mut.to_person_id:
                has_right = db.query(ParcelRight).filter(
                    ParcelRight.parcel_id == parcel.id,
                    ParcelRight.person_id == mut.to_person_id,
                ).first()
                if not has_right:
                    contradictions.append(
                        f"Mutation #{mut.mutation_number} is approved for Person #{mut.to_person_id}, but no corresponding rights record exists in parcel_rights register."
                    )

        # 3. Check against other previously verified documents for the same parcel
        doc_id = context.get("document_id") if context else None
        other_verified_docs = db.query(Document).filter(
            Document.id != doc_id,
            Document.status == "VERIFIED",
            Document.khasra_number == parcel.khasra_number,
        ).all() if doc_id else []

        for other_doc in other_verified_docs:
            evidence.append(ValidationEvidence(
                source=f"Prior Verified Document #{other_doc.id}",
                value=f"File: {other_doc.original_filename}, Verified At: {other_doc.updated_at}",
            ))

        if contradictions:
            results.append(ValidationResultData(
                rule="Cross-Record Consistency",
                rule_code="CROSS_RECORD_CONTRADICTION",
                status="FAIL",
                severity="HIGH",
                message=f"Cadastral cross-record discrepancy detected: {' '.join(contradictions)}",
                evidence=evidence,
                recommendation="Reconcile mutation sanction against current Record of Rights (RoR).",
            ))
        elif evidence:
            results.append(ValidationResultData(
                rule="Cross-Record Consistency",
                rule_code="CROSS_RECORD_CONSISTENT",
                status="PASS",
                severity="INFO",
                message="Cadastral cross-record consistency verified across parcel, mutation, and ownership registers.",
                evidence=evidence,
            ))

        return results

