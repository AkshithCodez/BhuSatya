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

## 3. UI Component Mapping (Current Architecture)

- **`/` (Landing)**: [LandingPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/LandingPage.tsx) — Dual-mode landing page (`Digitize` warm earthy theme ↔ `Verify` dark theme) with official BhuSatya branding and legal capability showcases.
- **`/login` (Sign-in)**: [LoginPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/LoginPage.tsx) — Translucent glass split-layout authentication with MeriPehchaan SSO modal, forgot password modal, and one-click role selector pills.
- **`/dashboard` (Command Center)**: [OfficerDashboard.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/OfficerDashboard.tsx) — Single 240px persistent sidebar, 4 summary stat cards, 4 feature shortcuts, and recent cases table.
- **`/upload` (Ingestion)**: [UploadPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/UploadPage.tsx) — Scanned land deed ingestion with drag-and-drop zone and cadastral metadata capture.
- **`/processing` (Processing)**: [ProcessingPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/ProcessingPage.tsx) — Minimal 7-step element isolation sequence routing automatically to `/analysis`.
- **`/analysis` & `/analysis/:caseId` (Analysis)**: [DedicatedAnalysisPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/DedicatedAnalysisPage.tsx) — 65/35 document inspector with clickable bounding box overlays (`TEXT`, `TABLE`, `STAMP`, `SIGNATURE`), zoom/pan controls, and quality assessment.
- **`/verification` (Verification Queue)**: [VerificationCasesPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/VerificationCasesPage.tsx) — Status-filtered verification queue with search, priority sorting, and quick navigation.
- **`/verification/:caseId` (Adjudication Desk)**: [VerificationCaseDetailPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/VerificationCaseDetailPage.tsx) — Side-by-side verification desk with document preview, AI evidentiary findings, officer decisions (`✓ Approve`, `Manual Review`, `Flag / Reject`), and confirmation modals with mandatory remark logging.
- **`/land-records` (Cadastral Archive)**: [LandRecordsPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/LandRecordsPage.tsx) — Filterable parcel archive with search across Survey No, Owner, Village, and Record Type.
- **`/land-records/:recordId` (Parcel Detail)**: [LandRecordDetailPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/LandRecordDetailPage.tsx) — Parcel detail view with Overview, Linked Documents, 3-tier vertical Ownership Succession Timeline (2026, 2023, 2018), and Physical Boundary Verification History.
- **`/reports` (Reports & Analytics)**: [ReportsPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/ReportsPage.tsx) — Executive throughput metrics and visual charts (Monthly/Quarterly).
- **`/audit-trail` (Audit Ledger)**: [AuditTrailPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/AuditTrailPage.tsx) — Immutable activity log table with search, category filtering, and JSON inspection.
- **`/settings` (Preferences & Config)**: [SettingsPage.tsx](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/frontend/src/pages/SettingsPage.tsx) — Officer preferences, security settings, demo mode toggles, and system parameters.

