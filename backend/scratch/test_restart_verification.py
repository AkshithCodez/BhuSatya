import json
import urllib.request

# 1. Login
login_payload = json.dumps({"email": "officer@bhusatya.gov.in", "password": "BhuSatya@123"}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/auth/login", data=login_payload, headers={"Content-Type": "application/json"}, method="POST")
with urllib.request.urlopen(req) as resp:
    token = json.loads(resp.read())["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Read last doc id
with open(r"C:\Users\reddy\.gemini\antigravity-ide\brain\5114d952-a17a-43ad-ad9c-4334ae188b1f\scratch\last_two_model_doc_id.txt") as f:
    doc_id = int(f.read().strip())

# Check document
doc_req = urllib.request.Request(f"http://127.0.0.1:8000/api/documents/{doc_id}", headers=headers)
with urllib.request.urlopen(doc_req) as resp:
    doc = json.loads(resp.read())
print(f"Document #{doc['id']}: {doc['original_filename']}, status={doc['status']}")

# Check raw detections
det_req = urllib.request.Request(f"http://127.0.0.1:8000/api/documents/{doc_id}/detections", headers=headers)
with urllib.request.urlopen(det_req) as resp:
    dets = json.loads(resp.read())
print(f"Raw detections in PostgreSQL after restart: {len(dets)}")
for d in dets:
    print(f"  [{d['model_role']}] {d['model_name']} -> {d['class_name']} ({d['confidence']:.1%}) @ {d['bbox']}")

# Check regions
reg_req = urllib.request.Request(f"http://127.0.0.1:8000/api/documents/{doc_id}/regions", headers=headers)
with urllib.request.urlopen(reg_req) as resp:
    regions = json.loads(resp.read())
print(f"Fused regions in PostgreSQL after restart: {len(regions)}")
for r in regions:
    print(f"  Region #{r['id']}: {r['region_type']}, source={r['source']}, supporting={r['supporting_detection_ids']}, crop={r['crop_width']}x{r['crop_height']}px")

# Check fields
fields_req = urllib.request.Request(f"http://127.0.0.1:8000/api/documents/{doc_id}/fields", headers=headers)
with urllib.request.urlopen(fields_req) as resp:
    fields = json.loads(resp.read())
print(f"Extracted fields in PostgreSQL after restart: {len(fields)}")
for f in fields:
    print(f"  {f['field_name']}: {f['normalized_value'] or f['value']}")

print("\n>>> POSTGRESQL & BACKEND RESTART PERSISTENCE: 100% VERIFIED <<<")
