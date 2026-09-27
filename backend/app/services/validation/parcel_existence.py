"""Parcel existence validator."""
from typing import Optional
from sqlalchemy.orm import Session
from app.services.validation.base import Validator, ValidationResultData
from app.services.validation.reference_matcher import match_reference_parcel, MatchResult


class ParcelExistenceValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        # Use pre-resolved match from context if available, otherwise match directly
        match_result: MatchResult
        if context and "match_result" in context:
            match_result = context["match_result"]
        else:
            match_result = match_reference_parcel(fields, db)
            if context is not None:
                context["match_result"] = match_result
                context["parcel"] = match_result.parcel

        results = []

        if match_result.status == "MATCHED":
            p = match_result.parcel
            results.append(ValidationResultData(
                rule="Parcel Existence",
                rule_code="PARCEL_EXISTS",
                status="PASS",
                severity="INFO",
                message=match_result.message,
                uploaded_value=match_result.uploaded_value,
                reference_values={
                    "parcel_id": p.id,
                    "khasra_number": p.khasra_number,
                    "village": p.village,
                    "tehsil": p.tehsil,
                    "district": p.district,
                    "recorded_area": p.area,
                    "area_unit": p.area_unit,
                } if p else None,
                evidence=match_result.evidence,
                recommendation="Parcel verified in cadastral registry.",
            ))
        elif match_result.status == "MULTIPLE_REFERENCE_MATCHES":
            results.append(ValidationResultData(
                rule="Parcel Existence",
                rule_code="MULTIPLE_REFERENCE_MATCHES",
                status="AMBIGUOUS",
                severity="CRITICAL",
                message=match_result.message,
                uploaded_value=match_result.uploaded_value,
                reference_values={
                    "candidate_parcel_ids": [cp.id for cp in match_result.candidate_parcels],
                    "count": len(match_result.candidate_parcels),
                },
                evidence=match_result.evidence,
                recommendation=match_result.recommendation or "Officer review required to disambiguate reference parcel.",
            ))
        else:  # PARCEL_NOT_FOUND
            results.append(ValidationResultData(
                rule="Parcel Existence",
                rule_code="PARCEL_NOT_FOUND",
                status="FAIL",
                severity="CRITICAL",
                message=match_result.message,
                uploaded_value=match_result.uploaded_value,
                reference_values=None,
                evidence=[],
                recommendation=match_result.recommendation or "Verify parcel number or verify with sub-registrar office.",
            ))

        return results
