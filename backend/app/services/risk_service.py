"""
Risk / Review Priority scoring service — deterministic, explainable, and derived purely from validation outcomes.

Levels: LOW (0–29), MEDIUM (30–59), HIGH (60–79), CRITICAL (80–100), INSUFFICIENT_DATA
Weights authoritative reference conflicts heavily.
Strictly neutral evidentiary language — never outputs 'fraud' or 'fake'.
"""
from typing import Optional
from app.services.validation.base import ValidationResultData

SEVERITY_WEIGHTS = {
    "CRITICAL": 25,
    "HIGH": 15,
    "MEDIUM": 8,
    "LOW": 3,
    "INFO": 0,
}



def calculate_risk_score(
    validation_results: list[ValidationResultData],
    ocr_confidence: Optional[float] = None,
) -> tuple[Optional[float], str]:
    """
    Calculate a deterministic review priority from genuine validation outcomes.

    Returns:
        (score, level) tuple. Returns (None, "INSUFFICIENT_DATA") if evidence is missing.
    """
    if not validation_results:
        return None, "INSUFFICIENT_DATA"

    # Evaluated results that contain active validation checks
    evaluated_results = [
        r for r in validation_results
        if r.status in ("PASS", "WARN", "WARNING", "FAIL", "AMBIGUOUS")
    ]
    if not evaluated_results:
        return None, "INSUFFICIENT_DATA"

    # If the only check that ran was a required field check and everything else skipped due to missing reference data
    cadastral_checks = [
        r for r in evaluated_results
        if r.rule_code not in ("REQUIRED_FIELD_PRESENT", "PARCEL_FORMAT")
    ]
    if not cadastral_checks and all(r.status in ("SKIP", "REFERENCE_DATA_NOT_FOUND") for r in validation_results):
        return None, "INSUFFICIENT_DATA"

    total_penalty = 0

    for result in evaluated_results:
        if result.status == "FAIL":
            weight = SEVERITY_WEIGHTS.get(result.severity or "HIGH", 20)
            total_penalty += weight
        elif result.status == "AMBIGUOUS":
            weight = SEVERITY_WEIGHTS.get(result.severity or "HIGH", 20)
            total_penalty += weight
        elif result.status in ("WARN", "WARNING"):
            weight = SEVERITY_WEIGHTS.get(result.severity or "MEDIUM", 10)
            total_penalty += weight

    # Penalty for low OCR confidence if real
    if ocr_confidence is not None and ocr_confidence < 0.65:
        total_penalty += 10

    # Cap at 100
    score = min(total_penalty, 100)

    # Determine priority level
    if score >= 80:
        level = "CRITICAL"
    elif score >= 60:
        level = "HIGH"
    elif score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"


    return float(score), level


def get_risk_summary(score: Optional[float], level: str) -> str:
    """Generate a human-readable, neutral review priority summary."""
    summaries = {
        "CRITICAL": "Critical discrepancies detected. Immediate investigation required.",
        "HIGH": "Significant discrepancies detected. Manual review required.",
        "MEDIUM": "Some inconsistencies found. Review recommended.",
        "MODERATE": "Some inconsistencies found. Review recommended.",
        "LOW": "No significant issues detected.",
        "INSUFFICIENT_DATA": "Insufficient validation evidence or reference data to assess risk.",
    }
    return summaries.get(level, "Review priority pending.")


