"""
Holder name validator — compares extracted landowner against cadastral right holders.

Supports Section 6:
- Safe formatting normalization (case, whitespace, punctuation, common title prefixes).
- No aggressive fuzzy matching that merges distinct identities.
- Exposes similarity scores as supporting evidence.
- Distinguishes current vs historical right holders.
"""
import re
from difflib import SequenceMatcher
from typing import Optional
from sqlalchemy.orm import Session

from app.models.land_record import Parcel, ParcelRight, Person
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence

TITLE_PREFIXES = {"shri", "smt", "shrimati", "mr", "mrs", "ms", "dr", "late", "kumari", "km"}


def normalize_person_name(name: str) -> str:
    """Normalize safe formatting differences: case, punctuation, extra whitespace, title prefixes."""
    if not name:
        return ""
    # Remove punctuation
    cleaned = re.sub(r"[^\w\s]", " ", name.lower())
    tokens = cleaned.split()
    # Filter title prefixes from start
    while tokens and tokens[0] in TITLE_PREFIXES:
        tokens.pop(0)
    return " ".join(tokens)


def compute_similarity(str1: str, str2: str) -> float:
    """Compute character similarity ratio between two normalized strings."""
    if not str1 or not str2:
        return 0.0
    return SequenceMatcher(None, str1, str2).ratio()


class HolderValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []
        holder = (fields.get("holder_name") or "").strip()
        father = (fields.get("father_name") or "").strip()
        khasra = (fields.get("khasra_number") or "").strip()

        if not holder:
            return results

        # Find reference parcel
        parcel: Optional[Parcel] = context.get("parcel") if context else None
        if not parcel and khasra:
            parcel = db.query(Parcel).filter(Parcel.khasra_number == khasra).first()

        if not parcel:
            results.append(ValidationResultData(
                rule="Holder Consistency",
                rule_code="HOLDER_MATCH",
                status="SKIP",
                severity="LOW",
                message=f"Cannot validate holder: reference parcel '{khasra or 'N/A'}' not found in cadastral records.",
                uploaded_value=holder,
                recommendation="Reference cadastral record required to verify land ownership.",
            ))
            return results

        # Get all registered rights for this parcel
        rights = db.query(ParcelRight).filter(
            ParcelRight.parcel_id == parcel.id,
        ).all()

        if not rights:
            results.append(ValidationResultData(
                rule="Holder Consistency",
                rule_code="HOLDER_MATCH",
                status="SKIP",
                severity="LOW",
                message=f"No right holder reference records found for parcel '{parcel.khasra_number}'.",
                uploaded_value=holder,
                recommendation="Register cadastral rights records for this parcel.",
            ))
            return results

        norm_extracted = normalize_person_name(holder)
        norm_father_extracted = normalize_person_name(father) if father else ""

        current_match = None
        historical_match = None
        best_sim = 0.0
        evidence = []
        ref_holders = []

        for right in rights:
            person = db.query(Person).filter(Person.id == right.person_id).first()
            if not person:
                continue

            norm_db_name = normalize_person_name(person.name)
            sim = compute_similarity(norm_extracted, norm_db_name)
            is_current = bool(right.is_current)

            father_info = f", s/o {person.father_name}" if person.father_name else ""
            status_label = "Current Owner" if is_current else "Historical Holder"

            ref_holders.append({
                "person_id": person.id,
                "name": person.name,
                "father_name": person.father_name,
                "share": right.share,
                "is_current": is_current,
                "similarity": round(sim, 3),
            })

            evidence.append(ValidationEvidence(
                source=f"{status_label} (ParcelRight #{right.id})",
                value=f"{person.name}{father_info} — Share: {right.share} (Match similarity: {int(sim * 100)}%)",
            ))

            if sim > best_sim:
                best_sim = sim

            # Safe matching threshold: exact or >= 0.85
            if sim >= 0.85:
                if is_current and not current_match:
                    current_match = (person, right, sim)
                elif not is_current and not historical_match:
                    historical_match = (person, right, sim)

        # Evaluate outcomes
        if current_match:
            person, right, sim = current_match
            if sim >= 0.98:
                results.append(ValidationResultData(
                    rule="Holder Consistency",
                    rule_code="HOLDER_MATCH",
                    status="PASS",
                    severity="INFO",
                    message=f"Extracted holder '{holder}' matches current registered owner '{person.name}' (Share: {right.share}).",
                    uploaded_value=holder,
                    reference_values={"matched_owner": person.name, "share": right.share, "is_current": True, "similarity": round(sim, 3)},
                    evidence=evidence,
                    recommendation="Landowner identity verified against cadastral rights register.",
                ))
            else:
                # Minor spelling variation with similarity score exposed
                results.append(ValidationResultData(
                    rule="Holder Consistency",
                    rule_code="HOLDER_MATCH",
                    status="WARN",
                    severity="LOW",
                    message=f"Extracted holder '{holder}' closely matches current registered owner '{person.name}' ({int(sim * 100)}% match). Check for spelling variation.",
                    uploaded_value=holder,
                    reference_values={"matched_owner": person.name, "share": right.share, "is_current": True, "similarity": round(sim, 3)},
                    evidence=evidence,
                    recommendation="Confirm minor spelling variation with officer review.",
                ))
        elif historical_match:
            person, right, sim = historical_match
            results.append(ValidationResultData(
                rule="Holder Consistency",
                rule_code="HOLDER_MATCH",
                status="WARN",
                severity="MEDIUM",
                message=f"Holder '{holder}' matches historical previous owner '{person.name}' ({right.source or 'Prior RoR'}), not the current registered owner.",
                uploaded_value=holder,
                reference_values={"matched_owner": person.name, "is_current": False, "source": right.source},
                evidence=evidence,
                recommendation="Verify deed chain — document may reflect prior ownership prior to subsequent mutation.",
            ))
        else:
            results.append(ValidationResultData(
                rule="Holder Consistency",
                rule_code="HOLDER_MATCH",
                status="FAIL",
                severity="HIGH",
                message=f"Holder '{holder}' does not match registered right holders for this parcel (Highest similarity: {int(best_sim * 100)}%).",
                uploaded_value=holder,
                reference_values={"registered_holders": ref_holders},
                evidence=evidence,
                recommendation="Investigate ownership discrepancy. Verify identity proof against revenue records.",
            ))

        return results

