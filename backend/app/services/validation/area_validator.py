"""
Area consistency validator — compares extracted area against recorded parcel, GIS survey, and reference records.

Supports Section 3 & Section 7:
- acre, hectare, square metre normalization.
- Local units (bigha, biswa, guntha, cent, kanal, marla) handled conservatively: returns AREA_UNIT_CONVERSION_UNAVAILABLE if state conversion not configured.
- Discrepancy explanation: Extracted area, Recorded parcel area, Difference, Rule, Result.
"""
import re
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.land_record import Parcel, ReferenceRecord
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence

CONVERSION_TO_ACRE = {
    "acre": 1.0,
    "acres": 1.0,
    "hectare": 2.47105,
    "hectares": 2.47105,
    "ha": 2.47105,
    "square metre": 0.000247105,
    "square metres": 0.000247105,
    "square meter": 0.000247105,
    "square meters": 0.000247105,
    "sq m": 0.000247105,
    "sqm": 0.000247105,
    "sq_m": 0.000247105,
    "square feet": 1.0 / 43560.0,
    "sq ft": 1.0 / 43560.0,
    "sqft": 1.0 / 43560.0,
}

LOCAL_UNITS = {"bigha", "biswa", "guntha", "cent", "kanal", "marla"}


def parse_numeric_area(area_str: str) -> Optional[float]:
    """Extract float value from area string (e.g. '3.28', '3.28 Acre', ' 2.50 ha ')."""
    if not area_str:
        return None
    match = re.search(r"(\d+(?:\.\d+)?)", str(area_str).replace(",", ""))
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None


def detect_unit(area_str: str, default_unit: str = "acre") -> str:
    """Detect unit from area text or fallback."""
    text = (area_str or "").lower()
    for local_unit in LOCAL_UNITS:
        if re.search(r"\b" + re.escape(local_unit) + r"\b", text):
            return local_unit
    for unit_name in sorted(CONVERSION_TO_ACRE.keys(), key=len, reverse=True):
        if re.search(r"\b" + re.escape(unit_name) + r"\b", text):
            return unit_name
    return default_unit or "acre"


def normalize_area(area_str: str, default_unit: str = "acre") -> Tuple[Optional[float], Optional[float], str]:
    """
    Parse numeric area and convert to normalized acres if standard unit.
    Returns (normalized_acres, parsed_value, unit).
    Returns (None, parsed_value, unit) if local unit without configured conversion.
    """
    val = parse_numeric_area(area_str)
    unit = detect_unit(area_str, default_unit=default_unit)
    if val is None:
        return None, None, unit
    if unit in LOCAL_UNITS:
        return None, val, unit
    factor = CONVERSION_TO_ACRE.get(unit, 1.0)
    return round(val * factor, 4), val, unit


class AreaValidator(Validator):
    def validate(self, fields: dict, db: Session, context: Optional[dict] = None) -> list[ValidationResultData]:
        results = []
        raw_area_val = fields.get("area", "")
        if not raw_area_val:
            return results

        extracted_area = parse_numeric_area(str(raw_area_val))
        if extracted_area is None:
            results.append(ValidationResultData(
                rule="Area Consistency",
                rule_code="AREA_FORMAT_INVALID",
                status="WARN",
                severity="MEDIUM",
                message=f"Cannot parse numeric area value from: '{raw_area_val}'",
                uploaded_value=str(raw_area_val),
                recommendation="Verify area text formatting in source document.",
            ))
            return results

        # Determine unit
        unit_raw = fields.get("area_unit") or detect_unit(str(raw_area_val), default_unit="acre")
        unit_clean = unit_raw.lower().strip()

        # Check for local units without configured state conversion
        if unit_clean in LOCAL_UNITS:
            state = fields.get("state", "").lower()
            # Standard state conversions could be added, but per spec: return AREA_UNIT_CONVERSION_UNAVAILABLE
            results.append(ValidationResultData(
                rule="Area Unit Conversion",
                rule_code="AREA_UNIT_CONVERSION_UNAVAILABLE",
                status="WARN",
                severity="MEDIUM",
                message=f"Local area unit '{unit_clean}' requires state-specific cadastral conversion table. Automated conversion unavailable.",
                uploaded_value=f"{extracted_area} {unit_clean}",
                recommendation="Manual officer verification required for local area unit conversion.",
            ))
            return results

        # Find reference parcel
        parcel: Optional[Parcel] = context.get("parcel") if context else None
        if not parcel:
            khasra = fields.get("khasra_number") or fields.get("parcel_number")
            if khasra:
                parcel = db.query(Parcel).filter(Parcel.khasra_number == khasra).first()

        if not parcel:
            results.append(ValidationResultData(
                rule="Area Consistency",
                rule_code="AREA_CONSISTENCY",
                status="SKIP",
                severity="LOW",
                message="Cannot validate area: reference parcel not found in cadastral database.",
                uploaded_value=f"{extracted_area} {unit_clean}",
                recommendation="Reference cadastral record required to compare land area.",
            ))
            return results

        # Normalize extracted area to acres
        conv_factor = CONVERSION_TO_ACRE.get(unit_clean, 1.0)
        norm_extracted_acres = extracted_area * conv_factor

        evidence = []
        mismatches = []
        ref_values = {}

        # 1. Parcel recorded area
        if parcel.area is not None:
            parcel_unit = (parcel.area_unit or "acre").lower().strip()
            parcel_factor = CONVERSION_TO_ACRE.get(parcel_unit, 1.0)
            norm_parcel_acres = parcel.area * parcel_factor
            diff = abs(norm_extracted_acres - norm_parcel_acres)

            ref_values["recorded_area"] = parcel.area
            ref_values["recorded_unit"] = parcel.area_unit
            ref_values["difference_acres"] = round(diff, 4)

            evidence.append(ValidationEvidence(
                source="Recorded Cadastral Parcel Area",
                value=f"{parcel.area} {parcel.area_unit} (normalized: {norm_parcel_acres:.2f} acre, diff: {diff:.2f} acre)",
            ))

            if diff > 0.02:
                mismatches.append({
                    "source": "Recorded Parcel Area",
                    "recorded": f"{parcel.area} {parcel.area_unit}",
                    "diff_acres": round(diff, 2),
                })

        # 2. GIS surveyed area
        if parcel.gis_area is not None:
            gis_unit = (parcel.gis_area_unit or "acre").lower().strip()
            gis_factor = CONVERSION_TO_ACRE.get(gis_unit, 1.0)
            norm_gis_acres = parcel.gis_area * gis_factor
            diff_gis = abs(norm_extracted_acres - norm_gis_acres)

            ref_values["gis_area"] = parcel.gis_area
            ref_values["gis_unit"] = parcel.gis_area_unit
            evidence.append(ValidationEvidence(
                source="GIS Satellite / Cadastral Survey",
                value=f"{parcel.gis_area} {parcel.gis_area_unit} (normalized: {norm_gis_acres:.2f} acre, diff: {diff_gis:.2f} acre)",
            ))

            if diff_gis > 0.05:
                mismatches.append({
                    "source": "GIS Survey",
                    "recorded": f"{parcel.gis_area} {parcel.gis_area_unit}",
                    "diff_acres": round(diff_gis, 2),
                })

        # 3. ReferenceRecord area rows (historical RoR, mutations)
        ref_records = db.query(ReferenceRecord).filter(
            ReferenceRecord.parcel_id == parcel.id,
            ReferenceRecord.field_name == "area",
        ).all()

        for ref in ref_records:
            ref_val = parse_numeric_area(ref.normalized_value or ref.value)
            if ref_val is not None:
                ref_u = (ref.unit or "acre").lower().strip()
                ref_factor = CONVERSION_TO_ACRE.get(ref_u, 1.0)
                norm_ref_acres = ref_val * ref_factor
                diff_ref = abs(norm_extracted_acres - norm_ref_acres)

                evidence.append(ValidationEvidence(
                    source=f"Reference Record ({ref.source_description or ref.record_type})",
                    value=f"{ref_val} {ref_u} (Year: {ref.record_year or 'N/A'}, diff: {diff_ref:.2f} acre)",
                ))

                if diff_ref > 0.02:
                    mismatches.append({
                        "source": ref.source_description or ref.record_type,
                        "recorded": f"{ref_val} {ref_u}",
                        "diff_acres": round(diff_ref, 2),
                    })

        # Evaluate outcomes
        if mismatches:
            primary_mismatch = mismatches[0]
            msg = (
                f"Extracted area ({extracted_area} {unit_clean}) conflicts with {primary_mismatch['source']} "
                f"({primary_mismatch['recorded']}). Difference: {primary_mismatch['diff_acres']} acre."
            )
            results.append(ValidationResultData(
                rule="Area Consistency",
                rule_code="AREA_CONSISTENCY",
                status="FAIL",
                severity="HIGH",
                message=msg,
                uploaded_value=f"{extracted_area} {unit_clean}",
                reference_values=ref_values,
                evidence=evidence,
                recommendation="Manual verification required. Cross-examine physical sale deed against cadastral survey map.",
            ))
        elif evidence:
            results.append(ValidationResultData(
                rule="Area Consistency",
                rule_code="AREA_CONSISTENCY",
                status="PASS",
                severity="INFO",
                message=f"Extracted area ({extracted_area} {unit_clean}) matches registered cadastral reference records within tolerance.",
                uploaded_value=f"{extracted_area} {unit_clean}",
                reference_values=ref_values,
                evidence=evidence,
                recommendation="Area verified against official records.",
            ))
        else:
            results.append(ValidationResultData(
                rule="Area Consistency",
                rule_code="AREA_CONSISTENCY",
                status="SKIP",
                severity="LOW",
                message="No area reference records available for this parcel in reference database.",
                uploaded_value=f"{extracted_area} {unit_clean}",
                recommendation="Add cadastral reference area record to registry.",
            ))

        return results

