"""Administrative hierarchy validator — compares state, district, tehsil, and village."""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.land_record import Parcel
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class AdministrativeHierarchyValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []
        village = (fields.get("village") or "").strip()
        tehsil = (fields.get("tehsil") or "").strip()
        district = (fields.get("district") or "").strip()
        state = (fields.get("state") or "").strip()

        # Only evaluate if at least one administrative field is extracted
        if not (village or tehsil or district or state):
            return results

        # 1. Use resolved parcel from context if available
        parcel: Optional[Parcel] = context.get("parcel") if context else None
        if not parcel and village:
            parcel = db.query(Parcel).filter(
                Parcel.village.ilike(f"%{village}%")
            ).first()

        if not parcel:
            if village:
                results.append(ValidationResultData(
                    rule="Administrative Hierarchy",
                    rule_code="ADMIN_VILLAGE_NOT_FOUND",
                    status="WARN",
                    severity="MEDIUM",
                    message=f"Village '{village}' not found in cadastral reference database.",
                    uploaded_value=village,
                    recommendation="Verify village name spelling against official district gazetteer.",
                ))
            return results

        # 2. Compare only where values exist on both sides
        mismatches = []
        matches = []
        evidence = []

        if village and parcel.village:
            if village.lower() in parcel.village.lower() or parcel.village.lower() in village.lower():
                matches.append(("village", village, parcel.village))
            else:
                mismatches.append(("village", village, parcel.village))

        if tehsil and parcel.tehsil:
            if tehsil.lower() in parcel.tehsil.lower() or parcel.tehsil.lower() in tehsil.lower():
                matches.append(("tehsil", tehsil, parcel.tehsil))
            else:
                mismatches.append(("tehsil", tehsil, parcel.tehsil))

        if district and parcel.district:
            if district.lower() in parcel.district.lower() or parcel.district.lower() in district.lower():
                matches.append(("district", district, parcel.district))
            else:
                mismatches.append(("district", district, parcel.district))

        if state and parcel.state:
            if state.lower() in parcel.state.lower() or parcel.state.lower() in state.lower():
                matches.append(("state", state, parcel.state))
            else:
                mismatches.append(("state", state, parcel.state))

        for level, ext, ref in matches:
            evidence.append(ValidationEvidence(
                source=f"Reference {level.capitalize()}",
                value=f"Matches '{ref}' (extracted: '{ext}')",
            ))

        for level, ext, ref in mismatches:
            evidence.append(ValidationEvidence(
                source=f"Reference {level.capitalize()}",
                value=f"Mismatch: recorded '{ref}' vs extracted '{ext}'",
            ))

        if mismatches:
            mismatch_desc = ", ".join([f"{m[0]}: extracted '{m[1]}' vs recorded '{m[2]}'" for m in mismatches])
            results.append(ValidationResultData(
                rule="Administrative Hierarchy",
                rule_code="ADMIN_HIERARCHY",
                status="FAIL",
                severity="HIGH",
                message=f"Administrative hierarchy discrepancy: {mismatch_desc}.",
                uploaded_value=f"{village}, {tehsil}, {district}, {state}".strip(", "),
                reference_values={
                    "recorded_village": parcel.village,
                    "recorded_tehsil": parcel.tehsil,
                    "recorded_district": parcel.district,
                    "recorded_state": parcel.state,
                },
                evidence=evidence,
                recommendation="Verify administrative jurisdiction and Tehsil/District boundaries.",
            ))
        elif matches:
            results.append(ValidationResultData(
                rule="Administrative Hierarchy",
                rule_code="ADMIN_HIERARCHY",
                status="PASS",
                severity="INFO",
                message="Extracted administrative divisions match cadastral reference data.",
                uploaded_value=f"{village}, {tehsil}, {district}, {state}".strip(", "),
                reference_values={
                    "recorded_village": parcel.village,
                    "recorded_tehsil": parcel.tehsil,
                    "recorded_district": parcel.district,
                    "recorded_state": parcel.state,
                },
                evidence=evidence,
            ))

        return results

