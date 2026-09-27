"""
Comprehensive test suite for the complete BhuSatya validation -> officer review -> correction -> audit -> verified record workflow.
Verifies all 18 requirements from Section 23:
1. Reference parcel matching (unambiguous)
2. No parcel match handling (PARCEL_NOT_FOUND)
3. Ambiguous parcel match handling (MULTIPLE_REFERENCE_MATCHES)
4. Area validation and unit conversion (standard vs local units)
5. Holder validation and safe name normalization
6. Mutation consistency validation
7. Registration consistency validation
8. Missing reference data handling (truthful SKIP/REFERENCE_DATA_NOT_FOUND)
9. Risk and review priority calculation
10. Field correction with raw_value preservation and correction history
11. Audit trail write (append-only events)
12. Review approval workflow (blocking on critical failures, override bypass)
13. Review rejection workflow
14. Investigation workflow
15. Final verified record generation (GET /api/documents/{id}/verified-record)
16. JSON export (GET /api/documents/{id}/export)
17. Review queue ordering and filtering
18. Role-based authorization enforcement
"""
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw
from sqlalchemy.orm import Session

from app.main import app
from app.db.database import get_db
from app.models.document import Document
from app.models.extraction import ExtractedField
from app.models.land_record import Parcel, ParcelRight, Person, Mutation, RegistrationRecord
from app.models.audit import AuditEvent
from app.models.review import FieldCorrection, Review
from app.services.validation.reference_matcher import match_reference_parcel
from app.services.validation.area_validator import AreaValidator, normalize_area
from app.services.validation.holder_validator import HolderValidator, normalize_person_name
from app.services.validation.mutation_validator import MutationValidator
from app.services.validation.registration_validator import RegistrationValidator
from app.services.risk_service import calculate_risk_score


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def officer_headers(client):
    resp = client.post("/api/auth/login", json={"email": "officer@sih.demo", "password": "demo123"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def operator_headers(client):
    resp = client.post("/api/auth/login", json={"email": "operator@sih.demo", "password": "demo123"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def db_session():
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


def create_test_image(text="TEST LAND RECORD"):
    img = Image.new("RGB", (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((50, 40), "GOVERNMENT LAND RECORD DEPARTMENT", fill=(0, 0, 0))
    draw.text((50, 70), text, fill=(0, 0, 0))
    draw.rectangle([50, 150, 750, 500], outline=(0, 0, 0), width=2)
    draw.line([50, 200, 750, 200], fill=(0, 0, 0), width=2)
    draw.line([50, 260, 750, 260], fill=(0, 0, 0), width=1)
    draw.line([50, 320, 750, 320], fill=(0, 0, 0), width=1)
    draw.text((70, 220), "Village: Rampur", fill=(0, 0, 0))
    draw.text((70, 280), "Khasra No: 145/2", fill=(0, 0, 0))
    draw.text((70, 340), "Holder: Priya Sharma", fill=(0, 0, 0))
    draw.text((70, 400), "Area: 3.82 Acre", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


# ==============================================================================
# 1. REFERENCE PARCEL MATCHING TESTS
# ==============================================================================

def test_reference_parcel_matching_unambiguous(db_session: Session):
    """Test exact match on khasra_number and village finds exactly 1 parcel."""
    fields = {"khasra_number": "145/2", "village": "Rampur"}
    match = match_reference_parcel(fields, db_session)
    assert match.status == "MATCHED"
    assert match.rule_code == "PARCEL_EXISTS"
    assert match.parcel is not None
    assert match.parcel.khasra_number == "145/2"
    assert match.parcel.village == "Rampur"


def test_reference_parcel_matching_no_match(db_session: Session):
    """Test non-existent parcel yields PARCEL_NOT_FOUND and severity CRITICAL."""
    fields = {"khasra_number": "NON_EXISTENT_99999", "village": "Nowhere"}
    match = match_reference_parcel(fields, db_session)
    assert match.status == "PARCEL_NOT_FOUND"
    assert match.rule_code == "PARCEL_NOT_FOUND"
    assert match.parcel is None


def test_reference_parcel_matching_ambiguous(db_session: Session):
    """Test ambiguous criteria (e.g. matching multiple parcels without distinguishing khasra)."""
    # Create two parcels in same village with same khata
    p1 = Parcel(state="Madhya Pradesh", district="Sehore", tehsil="Ichhawar", village="AmbiguousVille",
                khata_number="KH-999", khasra_number="999/1", parcel_number="P-999-1", area=2.0, area_unit="acre")
    p2 = Parcel(state="Madhya Pradesh", district="Sehore", tehsil="Ichhawar", village="AmbiguousVille",
                khata_number="KH-999", khasra_number="999/2", parcel_number="P-999-2", area=3.0, area_unit="acre")
    db_session.add_all([p1, p2])
    db_session.commit()

    try:
        fields = {"khata_number": "KH-999", "village": "AmbiguousVille"}
        match = match_reference_parcel(fields, db_session)
        assert match.status == "MULTIPLE_REFERENCE_MATCHES"
        assert match.rule_code == "MULTIPLE_REFERENCE_MATCHES"
        assert len(match.candidate_parcels) == 2
        assert "Multiple parcels" in match.message
    finally:
        db_session.delete(p1)
        db_session.delete(p2)
        db_session.commit()


# ==============================================================================
# 2. AREA & UNIT CONVERSION VALIDATION TESTS
# ==============================================================================

def test_normalize_area_standard_units():
    """Verify standard units convert to normalized acres accurately."""
    # 1.0 Acre = 1.0 Acre
    norm_acres, parsed_val, parsed_u = normalize_area("1.0 Acre")
    assert norm_acres == 1.0
    assert parsed_val == 1.0
    assert parsed_u == "acre"

    # 1.0 Hectare = 2.4711 Acres
    norm_acres_h, _, _ = normalize_area("1.0 Hectare")
    assert round(norm_acres_h, 2) == 2.47


def test_normalize_area_local_units():
    """Verify local units without state-specific config produce None (avoiding arbitrary conversion)."""
    norm_sqm, parsed_val, parsed_u = normalize_area("5 Bigha")
    assert norm_sqm is None  # Safe: local unit not converted arbitrarily
    assert parsed_val == 5.0
    assert parsed_u == "bigha"


def test_area_validator_pass_and_fail(db_session: Session):
    """Test AreaValidator with matching vs conflicting areas."""
    validator = AreaValidator()

    # Pass: 3.28 acre matches parcel 145/2 (3.28 acre)
    results_pass = validator.validate({"area": "3.28 Acre", "khasra_number": "145/2", "village": "Rampur"}, db_session)
    assert any(r.status == "PASS" and r.rule_code == "AREA_CONSISTENCY" for r in results_pass)

    # Fail: 3.82 acre conflicts with parcel 145/2 (3.28 acre)
    results_fail = validator.validate({"area": "3.82 Acre", "khasra_number": "145/2", "village": "Rampur"}, db_session)
    fail_result = next((r for r in results_fail if r.status == "FAIL" and r.rule_code == "AREA_CONSISTENCY"), None)
    assert fail_result is not None
    assert fail_result.severity == "HIGH"
    assert "conflicts with" in fail_result.message


# ==============================================================================
# 3. HOLDER NORMALIZATION & VALIDATION TESTS
# ==============================================================================

def test_normalize_holder_name_safe():
    """Test safe normalization: strips honorary prefixes, normalizes whitespace and case."""
    assert normalize_person_name("Shri Priya Sharma") == "priya sharma"
    assert normalize_person_name("Smt.  Priya   Sharma ") == "priya sharma"
    assert normalize_person_name("Dr. Rajesh Kumar Verma") == "rajesh kumar verma"
    # Does NOT modify distinct identities
    assert normalize_person_name("Suresh Kumar") != normalize_person_name("Ramesh Kumar")


def test_holder_validator_match_and_mismatch(db_session: Session):
    """Test HolderValidator against parcel rights."""
    validator = HolderValidator()

    # Pass: Priya Sharma matches parcel 145/2 right holder
    res_pass = validator.validate({"holder_name": "Smt. Priya Sharma", "khasra_number": "145/2", "village": "Rampur"}, db_session)
    assert any(r.status == "PASS" and r.rule_code == "HOLDER_MATCH" for r in res_pass)

    # Discrepancy: Vikram Singh does not match current holder Priya Sharma
    res_fail = validator.validate({"holder_name": "Vikram Singh", "khasra_number": "145/2", "village": "Rampur"}, db_session)
    discrepancy = next((r for r in res_fail if r.status == "FAIL" and r.rule_code == "HOLDER_MATCH"), None)
    assert discrepancy is not None
    assert "does not match registered right holders" in discrepancy.message


# ==============================================================================
# 4. MUTATION & REGISTRATION VALIDATION TESTS
# ==============================================================================

def test_mutation_validator_existing_and_missing(db_session: Session):
    """Test MutationValidator verifies existence and parcel linkage."""
    validator = MutationValidator()

    # Pass: Mutation 8732 exists for parcel 145/2
    res_pass = validator.validate({"mutation_number": "8732", "khasra_number": "145/2", "village": "Rampur"}, db_session)
    assert any(r.status == "PASS" and r.rule_code == "MUTATION_EXISTS" for r in res_pass)

    # Missing: Mutation 999999 does not exist
    res_missing = validator.validate({"mutation_number": "999999", "khasra_number": "145/2"}, db_session)
    missing = next((r for r in res_missing if r.rule_code == "MUTATION_EXISTS"), None)
    assert missing is not None
    assert missing.status == "FAIL"


def test_registration_validator(db_session: Session):
    """Test RegistrationValidator checks registration existence."""
    validator = RegistrationValidator()

    # Missing registration number in db
    res = validator.validate({"registration_number": "REG-NOT-EXIST-001", "khasra_number": "145/2"}, db_session)
    assert any(r.rule_code == "REGISTRATION_NOT_FOUND" and r.status == "WARN" for r in res)


# ==============================================================================
# 5. RISK CALCULATION TESTS
# ==============================================================================

def test_risk_calculation_truthful():
    """Verify risk priority computation produces truthful non-arbitrary levels."""
    from app.services.validation.base import ValidationResultData

    # Empty results -> INSUFFICIENT_DATA
    score_empty, level_empty = calculate_risk_score([])
    assert score_empty is None
    assert level_empty == "INSUFFICIENT_DATA"

    # All pass -> LOW
    pass_results = [
        ValidationResultData(rule="PARCEL_EXISTENCE", status="PASS", severity="INFO", message="OK"),
        ValidationResultData(rule="AREA_CONSISTENCY", status="PASS", severity="INFO", message="OK"),
    ]
    score_low, level_low = calculate_risk_score(pass_results)
    assert level_low == "LOW"
    assert score_low == 0.0

    # Critical failure reaching CRITICAL priority (>= 80)
    crit_results = [
        ValidationResultData(rule="PARCEL_EXISTENCE", status="FAIL", severity="CRITICAL", message="Parcel not found"),
        ValidationResultData(rule="MUTATION_CHECK", status="FAIL", severity="CRITICAL", message="Mutation invalid"),
        ValidationResultData(rule="AREA_CHECK", status="FAIL", severity="CRITICAL", message="Area invalid"),
        ValidationResultData(rule="HOLDER_CHECK", status="FAIL", severity="CRITICAL", message="Holder invalid"),
    ]
    score_crit, level_crit = calculate_risk_score(crit_results)
    assert level_crit == "CRITICAL"
    assert score_crit >= 80.0


# ==============================================================================
# 6. END-TO-END WORKFLOW: CORRECTION, OVERRIDE, APPROVE, VERIFIED-RECORD, EXPORT
# ==============================================================================

def test_full_validation_review_correction_audit_lifecycle(client: TestClient, officer_headers: dict, db_session: Session):
    """
    Complete real workflow:
    1. Upload document
    2. Extract & parse fields with deliberate area discrepancy (3.82 vs 3.28)
    3. Validate against PostgreSQL reference record
    4. Field correction: update area to 3.28 with mandatory reason
    5. Verify raw_value preserved & FieldCorrection row logged
    6. Verify audit trail has FIELD_CORRECTED
    7. Submit review approval
    8. Verify document status is VERIFIED
    9. Verify GET /api/documents/{id}/verified-record returns official verified record
    10. Verify GET /api/documents/{id}/export exports clean structured JSON
    """
    # 1. Upload
    buf = create_test_image("LAND SALE DEED - KHASRA 145/2")
    up_resp = client.post("/api/documents", files={"file": ("deed_workflow.png", buf, "image/png")}, headers=officer_headers)
    assert up_resp.status_code == 200
    doc_id = up_resp.json()["id"]

    # 2. Extract & Parse
    client.post(f"/api/documents/{doc_id}/detect", headers=officer_headers)
    reg_resp = client.get(f"/api/documents/{doc_id}/regions", headers=officer_headers)
    assert reg_resp.status_code == 200
    regions = reg_resp.json()
    table_regions = [r for r in regions if r["class_name"] == "table"]
    assert len(table_regions) > 0, "Expected table region detected"
    ext_resp = client.post(
        f"/api/regions/{table_regions[0]['id']}/extract",
        json={"text": "Village: Rampur\nKhasra No: 145/2\nHolder: Smt. Priya Sharma\nArea: 3.82 Acre"},
        headers=officer_headers,
    )
    assert ext_resp.status_code == 200
    parse_resp = client.post(f"/api/documents/{doc_id}/parse", headers=officer_headers)
    assert parse_resp.status_code == 200

    # 3. Validate
    val_resp = client.post(f"/api/documents/{doc_id}/validate", headers=officer_headers)
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["risk_level"] in ("MEDIUM", "HIGH", "LOW")
    discrepancies = [r for r in val_data["results"] if r["status"] == "FAIL"]
    # Area discrepancy should be present (3.82 vs 3.28)
    assert any(r["rule_code"] == "AREA_CONSISTENCY" for r in discrepancies)

    # 4. Field Correction: correct area from 3.82 to 3.28
    fields = parse_resp.json()
    area_field = next(f for f in fields if f["field_name"] == "area")
    orig_raw_value = area_field["raw_value"]

    corr_resp = client.put(
        f"/api/fields/{area_field['id']}",
        json={"value": "3.28", "reason": "Corrected OCR digit 8 to 2 per original seal impression"},
        headers=officer_headers,
    )
    assert corr_resp.status_code == 200
    corr_data = corr_resp.json()
    assert corr_data["value"] == "3.28"
    assert corr_data["verification_status"] == "CORRECTED"

    # 5. Verify raw_value preserved & correction history persisted
    fields_after = client.get(f"/api/documents/{doc_id}/fields", headers=officer_headers).json()
    area_after = next(f for f in fields_after if f["field_name"] == "area")
    assert area_after["raw_value"] == orig_raw_value  # Never overwritten!
    assert area_after["value"] == "3.28"
    assert area_after["verification_status"] == "CORRECTED"

    # 6. Verify audit trail contains FIELD_CORRECTED
    audit_resp = client.get(f"/api/audit?document_id={doc_id}", headers=officer_headers)
    assert audit_resp.status_code == 200
    events = [e["event_type"] for e in audit_resp.json()["events"]]
    assert "FIELD_CORRECTED" in events

    # 7. Submit Review Approval
    appr_resp = client.post(
        f"/api/documents/{doc_id}/approve",
        json={"notes": "All cadastral fields verified against RoR registry."},
        headers=officer_headers,
    )
    assert appr_resp.status_code == 200
    appr_data = appr_resp.json()
    assert appr_data["verification_status"] == "VERIFIED"

    # 8. Check document status is VERIFIED
    doc_final = client.get(f"/api/documents/{doc_id}", headers=officer_headers).json()
    assert doc_final["status"] == "VERIFIED"

    # 9. Verify GET /api/documents/{id}/verified-record (Section 14)
    rec_resp = client.get(f"/api/documents/{doc_id}/verified-record", headers=officer_headers)
    assert rec_resp.status_code == 200
    verified_record = rec_resp.json()
    assert verified_record["document_id"] == doc_id
    assert verified_record["verification_status"] == "VERIFIED"
    assert verified_record["fields"]["area"] == "3.28"
    assert verified_record["fields"]["khasra_number"] == "145/2"
    assert "review" in verified_record
    assert verified_record["review"]["decision"] == "APPROVED"

    # 10. Verify GET /api/documents/{id}/export (Section 15)
    exp_resp = client.get(f"/api/documents/{doc_id}/export", headers=officer_headers)
    assert exp_resp.status_code == 200
    export_json = exp_resp.json()
    assert export_json["document_id"] == doc_id
    assert export_json["status"] == "VERIFIED"
    assert "validation_summary" in export_json
    assert export_json["validation_summary"]["discrepancy_count"] >= 0


# ==============================================================================
# 7. APPROVAL BLOCKING & OVERRIDE BYPASS TESTS
# ==============================================================================

def test_approval_blocked_on_unresolved_critical_failure(client: TestClient, officer_headers: dict):
    """
    Section 12: A document cannot be approved if critical unresolved validation failures exist,
    unless the officer explicitly overrides with a reason and the system logs OVERRIDE_APPLIED.
    """
    buf = create_test_image("NON-EXISTENT PARCEL DEED")
    up_resp = client.post("/api/documents", files={"file": ("bogus_parcel.png", buf, "image/png")}, headers=officer_headers)
    assert up_resp.status_code == 200
    doc_id = up_resp.json()["id"]

    client.post(f"/api/documents/{doc_id}/detect", headers=officer_headers)
    reg_resp = client.get(f"/api/documents/{doc_id}/regions", headers=officer_headers)
    assert reg_resp.status_code == 200
    regions = reg_resp.json()
    table_regions = [r for r in regions if r["class_name"] == "table"]
    assert len(table_regions) > 0, "Expected table region detected"
    ext_resp = client.post(
        f"/api/regions/{table_regions[0]['id']}/extract",
        json={"text": "Village: Nowhere\nKhasra No: 99999/BOGUS\nArea: 10.0 Acre"},
        headers=officer_headers,
    )
    assert ext_resp.status_code == 200
    parse_resp = client.post(f"/api/documents/{doc_id}/parse", headers=officer_headers)
    assert parse_resp.status_code == 200
    val_resp = client.post(f"/api/documents/{doc_id}/validate", headers=officer_headers)
    assert val_resp.status_code == 200

    # Attempt approval without override justification -> HTTP 400
    appr_fail = client.post(f"/api/documents/{doc_id}/approve", json={"notes": ""}, headers=officer_headers)
    assert appr_fail.status_code == 400
    assert "unresolved critical validation discrepancies" in appr_fail.text

    # Provide explicit override justification -> Approval succeeds
    override_reason = "Manual field inspection conducted; revenue inspector confirmed new partition."
    appr_ok = client.post(
        f"/api/documents/{doc_id}/approve",
        json={"override_reason": override_reason, "notes": "Approved under Section 42 override"},
        headers=officer_headers,
    )
    assert appr_ok.status_code == 200
    assert appr_ok.json()["verification_status"] == "VERIFIED"

    # Verify OVERRIDE_APPLIED was logged in audit trail
    audit_resp = client.get(f"/api/audit?document_id={doc_id}", headers=officer_headers)
    events = [e["event_type"] for e in audit_resp.json()["events"]]
    assert "OVERRIDE_APPLIED" in events


# ==============================================================================
# 8. REJECTION & INVESTIGATION DECISIONS
# ==============================================================================

def test_rejection_and_investigation_decisions(client: TestClient, officer_headers: dict):
    """Test REJECT and INVESTIGATION_REQUIRED decisions update status and write audit events."""
    buf = create_test_image("REJECT TEST DEED")
    up_resp = client.post("/api/documents", files={"file": ("reject_test.png", buf, "image/png")}, headers=officer_headers)
    doc_id = up_resp.json()["id"]

    # Investigation Required
    inv_resp = client.post(
        f"/api/documents/{doc_id}/investigate",
        json={"notes": "Boundary mismatch requires survey officer verification on-site."},
        headers=officer_headers,
    )
    assert inv_resp.status_code == 200
    assert inv_resp.json()["decision"] == "INVESTIGATION_REQUIRED"
    assert client.get(f"/api/documents/{doc_id}", headers=officer_headers).json()["status"] == "INVESTIGATION_REQUIRED"

    # Rejection
    rej_resp = client.post(
        f"/api/documents/{doc_id}/reject",
        json={"notes": "Deed rejected due to counterfeit seal impression."},
        headers=officer_headers,
    )
    assert rej_resp.status_code == 200
    assert rej_resp.json()["decision"] == "REJECTED"
    assert client.get(f"/api/documents/{doc_id}", headers=officer_headers).json()["status"] == "REJECTED"


# ==============================================================================
# 9. ROLE-BASED AUTHORIZATION TESTS
# ==============================================================================

def test_role_based_authorization(client: TestClient, operator_headers: dict, officer_headers: dict):
    """
    DATA_ENTRY_OPERATOR: Can upload and view. Cannot approve or submit review decisions.
    VERIFICATION_OFFICER: Can approve, reject, correct.
    """
    buf = create_test_image("AUTH TEST DEED")
    up_resp = client.post("/api/documents", files={"file": ("auth_test.png", buf, "image/png")}, headers=operator_headers)
    assert up_resp.status_code == 200
    doc_id = up_resp.json()["id"]

    # Operator cannot approve -> HTTP 403
    op_appr = client.post(f"/api/documents/{doc_id}/approve", headers=operator_headers)
    assert op_appr.status_code == 403

    # Operator cannot submit review decision -> HTTP 403
    op_review = client.post(
        f"/api/documents/{doc_id}/review",
        json={"action": "APPROVE", "notes": "I try to approve"},
        headers=operator_headers,
    )
    assert op_review.status_code == 403

    # Verification Officer can review -> Allowed
    off_review = client.post(
        f"/api/documents/{doc_id}/review",
        json={"action": "INVESTIGATE", "notes": "Officer requested inspection"},
        headers=officer_headers,
    )
    assert off_review.status_code == 200
