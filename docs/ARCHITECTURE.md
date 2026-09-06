# BhuSatya — Architecture & Technical Reference

---

## 1. End-to-End Data Flow

```
1. Ingestion
   Officer uploads Document (.jpg, .png, .pdf)
   ──> document_service.py validates size, type, extracts pages to PNG.
   ──> Document status: "UPLOADED"
   ──> Logged in Audit Trail: "DOCUMENT_UPLOADED"

2. Layout Detection (Model 1)
   POST /api/documents/{id}/detect
   ──> detector.py runs YOLOv8n (layout_detector.pt) or mock_detector.py
   ──> Returns bounding boxes (x1, y1, x2, y2, confidence, class)
   ──> crop_region() slices table, signature, and stamp crops to /detected_regions
   ──> Document status: "DETECTED"
   ──> Logged in Audit Trail: "LAYOUT_DETECTION_COMPLETED"

3. Table Text Extraction (Model 2 Hook)
   POST /api/regions/{id}/extract
   ──> factory.py selects provider (mock, manual, ocr, or custom)
   ──> Extractor returns raw text with confidence
   ──> Logged in Audit Trail: "TABLE_EXTRACTED"

4. Structured Field Normalization
   POST /api/documents/{id}/parse
   ──> field_parser.py parses raw text with regex and multi-lingual dictionary
   ──> Normalizes units (acre, hectare), numbers, and person names
   ──> Creates ExtractedField rows with provenance links
   ──> Document status: "PARSED"

5. Multi-Rule Validation & Risk Scoring
   POST /api/documents/{id}/validate
   ──> 10 independent validators cross-check extracted data vs reference tables
   ──> AreaValidator checks uploaded vs RoR vs GIS area
   ──> HolderValidator checks current certified ownership
   ──> MutationValidator checks transfer legality
   ──> risk_service.py computes 0–100 deterministic risk score and level
   ──> Document status: "VALIDATED" / "REVIEW_REQUIRED"

6. Human-in-the-Loop Officer Workstation
   PUT /api/fields/{id}
   ──> Officer edits incorrect OCR values
   ──> Requires mandatory reason string (e.g. "Verified against RoR Vol 4")
   ──> Field status becomes "CORRECTED"
   ──> Logged in Audit Trail: "FIELD_CORRECTED"

7. Official Certification & Export
   POST /api/documents/{id}/approve
   ──> Document status becomes "VERIFIED"
   ──> GET /api/documents/{id}/export downloads digitally certified JSON
   ──> Logged in Audit Trail: "DOCUMENT_APPROVED"
```

---

## 2. Database Schema (Key Entities)

| Table | Key Columns | Purpose |
| :--- | :--- | :--- |
| `documents` | `id`, `filename`, `file_type`, `status`, `risk_score`, `risk_level` | Core document record |
| `document_pages` | `id`, `document_id`, `page_number`, `image_path`, `width`, `height` | Per-page rendered image |
| `detections` | `id`, `document_id`, `page_number`, `class_name`, `confidence`, `bbox` | YOLO detection output |
| `extracted_regions` | `id`, `detection_id`, `crop_path`, `crop_width`, `crop_height` | Sliced crop image artifacts |
| `extracted_fields` | `id`, `document_id`, `field_name`, `value`, `normalized_value`, `unit`, `verification_status` | Parsed legal fields |
| `parcels` | `id`, `khasra_number`, `khata_number`, `village`, `area`, `gis_area`, `gis_polygon` | Official reference registry |
| `parcel_rights` | `id`, `parcel_id`, `person_id`, `share_fraction` | Certified owners & shares |
| `mutations` | `id`, `mutation_number`, `parcel_id`, `mutation_type`, `mutation_date` | Succession & transfer history |
| `field_corrections` | `id`, `field_id`, `previous_value`, `new_value`, `reason`, `user_id` | Audit records of officer edits |
| `audit_events` | `id`, `document_id`, `event_type`, `description`, `details`, `created_at` | Append-only security ledger |

---

## 3. UI Component Mapping

- **`/` (Dashboard)**: `DashboardPage.tsx` — Metrics for uploaded, processed, high risk, and review queue.
- **`/upload` (Upload)**: `UploadPage.tsx` — Drag-and-drop document upload supporting PDF and images.
- **`/documents/:id` (Analysis)**: `DocumentAnalysisPage.tsx` — Interactive document viewer with YOLO bounding boxes, confidence slider, crop previews, and pipeline action buttons.
- **`/review-queue` (Queue)**: `ReviewQueuePage.tsx` — Filterable verification priority queue by risk level.
- **`/review/:id` (Workstation)**: `OfficerReviewPage.tsx` — Side-by-side human-in-the-loop review, validation findings, inline field editor with mandatory reasoning, and digital certification.
- **`/parcels` (Land Records)**: `ParcelPage.tsx` — Cadastral survey SVG GIS map with WGS84 vertices, chronological mutation timeline, and ownership graph.
- **`/audit` (Audit)**: `AuditPage.tsx` — Non-repudiable audit ledger with inspection modals and JSON export.
