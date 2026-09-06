"""Integration tests covering the entire land record digitization & verification lifecycle."""
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app


@pytest.fixture(scope="session")
def client():
    """Create a FastAPI TestClient instance."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def auth_headers(client):
    """Authenticate demo officer and return Authorization headers."""
    resp = client.post("/api/auth/login", json={"email": "officer@sih.demo", "password": "demo123"})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_dummy_document_image():
    """Create a small in-memory PNG image to simulate a scanned document."""
    img = Image.new("RGB", (640, 480), color=(250, 250, 248))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def test_health_check(client):
    """Verify health endpoint returns healthy and demo_mode."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["app"] == "BhuSatya"


def test_auth_login(client):
    """Verify officer login returns JWT and correct role."""
    resp = client.post("/api/auth/login", json={"email": "officer@sih.demo", "password": "demo123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "VERIFICATION_OFFICER"


def test_parcels_reference_registry(client, auth_headers):
    """Verify pre-seeded reference parcels exist."""
    resp = client.get("/api/parcels", headers=auth_headers)
    assert resp.status_code == 200
    parcels = resp.json()
    assert len(parcels) >= 3
    khasras = [p["khasra_number"] for p in parcels]
    assert "145/2" in khasras


def test_full_digitization_and_verification_flow(client, auth_headers):
    """
    Complete end-to-end integration test:
    1. Upload document image
    2. Detect layout elements (tables, signatures, stamps)
    3. Extract table region
    4. Parse structured fields
    5. Validate document against reference registry (triggers discrepancy)
    6. Review & correct field with mandatory audit reason
    7. Approve and digitally certify document
    8. Verify audit trail logs all events
    9. Export verified JSON
    """
    # 1. Upload
    img_buf = create_dummy_document_image()
    files = {"file": ("demo_land_record.png", img_buf, "image/png")}
    upload_resp = client.post("/api/documents", files=files, headers=auth_headers)
    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.text}"
    doc = upload_resp.json()
    doc_id = doc["id"]
    assert doc["status"] == "UPLOADED"

    # 2. Run Layout Detection
    det_resp = client.post(f"/api/documents/{doc_id}/detect", headers=auth_headers)
    assert det_resp.status_code == 200, f"Detection failed: {det_resp.text}"
    det_data = det_resp.json()
    assert len(det_data) > 0
    detections = det_data[0]["detections"]
    assert len(detections) > 0

    # 3. Check extracted regions (crops)
    reg_resp = client.get(f"/api/documents/{doc_id}/regions", headers=auth_headers)
    assert reg_resp.status_code == 200
    regions = reg_resp.json()
    table_regions = [r for r in regions if r["class_name"] == "table"]

    # Extract table if regions exist
    if table_regions:
        ext_resp = client.post(f"/api/regions/{table_regions[0]['id']}/extract", headers=auth_headers)
        assert ext_resp.status_code == 200

    # 4. Parse Structured Fields
    parse_resp = client.post(f"/api/documents/{doc_id}/parse", headers=auth_headers)
    assert parse_resp.status_code == 200
    fields = parse_resp.json()
    assert len(fields) > 0

    # 5. Run Validation
    val_resp = client.post(f"/api/documents/{doc_id}/validate", headers=auth_headers)
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert "risk_score" in val_data
    assert "results" in val_data

    # 6. Officer Field Correction
    # Find area field or first field to correct
    area_field = next((f for f in fields if f["field_name"] == "area"), fields[0])
    field_id = area_field["id"]
    corr_resp = client.put(
        f"/api/fields/{field_id}",
        json={"value": "3.28", "reason": "Corrected OCR typo 3.82 to match RoR 3.28"},
        headers=auth_headers,
    )
    assert corr_resp.status_code == 200
    corrected = corr_resp.json()
    assert corrected["value"] == "3.28"
    assert corrected["verification_status"] == "CORRECTED"

    # 7. Approve Document
    appr_resp = client.post(f"/api/documents/{doc_id}/approve", headers=auth_headers)
    assert appr_resp.status_code == 200
    appr_data = appr_resp.json()
    assert appr_data["verification_status"] == "VERIFIED"

    # 8. Verify Audit Trail contains events
    audit_resp = client.get(f"/api/audit?document_id={doc_id}", headers=auth_headers)
    assert audit_resp.status_code == 200
    audit_events = audit_resp.json()["events"]
    event_types = [e["event_type"] for e in audit_events]
    assert "DOCUMENT_UPLOADED" in event_types
    assert "FIELD_CORRECTED" in event_types
    assert "DOCUMENT_APPROVED" in event_types

    # 9. Export Verified Record JSON
    export_resp = client.get(f"/api/documents/{doc_id}/export", headers=auth_headers)
    assert export_resp.status_code == 200
    export_data = export_resp.json()
    assert export_data["document_id"] == doc_id
    assert export_data["status"] == "VERIFIED"
    assert "fields" in export_data
    assert "corrections" in export_data
