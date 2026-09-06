"""
Risk scoring service — deterministic and explainable.

Score: 0–100
Levels: LOW (0–29), MODERATE (30–59), HIGH (60–79), CRITICAL (80–100)

Weights authoritative-data conflicts heavily.
Stamp/signature presence does NOT increase trust automatically.
"""
from app.services.validation.base import ValidationResultData


SEVERITY_WEIGHTS = {
    "CRITICAL": 25,
    "HIGH": 15,
    "MEDIUM": 8,
    "LOW": 3,
}


def calculate_risk_score(validation_results: list[ValidationResultData]) -> tuple[float, str]:
    """
    Calculate a deterministic risk score from validation results.

    Returns:
        (score, level) tuple.
    """
    if not validation_results:
        return 0.0, "LOW"

    total_penalty = 0
    fail_count = 0

    for result in validation_results:
        if result.status == "FAIL":
            fail_count += 1
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


def get_risk_summary(score: float, level: str) -> str:
    """Generate a human-readable risk summary."""
    summaries = {
        "CRITICAL": "Critical discrepancies detected. Immediate investigation required.",
        "HIGH": "Significant discrepancies detected. Manual review required.",
        "MODERATE": "Some inconsistencies found. Review recommended.",
        "LOW": "No significant issues detected.",
    }
    return summaries.get(level, "Unable to assess risk.")
