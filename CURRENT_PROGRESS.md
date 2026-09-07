# BhuSatya (SIH26018) — Current System Progress & Project Context

> **For any AI model, developer, or judge opening this repository**:  
> This document provides the complete, authoritative context on the current state of **BhuSatya**, the architecture, completed screens, demo flow, centralized data layer, and next steps.

---

## 1. Project Overview & Identity

- **Project Name**: BhuSatya
- **Full Title**: Intelligent Land Record Digitization & Validation System
- **Problem Statement ID**: SIH26018 (Smart India Hackathon 2026)
- **Target Users**: State Revenue Officers, Land Record Administrators, Data Entry Operators.
- **Core Governance Philosophy**: AI provides evidentiary element detection (Text, Tables, Stamps, Signatures) and anomaly scoring. **Final legal determination and sign-off remain strictly with authorized human revenue officers**, with every action recorded to an immutable audit trail.
- **Visual Identity**: Modern Government Enterprise Dark (`#0F1513` base, `#0A0E0D` sidebar, `#161E1B` surface, muted emerald accents `#10B981`, warm off-white typography `#F3F4F1`).

---

## 2. Executive Progress Summary

| Layer / Feature | Status | Details |
| :--- | :--- | :--- |
| **Landing Page** | ✅ Completed | Cinematic dual-mode hero (`Digitize` warm earthy theme ↔ `Verify` coordinated dark theme). Sections: Hero → Workflow → Capabilities → About BhuSatya → Final CTA → Footer. Zero SIH tags in visible ending. |
| **Authentication / Login** | ✅ Completed | Translucent glass card, dark input styling, working demo credentials (`officer@bhusatya.gov.in` / `BhuSatya@123`), auto-fill selector pills, Forgot Password modal, Government SSO (MeriPehchaan) modal. |
| **Command Center Dashboard** | ✅ Completed | Single 240px sidebar, clean top bar with universal search, 4 summary stat cards, 4 prominent feature shortcuts, 5-row recent cases table, minimal quick actions. No telemetry or audio DAW timeline clutter. |
| **Document Ingestion** | ✅ Completed | Dedicated upload page with drag-and-drop zone (PDF, PNG, JPG, TIFF) and record metadata capture (District, Taluk, Village, Survey No.). |
| **Processing Stage** | ✅ Completed | Minimal 7-step progress screen simulating element isolation without developer telemetry, automatically routing to `/analysis`. |
| **Document Analysis** | ✅ Completed | 2-column workspace: Left 65% high-contrast document viewer with subtle detection overlays (`TEXT 98.4%`, `TABLE 97.9%`, `STAMP 98.2%`, `SIGNATURE 96.8%`); Right 35% analysis panel with element counts, confidences, document quality indicator, and table extraction disclaimer. |
| **Case Adjudication Desk** | ✅ Completed | 2-panel case detail view (`/verification/:caseId`): Left document preview, Right officer review panel. Evidence findings, officer decision buttons (`✓ Approve`, `Manual Review`, `Flag / Reject`) with confirmation modals and mandatory remark logging. |
| **Centralized Data Store** | ✅ Completed | Shared `mockCases.ts`, `mockRecords.ts`, `mockAuditLogs.ts` with `localStorage` persistence. Officer approvals immediately synchronize across Dashboard, Verification list, Case detail, and Audit Trail. |
| **Cadastral Land Records** | ✅ Completed | Searchable parcel archive (`/land-records`) and detail view (`/land-records/:recordId`) with Overview, Documents, Ownership History (vertical timeline: 2026, 2023, 2018), and Verification History tabs. |
| **Reports, Audit & Settings** | ✅ Completed | Lightweight throughput reports with 2 clean visual charts (`/reports`), activity audit log table (`/audit-trail`), and officer settings (`/settings`). |
| **Production Build** | ✅ Passing | `npm run build` succeeds cleanly in ~400–600ms with 0 errors across 54 optimized modules. |

---

## 3. End-to-End Primary Demo Flow

The live frontend is fully wired and testable via the following primary user journey:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Landing Page  ├──────►│  Officer Sign-In├──────►│   Dashboard     │
│   (http://:5173)│       │     (/login)    │       │   (/dashboard)  │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
┌─────────────────┐       ┌─────────────────┐       ┌────────▼────────┐
│Document Analysis│◄──────┤Processing Screen│◄──────┤ Upload Document │
│   (/analysis)   │       │  (/processing)  │       │    (/upload)    │
└────────┬────────┘       └─────────────────┘       └─────────────────┘
         │
┌────────▼────────────────┐       ┌────────────────────────┐
│ Case Adjudication Desk  ├──────►│ Land Records & History │
│ (/verification/:caseId) │       │(/land-records/:recordId)
└─────────────────────────┘       └────────────────────────┘
```

### Detailed Steps:
1. **Landing Page (`/`)**:
   - Toggle between **Digitize** mode (warm cream and earthy palette below the hero) and **Verify** mode (smoothly darkens the entire page below the hero to `#0C1210`).
   - Review the 4 legal detection capabilities (Text, Table, Stamp, Signature).
   - Click **Open Officer Portal** or **Start Verification** to proceed.
2. **Officer Login (`/login`)**:
   - Click the **Revenue Officer** pill to auto-fill `officer@bhusatya.gov.in` and `BhuSatya@123`.
   - Click **Sign In to Workspace →** to authenticate and route to `/dashboard`.
   - Test the **Forgot Password** or **Government SSO** buttons to view their respective administrative modals.
3. **Executive Dashboard (`/dashboard`)**:
   - Single persistent `240px` sidebar with active route highlighting and officer profile at the bottom.
   - Clean top bar with universal search input (`Search Case ID, Survey No., Owner, Village or Document`).
   - 4 summary metrics: *142 Processed Today*, *18 Pending Verification*, *4 Needs Review*, *1,280 Active Records*.
   - 4 feature shortcut cards: *Upload Document*, *Document Analysis*, *Verification Cases*, *Land Records*.
   - Compact 5-row recent cases table with direct "Review →" actions.
4. **Upload Document (`/upload`)**:
   - Drag and drop or browse scanned land deeds (PDF, PNG, JPG, TIFF).
   - Record metadata form populated with District, Taluk, Village, Survey Number.
   - Click **Analyze Document →** to route to `/processing`.
5. **Processing Progress (`/processing`)**:
   - 7 clean steps: Document Uploaded → Preparing Document → Text Detection → Table Detection → Signature Detection → Stamp Detection → Preparing Review.
   - Automatically navigates to `/analysis` once complete (~2.5s).
6. **Document Analysis (`/analysis`)**:
   - Left 65%: Document canvas with clickable bounding box overlays for `TABLE 97.9%`, `TEXT 98.4%`, `STAMP 98.2%`, and `SIGNATURE 96.8%`. Zoom, fit page, and toggle controls.
   - Right 35%: Element counts, confidences, document quality ("Good"), review status ("Ready for Officer Review"), and table extraction disclaimer.
   - Click **Continue to Verification →** to open the case adjudication desk (`/verification/BLR-2026-8819`).
7. **Case Adjudication Desk (`/verification/:caseId`)**:
   - Two-panel layout with document preview on the left and AI evidentiary findings on the right.
   - Officer decision buttons: **✓ Approve**, **Manual Review**, **Flag / Reject**.
   - Clicking any decision opens a confirmation modal (with mandatory remarks for review/flag).
   - Confirming updates case state in `localStorage` and appends an entry to the Audit Trail.
8. **Cadastral Land Records Archive (`/land-records`)**:
   - Filter by District, Record Type, Status, or query Survey Number.
   - Click any record (e.g. `REC-KA-BLR-104A`) to inspect tabs:
     - **Overview**: Owner, acreage, soil classification, annual tax, GPS centroid.
     - **Documents**: Linked registered deeds and mutation extracts.
     - **Ownership History**: Vertical chronological succession timeline (2026 → 2023 → 2018).
     - **Verification History**: Past officer audits and physical boundary certifications.
9. **Logout**:
   - Click **Logout** in the bottom of the sidebar to clear the session and return to `/login`.

---

## 4. Application Architecture & Routes

```
frontend/src/
├── App.tsx                          <- Central React Router definition
├── index.css                        <- Design tokens & typography system
├── data/
│   ├── mockCases.ts                 <- Verification cases + updateCaseStatus()
│   ├── mockRecords.ts               <- Cadastral land records + timeline events
│   └── mockAuditLogs.ts             <- Audit log entries + getAuditLogs()
├── components/
│   ├── layout/
│   │   └── PortalLayout.tsx         <- Single persistent 240px sidebar + top bar
│   ├── auth/
│   │   ├── ForgotPasswordModal.tsx  <- Password recovery dialog
│   │   └── DemoSSOModal.tsx         <- MeriPehchaan government SSO prototype
│   └── landing/
│       ├── TopNavigation.tsx        <- Floating pill navbar
│       ├── ModeSwitcher.tsx         <- Digitize / Verify toggle
│       ├── HowItWorksSection.tsx    <- 3-step workflow
│       ├── CapabilitiesSection.tsx  <- 4 element detection cards
│       ├── AboutSection.tsx         <- Mission, principles & metrics
│       ├── FinalCTASection.tsx      <- Modernize Land Record Verification CTA
│       └── LandingFooter.tsx        <- Government links & privacy footer
└── pages/
    ├── LandingPage.tsx              <- Dual-mode cinematic landing page
    ├── LoginPage.tsx                <- Officer portal sign-in
    ├── OfficerDashboard.tsx         <- Overview command center
    ├── UploadPage.tsx               <- Document ingestion workspace
    ├── ProcessingPage.tsx           <- 7-step progress simulator
    ├── DedicatedAnalysisPage.tsx    <- 65/35 document element inspector
    ├── VerificationCasesPage.tsx    <- Status-filtered case list
    ├── VerificationCaseDetailPage.tsx <- Case adjudication desk & decision modal
    ├── LandRecordsPage.tsx          <- Cadastral archive table & search
    ├── LandRecordDetailPage.tsx     <- Parcel detail & ownership timeline
    ├── ReportsPage.tsx              <- Executive throughput metrics & charts
    ├── AuditTrailPage.tsx           <- Activity log table
    └── SettingsPage.tsx             <- Officer preferences & security
```

---

## 5. Machine Learning & Backend Architecture

The backend (`backend/app/`) provides:
1. **Layout Detection (YOLOv8n)**:
   - `backend/app/services/layout_detection/detector.py`: Detects table, stamp, and signature bounding boxes.
   - Includes `MockLayoutDetector` for instant, standalone demo evaluation without GPU requirements.
2. **Table Region Cropping**:
   - `backend/app/services/preprocessing_service.py`: Extracts and normalizes detected table crops.
3. **Text & Table Extraction Hook**:
   - `backend/app/services/table_extraction/factory.py`: Pluggable interface for OCR / table parsers.
   - *Model 2 research note*: Bilingual text detection experiments yielded Character Error Rate (CER) of `0.09` for English and `0.9` for historical Hindi/Kannada scripts. The pipeline exposes a clean modular interface ready for fine-tuned TrOCR / PaddleOCR / Vision-Language Model weights.
4. **10-Rule Validation Engine**:
   - `backend/app/services/validation/engine.py`: Verifies extracted parcel extents against authoritative state RoR records, cross-checks mutation chains, and validates boundary closure.
5. **Explainable Risk Scoring**:
   - `backend/app/services/risk_service.py`: Computes 0–100 risk score and categorical classification (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).

---

## 6. How to Run Locally

### Frontend (Vite + React 19 + TypeScript):
```bash
cd frontend
npm install
npm run dev
# App will run at: http://localhost:5173
```

To build production bundle:
```bash
cd frontend
npm run build
# Compiles cleanly: tsc -b && vite build
```

### Backend (FastAPI + Python):
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# API docs available at: http://localhost:8000/docs
```

---

## 7. Working Demo Credentials

For hackathon judges and evaluators:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Revenue Officer** (Primary) | `officer@bhusatya.gov.in` | `BhuSatya@123` |
| **Data Operator** (Secondary) | `operator@bhusatya.gov.in` | `BhuSatya@123` |

*(The login page also provides one-click auto-fill selector pills for instant access).*
