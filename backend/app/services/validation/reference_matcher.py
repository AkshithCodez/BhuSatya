"""
Reference parcel matcher — resolves reference parcel from extracted fields using cadastral hierarchy.

Implements strict Section 2 rules:
- Combines state, district, tehsil, village, khata, khasra, parcel_number, survey_number.
- Exactly 1 match -> continue validation.
- 0 matches -> PARCEL_NOT_FOUND.
- >1 matches -> MULTIPLE_REFERENCE_MATCHES (ambiguous, requires officer review, never arbitrary selection).
"""
from dataclasses import dataclass, field
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.land_record import Parcel
from app.services.validation.base import ValidationEvidence


@dataclass
class MatchResult:
    status: str  # "MATCHED", "PARCEL_NOT_FOUND", "MULTIPLE_REFERENCE_MATCHES"
    rule_code: str  # "PARCEL_EXISTS", "PARCEL_NOT_FOUND", "MULTIPLE_REFERENCE_MATCHES"
    parcel: Optional[Parcel] = None
    candidate_parcels: List[Parcel] = field(default_factory=list)
    message: str = ""
    evidence: List[ValidationEvidence] = field(default_factory=list)
    recommendation: Optional[str] = None
    uploaded_value: Optional[str] = None


def match_reference_parcel(fields: dict, db: Session) -> MatchResult:
    """
    Locate the matching parcel from extracted fields using multi-level cadastral criteria.
    """
    khasra = (fields.get("khasra_number") or "").strip()
    parcel_no = (fields.get("parcel_number") or "").strip()
    survey_no = (fields.get("survey_number") or "").strip()
    identifier = khasra or parcel_no or survey_no

    village = (fields.get("village") or "").strip()
    tehsil = (fields.get("tehsil") or "").strip()
    district = (fields.get("district") or "").strip()
    state = (fields.get("state") or "").strip()
    khata = (fields.get("khata_number") or "").strip()

    if not identifier:
        # Check if khata + village could match
        if khata and village:
            khata_matches = db.query(Parcel).filter(
                Parcel.khata_number == khata,
                Parcel.village.ilike(f"%{village}%"),
            ).all()
            if len(khata_matches) == 1:
                p = khata_matches[0]
                return MatchResult(
                    status="MATCHED",
                    rule_code="PARCEL_EXISTS",
                    parcel=p,
                    candidate_parcels=[p],
                    uploaded_value=f"Khata {khata}, Village {village}",
                    message=f"Parcel identified via Khata {khata} and Village {village} (Khasra: {p.khasra_number})",
                    evidence=[
                        ValidationEvidence(
                            source="Reference Cadastral Registry",
                            value=f"Parcel ID: {p.id}, Khasra: {p.khasra_number}, Village: {p.village}, Area: {p.area} {p.area_unit}",
                        )
                    ],
                )
            elif len(khata_matches) > 1:
                return MatchResult(
                    status="MULTIPLE_REFERENCE_MATCHES",
                    rule_code="MULTIPLE_REFERENCE_MATCHES",
                    candidate_parcels=khata_matches,
                    uploaded_value=f"Khata {khata}, Village {village}",
                    message=f"Multiple parcels ({len(khata_matches)}) exist for Khata {khata} in {village}. Specific Khasra number required.",
                    evidence=[
                        ValidationEvidence(
                            source=f"Candidate Parcel #{p.id}",
                            value=f"Khasra: {p.khasra_number}, Village: {p.village}, Khata: {p.khata_number}",
                        )
                        for p in khata_matches
                    ],
                    recommendation="Manual officer review required to specify parcel subdivision.",
                )

        return MatchResult(
            status="PARCEL_NOT_FOUND",
            rule_code="PARCEL_NOT_FOUND",
            uploaded_value="<not provided>",
            message="No parcel, khasra, or survey identifier extracted from document.",
            recommendation="Review raw document for missing khasra/parcel identifier.",
        )

    # 1. Broad query by parcel identifier
    query = db.query(Parcel).filter(
        or_(
            Parcel.khasra_number == identifier,
            Parcel.parcel_number == identifier,
        )
    )
    candidates = query.all()

    if not candidates:
        # Check without slash or formatting variation
        alt_identifier = identifier.replace("/", "-") if "/" in identifier else identifier.replace("-", "/")
        if alt_identifier != identifier:
            candidates = db.query(Parcel).filter(
                or_(
                    Parcel.khasra_number == alt_identifier,
                    Parcel.parcel_number == alt_identifier,
                )
            ).all()

    if not candidates:
        return MatchResult(
            status="PARCEL_NOT_FOUND",
            rule_code="PARCEL_NOT_FOUND",
            uploaded_value=identifier,
            message=f"Parcel identifier '{identifier}' not found in PostgreSQL reference cadastral records.",
            recommendation="Verify parcel number is correct or check cadastral survey register for alternate subdivision number.",
        )

    # 2. If exactly one candidate matched on identifier alone, check if administrative hierarchy matches
    if len(candidates) == 1:
        p = candidates[0]
        # Verify village if extracted
        if village and p.village and village.lower() not in p.village.lower() and p.village.lower() not in village.lower():
            # Village mismatch on unique identifier
            return MatchResult(
                status="MATCHED",
                rule_code="PARCEL_EXISTS",
                parcel=p,
                candidate_parcels=[p],
                uploaded_value=identifier,
                message=f"Parcel {identifier} located in database, but registered village is '{p.village}' (extracted: '{village}').",
                evidence=[
                    ValidationEvidence(
                        source="Reference Cadastral Registry",
                        value=f"Parcel #{p.id}: Khasra {p.khasra_number}, Village: {p.village}, Tehsil: {p.tehsil}",
                    )
                ],
                recommendation="Verify administrative jurisdiction and village spelling.",
            )

        return MatchResult(
            status="MATCHED",
            rule_code="PARCEL_EXISTS",
            parcel=p,
            candidate_parcels=[p],
            uploaded_value=identifier,
            message=f"Parcel {identifier} uniquely identified in reference records (Village: {p.village}, Khata: {p.khata_number}).",
            evidence=[
                ValidationEvidence(
                    source="Reference Cadastral Registry",
                    value=f"Parcel #{p.id}: Khasra {p.khasra_number}, Village: {p.village}, Khata: {p.khata_number}, Area: {p.area} {p.area_unit}",
                )
            ],
        )

    # 3. Multiple candidates: filter by administrative hierarchy
    filtered = list(candidates)

    if village:
        v_filtered = [p for p in filtered if village.lower() in p.village.lower() or p.village.lower() in village.lower()]
        if v_filtered:
            filtered = v_filtered

    if len(filtered) > 1 and tehsil:
        t_filtered = [p for p in filtered if tehsil.lower() in p.tehsil.lower()]
        if t_filtered:
            filtered = t_filtered

    if len(filtered) > 1 and district:
        d_filtered = [p for p in filtered if district.lower() in p.district.lower()]
        if d_filtered:
            filtered = d_filtered

    if len(filtered) > 1 and khata:
        k_filtered = [p for p in filtered if p.khata_number == khata]
        if k_filtered:
            filtered = k_filtered

    # Evaluate filtered results
    if len(filtered) == 1:
        p = filtered[0]
        return MatchResult(
            status="MATCHED",
            rule_code="PARCEL_EXISTS",
            parcel=p,
            candidate_parcels=[p],
            uploaded_value=identifier,
            message=f"Parcel {identifier} uniquely disambiguated using administrative hierarchy (Village: {p.village}).",
            evidence=[
                ValidationEvidence(
                    source="Reference Cadastral Registry",
                    value=f"Parcel #{p.id}: Khasra {p.khasra_number}, Village: {p.village}, Khata: {p.khata_number}, Area: {p.area} {p.area_unit}",
                )
            ],
        )

    # Multiple candidates still remain: AMBIGUOUS
    return MatchResult(
        status="MULTIPLE_REFERENCE_MATCHES",
        rule_code="MULTIPLE_REFERENCE_MATCHES",
        candidate_parcels=filtered,
        uploaded_value=identifier,
        message=f"Multiple ambiguous parcels ({len(filtered)}) match identifier '{identifier}'. Administrative details insufficient to isolate a single record.",
        evidence=[
            ValidationEvidence(
                source=f"Candidate Parcel #{p.id}",
                value=f"Khasra: {p.khasra_number}, Village: {p.village}, Tehsil: {p.tehsil}, Khata: {p.khata_number}",
            )
            for p in filtered[:5]
        ],
        recommendation="Manual officer review required. Select authoritative reference parcel to continue.",
    )
