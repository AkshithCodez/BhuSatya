"""
Live End-to-End Test for BhuSatya Validation -> Review -> Correction -> Audit -> Verified Record.
Uses real Document #49 with real extracted fields on PostgreSQL.
"""
import requests
import json
import time
import subprocess
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_e2e():
    print("=" * 60)
    print("BHUSATYA LIVE E2E VALIDATION & VERIFICATION WORKFLOW")
    print("=" * 60)

    # 1. Login as Verification Officer
    print("\n[STEP 1] Authenticating as Verification Officer...")
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "officer@bhusatya.gov.in",
        "password": "BhuSatya@123"
    })
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("  -> Authenticated successfully. Token obtained.")

    doc_id = 49
    print(f"\n[STEP 2] Inspecting Document #{doc_id} extracted fields in PostgreSQL...")
    resp = requests.get(f"{BASE_URL}/api/documents/{doc_id}/fields", headers=headers)
    assert resp.status_code == 200
    fields = resp.json()
    print(f"  -> Extracted {len(fields)} fields:")
    for f in fields:
        print(f"     - {f['field_name']}: '{f['value']}' (raw: '{f['raw_value']}', status: {f['verification_status']})")
    assert len(fields) > 0, "No fields found on Document #49"

    # 3. Run Cadastral Reference Validation
    print(f"\n[STEP 3] Running Cadastral Reference Validation on Document #{doc_id}...")
    resp = requests.post(f"{BASE_URL}/api/documents/{doc_id}/validate", headers=headers)
    assert resp.status_code == 200, f"Validation failed: {resp.text}"
    val_data = resp.json()
    print(f"  -> Risk Level: {val_data['risk_level']}, Score: {val_data['risk_score']}")
    print(f"  -> Validation Results ({len(val_data['results'])} rules evaluated):")
    for r in val_data["results"]:
        status_sym = "[PASS]" if r["status"] == "PASS" else f"[{r['status']}]"
        print(f"     {status_sym} {r['rule_code'] or r['rule']}: {r['message']}")
        if r.get("evidence"):
            print(f"         Evidence: {r['evidence']}")
        if r.get("recommendation"):
            print(f"         Recommendation: {r['recommendation']}")

    # 4. Field Actions: Confirm & Correct
    print(f"\n[STEP 4] Executing Officer Field Actions (Confirm, Edit, Flag)...")
    holder_field = next(f for f in fields if f["field_name"] == "holder_name")
    
    # 4a. Update field status to CONFIRMED
    resp = requests.put(
        f"{BASE_URL}/api/fields/{holder_field['id']}/status",
        params={"status": "CONFIRMED"},
        headers=headers
    )
    assert resp.status_code == 200
    print(f"  -> Confirmed field '{holder_field['field_name']}'")

    # 4b. Field correction with reason (immutable raw value preserved)
    area_field = next(f for f in fields if f["field_name"] == "area")
    prev_area_raw = area_field["raw_value"]
    resp = requests.put(
        f"{BASE_URL}/api/fields/{area_field['id']}",
        json={
            "value": "3.28 acre",
            "reason": "Verified against physical Jamabandi record volume 4, page 12"
        },
        headers=headers
    )
    assert resp.status_code == 200
    updated_area = resp.json()
    assert updated_area["value"] == "3.28 acre"
    assert updated_area["raw_value"] == prev_area_raw, "Raw OCR value was mutated!"
    assert updated_area["verification_status"] == "CORRECTED"
    print(f"  -> Corrected field '{area_field['field_name']}' to '3.28 acre' (raw OCR preserved: '{prev_area_raw}')")

    # 5. Audit Trail Verification
    print(f"\n[STEP 5] Checking Append-Only Audit Trail in PostgreSQL...")
    resp = requests.get(f"{BASE_URL}/api/audit", params={"document_id": doc_id}, headers=headers)
    assert resp.status_code == 200
    events = resp.json()["events"]
    print(f"  -> Found {len(events)} audit events for document #{doc_id}:")
    for ev in events[-6:]:
        print(f"     [{ev['created_at']}] {ev['event_type']}: {ev['description']}")

    # 6. Officer Approval Decision
    print(f"\n[STEP 6] Executing Officer Review Decision (Approval)...")
    resp = requests.post(
        f"{BASE_URL}/api/documents/{doc_id}/approve",
        json={"notes": "All cadastral fields verified against Rampur Revenue Register."},
        headers=headers
    )
    assert resp.status_code == 200, f"Approval failed: {resp.text}"
    appr_data = resp.json()
    print(f"  -> Approval confirmed. Verification Status: {appr_data.get('verification_status')}")

    # 7. Verified Land Record Generation
    print(f"\n[STEP 7] Generating Canonical Verified Land Record (/api/documents/{doc_id}/verified-record)...")
    resp = requests.get(f"{BASE_URL}/api/documents/{doc_id}/verified-record", headers=headers)
    assert resp.status_code == 200, f"Verified record failed: {resp.text}"
    ver_record = resp.json()
    print(f"  -> Verification Status: {ver_record['verification_status']}")
    print(f"  -> Canonical Fields: {json.dumps(ver_record['fields'], indent=2)}")
    print(f"  -> Officer Sign-off: {ver_record.get('review')}")
    assert ver_record["is_verified"] is True
    assert ver_record["fields"]["holder_name"] == "Priya Sharma"
    assert ver_record["fields"]["khasra_number"] == "145/2"
    assert ver_record["fields"]["area"] == "3.28 acre"

    # 8. Clean JSON Export
    print(f"\n[STEP 8] Exporting Clean Record (/api/documents/{doc_id}/export)...")
    resp = requests.get(f"{BASE_URL}/api/documents/{doc_id}/export", headers=headers)
    assert resp.status_code == 200, f"Export failed: {resp.text}"
    export_data = resp.json()
    print(f"  -> Export Status: {export_data.get('verification_status') or export_data.get('status')}")
    print(f"  -> Exported Keys: {list(export_data.keys())}")

    print("\n[SUCCESS] All live workflow steps completed with zero dummy data.")
    return True

if __name__ == "__main__":
    run_e2e()
