# BhuSatya (SIH26018) — AI Context, Progress & Developer Onboarding

> **For any AI model or developer opening this repository**:  
> Read this document first. It provides an immediate overview of the system architecture, what is completed, current status, file conventions, and exactly where next steps (like Model 2 integration) hook in.

---

## 1. Project Identity & Problem Statement
- **Problem Statement ID**: SIH26018 — *Intelligent Land Record Digitization and Validation System*
- **Target Users**: Government revenue / land-record verification officers.
- **Core Principle**: AI assists in digitizing historical records, extracting tables/stamps/signatures, and flagging anomalies. **Final decision-making, approval, and certification remain strictly with authorized human officials**, with every action recorded to an immutable audit trail.

---

## 2. Quick Architecture Summary

```
                      ┌─────────────────────────────────────────┐
                      │    React 19 + TypeScript + Vite + CSS   │
                      │  Interactive Canvas, Workstation, GIS   │
                      └────────────────────┬────────────────────┘
                                           │ REST API (port 8000)
                      ┌────────────────────▼────────────────────┐
                      │             FastAPI Backend             │
                      │  Routers: docs, ml, validation, audit   │
                      └────┬───────────────┬────────────────┬───┘
                           │               │                │
            ┌──────────────▼─────┐  ┌──────▼──────┐  ┌──────▼─────────┐
            │   Model 1 (YOLO)   │  │   Model 2   │  │ Validation DB  │
            │ Table/Stamp/Sign   │  │ Table Text  │  │ 10 Rule Engine │
            │   (layout_detector)│  │ (Pluggable) │  │ Risk Scoring   │
            └────────────────────┘  └─────────────┘  └────────────────┘
```

---

## 3. Implementation Status Dashboard

| Component / Layer | Status | Implementation Details |
| :--- | :--- | :--- |
| **Model 1 (Layout Detector)** | ✅ **Completed** | `backend/app/services/layout_detection/detector.py`. Loads YOLOv8n (`layout_detector.pt`). Has `MockLayoutDetector` fallback for `DEMO_MODE`. |
| **Table Region Cropping** | ✅ **Completed** | `backend/app/services/preprocessing_service.py` (`crop_region`). Crops saved in `backend/detected_regions/` and served via `/api/regions/{id}/image`. |
| **Model 2 (Table Text Extractor)** | 🟡 **Pluggable Hook Ready** | `backend/app/services/table_extraction/factory.py`. Currently defaults to `mock` or `ocr`. Ready for custom teammate model. |
| **Field Normalizer & Parser** | ✅ **Completed** | `backend/app/services/field_parser.py`. Regex & multi-lingual alias dictionary (Hindi/English). Collision-safe matching. |
| **10-Rule Validation Engine** | ✅ **Completed** | `backend/app/services/validation/engine.py`. Cross-checks against authoritative RoR records, GIS spatial area, mutation succession chains. |
| **Deterministic Risk Scoring** | ✅ **Completed** | `backend/app/services/risk_service.py`. Generates explainable 0–100 score and categorical risk levels (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`). |
| **Officer Review Workstation** | ✅ **Completed** | `frontend/src/pages/VerificationCaseDetailPage.tsx`. Split view: document with bounding boxes + editable fields with mandatory audit reason logging. |
| **Immutable Audit Trail** | ✅ **Completed** | `backend/app/services/audit_service.py` & `frontend/src/pages/AuditTrailPage.tsx`. Append-only ledger for all inferences, edits, approvals. |
| **Cadastral GIS Map & Timeline** | ✅ **Completed** | `frontend/src/pages/LandRecordDetailPage.tsx`. SVG survey polygon visualizer with WGS84 vertices, chronological timeline, and land ownership graph. |
| **Automated Tests** | ✅ **Completed** | 11/11 tests passing in `backend/tests/` (`test_unit.py` and `test_integration.py`). |

---

## 4. Key Directory & File Map

```
BhuSatya/
├── README.md                           <- User guide and setup
├── AGENTS.md                           <- This developer and AI onboarding guide
├── CURRENT_PROGRESS.md                 <- Authoritative state of progress & demo journey
├── docs/
│   ├── ARCHITECTURE.md                 <- Technical deep-dive & schemas
│   ├── MODEL_INTEGRATION_GUIDE.md      <- Step-by-step for Model 1 and Model 2
│   └── PROGRESS_TRACKER.md             <- Task checklist & completed milestones
├── backend/
│   ├── app/
│   │   ├── api/                        <- FastAPI routers (auth, documents, detections, etc.)
│   │   ├── db/                         <- database.py, seed.py (pre-seeds 3 demo parcels)
│   │   ├── models/                     <- SQLAlchemy ORM models (16+ tables)
│   │   ├── schemas/                    <- Pydantic request/response schemas
│   │   └── services/
│   │       ├── layout_detection/       <- YOLO element detection loader & schemas
│   │       ├── table_extraction/       <- Pluggable OCR / table parser factory & providers
│   │       ├── validation/             <- 10 cross-check validators & engine
│   │       ├── field_parser.py         <- Structured regex extractor
│   │       ├── risk_service.py         <- 0-100 deterministic risk scorer
│   │       └── audit_service.py        <- Append-only audit logger
│   ├── ml_models/                      <- WHERE layout_detector.pt MUST BE PLACED
│   ├── tests/                          <- Pytest unit and integration test suite
│   ├── bhusatya.db                     <- SQLite local database
│   └── requirements.txt                <- Python dependencies
└── frontend/
    ├── src/
    │   ├── data/
    │   │   ├── mockCases.ts            <- Centralized verification cases + persistence
    │   │   ├── mockRecords.ts          <- Cadastral records + ownership history timeline
    │   │   └── mockAuditLogs.ts        <- Audit log entries
    │   ├── components/
    │   │   ├── ui/                     <- Unified design system (Badge, BarChart, Button, Field, KeyValue, Modal, PageHeader, Panel, SegmentedControl, StatCard, Table, Toggle, tone)
    │   │   ├── branding/               <- Official BhuSatya brand logo & wordmark components
    │   │   ├── layout/PortalLayout.tsx <- Single persistent 240px sidebar + topbar
    │   │   ├── auth/                   <- ForgotPasswordModal, DemoSSOModal
    │   │   └── landing/                <- Hero, ModeSwitcher, HowItWorks, Capabilities, About, Footer
    │   ├── pages/
    │   │   ├── LandingPage.tsx         <- Dual-mode cinematic landing page
    │   │   ├── LoginPage.tsx           <- Officer portal sign-in (glass card)
    │   │   ├── OfficerDashboard.tsx    <- Overview command center (4 stats, 4 shortcuts, recent cases)
    │   │   ├── UploadPage.tsx          <- Drag-and-drop ingestion workspace
    │   │   ├── ProcessingPage.tsx      <- 7-step progress simulator
    │   │   ├── DedicatedAnalysisPage.tsx <- 65/35 document element inspector
    │   │   ├── VerificationCasesPage.tsx <- Status-filtered case list
    │   │   ├── VerificationCaseDetailPage.tsx <- Case adjudication desk & decision modal
    │   │   ├── LandRecordsPage.tsx     <- Cadastral archive table & search
    │   │   ├── LandRecordDetailPage.tsx<- Parcel detail & ownership timeline
    │   │   ├── ReportsPage.tsx         <- Executive throughput metrics & charts
    │   │   ├── AuditTrailPage.tsx      <- Activity log table
    │   │   └── SettingsPage.tsx        <- Officer preferences & security
    │   └── types/index.ts              <- TypeScript models matching backend schemas
    └── package.json
```

---

## 5. How to Run Locally

### Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/health`

### Frontend
```powershell
cd frontend
npm run dev
```
- Web UI: `http://localhost:5173`
- Demo Officer: `officer@sih.demo` / `demo123`
