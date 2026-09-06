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
| **Officer Review Workstation** | ✅ **Completed** | `frontend/src/pages/OfficerReviewPage.tsx`. Split view: document with bounding boxes + editable fields with mandatory audit reason logging. |
| **Immutable Audit Trail** | ✅ **Completed** | `backend/app/services/audit_service.py` & `frontend/src/pages/AuditPage.tsx`. Append-only ledger for all inferences, edits, approvals. |
| **Cadastral GIS Map & Timeline** | ✅ **Completed** | `frontend/src/pages/ParcelPage.tsx`. SVG survey polygon visualizer with WGS84 vertices, chronological timeline, and land ownership graph. |
| **Automated Tests** | ✅ **Completed** | 11/11 tests passing in `backend/tests/` (`test_unit.py` and `test_integration.py`). |

---

## 4. Key Directory & File Map

```
BhuSatya/
├── README.md                           <- User guide and setup
├── AGENTS.md                           <- This developer and AI onboarding guide
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
│   │       ├── layout_detection/       <- Model 1 YOLO loader & schemas
│   │       ├── table_extraction/       <- Pluggable Model 2 factory & providers
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
    │   ├── api/client.ts               <- Axios API client connecting to backend
    │   ├── pages/                      <- 7 core UI pages
    │   │   ├── LoginPage.tsx           <- Official login
    │   │   ├── DashboardPage.tsx       <- High-level operational stats
    │   │   ├── UploadPage.tsx          <- Drag-and-drop document upload
    │   │   ├── DocumentAnalysisPage.tsx<- Bounding box canvas & pipeline trigger
    │   │   ├── ReviewQueuePage.tsx     <- Prioritized discrepancy queue
    │   │   ├── OfficerReviewPage.tsx   <- Human-in-the-loop correction & certification
    │   │   ├── ParcelPage.tsx          <- GIS Cadastral Map, Timeline & Graph
    │   │   └── AuditPage.tsx           <- Immutable audit ledger
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
