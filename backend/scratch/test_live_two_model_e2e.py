"""Live End-to-End Test for Two-Model YOLO + Fusion + Crop + PaddleOCR + PostgreSQL."""
import os
import sys
import json
import urllib.request
import urllib.parse
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000/api"

# 1. Login
login_payload = json.dumps({"email": "officer@bhusatya.gov.in", "password": "BhuSatya@123"}).encode()
req = urllib.request.Request(
    f"{BASE_URL}/auth/login",
    data=login_payload,
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as resp:
    token = json.loads(resp.read())["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("[1] Logged in successfully as authorized officer.")

# 2. Upload real deed image
deed_path = r"C:\Users\reddy\.gemini\antigravity-ide\brain\5114d952-a17a-43ad-ad9c-4334ae188b1f\scratch\test_upload_deed.png"
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = []
body.append(f"--{boundary}".encode())
body.append(b'Content-Disposition: form-data; name="file"; filename="test_deed_real.png"')
body.append(b"Content-Type: image/png\r\n")
with open(deed_path, "rb") as f:
    body.append(f.read())
body.append(f"--{boundary}--\r\n".encode())
multipart_data = b"\r\n".join(body)

up_req = urllib.request.Request(
    f"{BASE_URL}/documents",
    data=multipart_data,
    headers={
        **headers,
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    },
    method="POST",
)
with urllib.request.urlopen(up_req) as resp:
    doc = json.loads(resp.read())
doc_id = doc["id"]
print(f"[2] Real land deed uploaded: Document ID #{doc_id} (Status: {doc['status']})")

# 3. Trigger Two-Model Detection Pipeline
det_req = urllib.request.Request(
    f"{BASE_URL}/documents/{doc_id}/detect",
    headers=headers,
    method="POST",
)
with urllib.request.urlopen(det_req) as resp:
    det_resp = json.loads(resp.read())

print(f"[3] Two-model YOLO detection completed:")
print(f"    Models Status: {det_resp[0].get('models_status')}")
print(f"    Raw detections returned: {len(det_resp[0].get('detections', []))}")
for d in det_resp[0].get("detections", []):
    print(f"      - [{d['model_role']}] {d['model_name']} -> {d['class_name']} ({d['confidence']:.1%}) @ {d['bbox']}")

# 4. Check Extracted / Fused Regions
reg_req = urllib.request.Request(f"{BASE_URL}/documents/{doc_id}/regions", headers=headers)
with urllib.request.urlopen(reg_req) as resp:
    regions = json.loads(resp.read())

print(f"[4] Final regions persisted in PostgreSQL: {len(regions)}")
table_region = None
for r in regions:
    print(f"      - Region #{r['id']} ({r['class_name']}): source={r['source']}, supporting={r.get('supporting_detection_ids')}, crop={r['crop_width']}x{r['crop_height']}px")
    if r["class_name"] == "table" and table_region is None:
        table_region = r

assert table_region is not None, "Error: No table region produced!"

# 5. Execute Real PaddleOCR on Table Crop
print(f"[5] Running real PaddleOCR on cropped table region #{table_region['id']}...")
ocr_req = urllib.request.Request(
    f"{BASE_URL}/regions/{table_region['id']}/extract",
    headers=headers,
    method="POST",
)
with urllib.request.urlopen(ocr_req) as resp:
    ocr_result = json.loads(resp.read())

print(f"    Genuine PaddleOCR extracted text:\n    --- START OCR ---")
print("    " + ocr_result["raw_text"].replace("\n", "\n    "))
print(f"    --- END OCR ---")

# 6. Parse Structured Fields
print("[6] Parsing structured land record fields from OCR output...")
parse_req = urllib.request.Request(
    f"{BASE_URL}/documents/{doc_id}/parse",
    headers=headers,
    method="POST",
)
with urllib.request.urlopen(parse_req) as resp:
    fields = json.loads(resp.read())

print(f"[7] Persisted {len(fields)} structured fields in PostgreSQL:")
for f in fields:
    print(f"      - {f['field_name']}: '{f['normalized_value'] or f['value']}' (Confidence: {f['confidence']:.1%})")

# 8. Check Document Status & Export
exp_req = urllib.request.Request(f"{BASE_URL}/documents/{doc_id}/export", headers=headers)
with urllib.request.urlopen(exp_req) as resp:
    export_data = json.loads(resp.read())

print(f"[8] Verification Record Exported (Doc #{export_data['document_id']}, Status: {export_data['status']}):")
print(f"    Extracted Fields count: {len(export_data['fields'])}")

# Save doc_id for restart test
with open(r"C:\Users\reddy\.gemini\antigravity-ide\brain\5114d952-a17a-43ad-ad9c-4334ae188b1f\scratch\last_two_model_doc_id.txt", "w") as f:
    f.write(str(doc_id))

print("\n>>> LIVE TWO-MODEL END-TO-END VERIFICATION: 100% SUCCESSFUL <<<")
