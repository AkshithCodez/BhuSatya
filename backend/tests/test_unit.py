"""Unit tests for ML schemas, preprocessing, field parser, validators, and risk scoring."""
import pytest
from app.services.layout_detection.schemas import BBox, DetectionResult
from app.services.layout_detection.mock_detector import MockLayoutDetector
from app.services.field_parser import parse_fields, _find_field_name, _parse_area
from app.services.risk_service import calculate_risk_score, get_risk_summary
from app.services.validation.base import ValidationResultData


def test_bbox_creation_and_props():
    """Verify BBox dataclass coordinates."""
    bbox = BBox(x1=10, y1=20, x2=110, y2=120)
    assert bbox.x1 == 10
    assert bbox.y1 == 20
    assert bbox.x2 == 110
    assert bbox.y2 == 120


def test_detection_result_structure():
    """Verify DetectionResult dataclass structure."""
    det = DetectionResult(
        id="det_001",
        class_id=0,
        class_name="table",
        confidence=0.92,
        bbox=BBox(x1=50, y1=50, x2=400, y2=300),
        image_width=800,
        image_height=1000,
    )
    assert det.id == "det_001"
    assert det.class_name == "table"
    assert det.confidence == 0.92
    assert (det.bbox.x2 - det.bbox.x1) == 350
    assert (det.bbox.y2 - det.bbox.y1) == 250


def test_mock_layout_detector():
    """Verify MockLayoutDetector outputs valid classes and bboxes."""
    detector = MockLayoutDetector(confidence=0.35)
    response = detector.detect("dummy_path.png")
    results = response.detections
    assert len(results) >= 3
    classes = [d.class_name for d in results]
    assert "table" in classes
    assert "signature" in classes
    assert "stamp" in classes
    for r in results:
        assert r.confidence >= 0.35
        assert r.bbox.x2 > r.bbox.x1
        assert r.bbox.y2 > r.bbox.y1


def test_field_alias_mapping():
    """Verify alias mapping for land record fields."""
    assert _find_field_name("Khata No") == "khata_number"
    assert _find_field_name("Khasra Number") == "khasra_number"
    assert _find_field_name("Holder Name") == "holder_name"
    assert _find_field_name("Father Name") == "father_name"
    assert _find_field_name("Area") == "area"
    assert _find_field_name("Village") == "village"
    assert _find_field_name("Tehsil") == "tehsil"


def test_parse_area_values():
    """Verify area parsing extracts numeric value and unit."""
    num, unit = _parse_area("3.82 Acre")
    assert num == "3.82"
    assert unit == "acre"

    num2, unit2 = _parse_area("1.5 Hectare")
    assert num2 == "1.5"
    assert unit2 == "hectare"


def test_structured_field_parser():
    """Verify regex-based parsing of raw table text."""
    raw_text = """
    Village: Rampur
    Khata No: 76
    Khasra No: 145/2
    Holder Name: Ramesh Kumar
    Father Name: Ram Lal
    Area: 3.82 Acre
    Mutation No: 1204
    """
    result = parse_fields(raw_text)
    assert len(result.errors) == 0
    assert len(result.fields) >= 6

    field_dict = {f.field_name: f.normalized_value or f.value for f in result.fields}
    assert field_dict.get("village") == "Rampur"
    assert field_dict.get("khata_number") == "76"
    assert field_dict.get("khasra_number") == "145/2"
    assert field_dict.get("holder_name") == "Ramesh Kumar"
    assert field_dict.get("father_name") == "Ram Lal"
    assert field_dict.get("area") == "3.82"


def test_risk_scoring_deterministic():
    """Verify risk score calculation and levels."""
    score, level = calculate_risk_score([])
    assert score == 0.0
    assert level == "LOW"

    # Single critical fail = 25 penalty
    res_critical = [
        ValidationResultData(
            rule="AREA_MISMATCH",
            status="FAIL",
            severity="CRITICAL",
            message="Severe area conflict",
        )
    ]
    score_crit, level_crit = calculate_risk_score(res_critical)
    assert score_crit == 25.0
    assert level_crit == "LOW"

    # Multiple failures reaching HIGH risk (>= 60)
    res_multi = [
        ValidationResultData(rule="R1", status="FAIL", severity="CRITICAL", message="M1"), # 25
        ValidationResultData(rule="R2", status="FAIL", severity="CRITICAL", message="M2"), # 25
        ValidationResultData(rule="R3", status="FAIL", severity="HIGH", message="M3"),     # 15
    ]
    score_high, level_high = calculate_risk_score(res_multi)
    assert score_high == 65.0
    assert level_high == "HIGH"
    assert "Manual review required" in get_risk_summary(score_high, level_high)
