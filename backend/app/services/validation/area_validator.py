"""Area consistency validator — the core demo validation."""
from sqlalchemy.orm import Session
from app.models.land_record import Parcel, ReferenceRecord
from app.services.validation.base import Validator, ValidationResultData, ValidationEvidence


class AreaValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        results = []
        area_str = fields.get("area", "")
        khasra = fields.get("khasra_number", "")

        if not area_str:
            return results

        try:
            extracted_area = float(area_str)
        except (ValueError, TypeError):
            results.append(ValidationResultData(
                rule="AREA_CONSISTENCY",
                status="WARN",
                severity="MEDIUM",
                message=f"Cannot parse area value: '{area_str}'",
                uploaded_value=area_str,
            ))
            return results

        area_unit = fields.get("area_unit", "acre")

        # Find reference records for this parcel
        parcel = None
        if khasra:
            parcel = db.query(Parcel).filter(
                Parcel.khasra_number == khasra
            ).first()

        if not parcel:
            results.append(ValidationResultData(
                rule="AREA_CONSISTENCY",
                status="SKIP",
                message="Cannot validate area — parcel not found in reference data",
                uploaded_value=f"{extracted_area} {area_unit}",
            ))
            return results

        # Gather all area references
        evidence = []
        mismatches = []

        # Historical RoR
        ref_records = db.query(ReferenceRecord).filter(
            ReferenceRecord.parcel_id == parcel.id,
            ReferenceRecord.field_name == "area",
        ).all()

        for ref in ref_records:
            try:
                ref_area = float(ref.normalized_value or ref.value)
                evidence.append(ValidationEvidence(
                    source=ref.source_description or ref.record_type,
                    value=f"{ref_area} {ref.unit or area_unit}",
                ))
                if abs(extracted_area - ref_area) > 0.01:
                    mismatches.append(ref.source_description or ref.record_type)
            except (ValueError, TypeError):
                pass

        # GIS area
        if parcel.gis_area is not None:
            evidence.append(ValidationEvidence(
                source="GIS",
                value=f"{parcel.gis_area} {parcel.gis_area_unit}",
            ))
            if abs(extracted_area - parcel.gis_area) > 0.05:
                mismatches.append("GIS")

        # Parcel recorded area
        if parcel.area is not None and not any("RoR" in e.source for e in evidence):
            evidence.append(ValidationEvidence(
                source="Recorded Area",
                value=f"{parcel.area} {parcel.area_unit}",
            ))
            if abs(extracted_area - parcel.area) > 0.01:
                mismatches.append("Recorded Area")

        if mismatches:
            results.append(ValidationResultData(
                rule="AREA_CONSISTENCY",
                status="FAIL",
                severity="HIGH",
                message="Extracted area conflicts with multiple reference records.",
                uploaded_value=f"{extracted_area} {area_unit}",
                evidence=evidence,
                recommendation="Manual verification required",
            ))
        elif evidence:
            results.append(ValidationResultData(
                rule="AREA_CONSISTENCY",
                status="PASS",
                message="Extracted area matches reference records",
                uploaded_value=f"{extracted_area} {area_unit}",
                evidence=evidence,
            ))

        return results
