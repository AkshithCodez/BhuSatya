"""
Risk scoring service — deterministic and explainable.

Score: 0–100
Levels: LOW (0–29), MODERATE (30–59), HIGH (60–79), CRITICAL (80–100)

Weights authoritative-data conflicts heavily.
Stamp/signature presence does NOT increase trust automatically.
"""
from typing import Optional
from app.services.validation.base import ValidationResultData


SEVERITY_WEIGHTS = {
    "CRITICAL": 25,
    "HIGH": 15,
    "MEDIUM": 8,
    "LOW": 3,
}


def calculate_risk_score(validation_results: list[ValidationResultData]) -> tuple[Optional[float], str]:
    """
    Calculate a deterministic risk score from validation results.

    Returns:
        (score, level) tuple. Returns (None, "INSUFFICIENT_DATA") if evidence is missing.
    """
    if not validation_results:
        return None, "INSUFFICIENT_DATA"

    # If all results were skipped because reference records were not found
    evaluated_results = [r for r in validation_results if r.status in ("PASS", "WARN", "FAIL")]
    if not evaluated_results:
        return None, "INSUFFICIENT_DATA"

    total_penalty = 0

    for result in evaluated_results:
        if result.status == "FAIL":
            weight = SEVERITY_WEIGHTS.get(result.severity or "MEDIUM", 8)
            total_penalty += weight
        elif result.status == "WARN":
            weight = SEVERITY_WEIGHTS.get(result.severity or "LOW", 3)
            total_penalty += weight

    # Cap at 100
    score = min(total_penalty, 100)

    # Determine level
    if score >= 80:
        level = "CRITICAL"
    elif score >= 60:
        level = "HIGH"
    elif score >= 30:
        level = "MODERATE"
    else:
        level = "LOW"

    return float(score), level


def get_risk_summary(score: Optional[float], level: str) -> str:
    """Generate a human-readable risk summary."""
    summaries = {
        "CRITICAL": "Critical discrepancies detected. Immediate investigation required.",
        "HIGH": "Significant discrepancies detected. Manual review required.",
        "MODERATE": "Some inconsistencies found. Review recommended.",
        "LOW": "No significant issues detected.",
        "INSUFFICIENT_DATA": "Insufficient validation evidence or reference data to assess risk.",
    }
    return summaries.get(level, "Unable to assess risk.")
