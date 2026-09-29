# BhuSatya — Intelligent Land Record Digitization & Cadastral Validation System

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg?style=flat-square)](https://sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/PS-SIH26018-blue.svg?style=flat-square)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TypeScript-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016%20%7C%20SQLAlchemy%202.x-336791.svg?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Ultralytics YOLO](https://img.shields.io/badge/ML-Ultralytics%20YOLOv8-111111.svg?style=flat-square&logo=yolo&logoColor=white)](https://ultralytics.com)
[![PaddleOCR](https://img.shields.io/badge/OCR-PaddleOCR%20PP--OCRv6-red.svg?style=flat-square)](https://github.com/PaddlePaddle/PaddleOCR)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Core System Principle:**  
> *AI assists document digitization, visual element extraction, and anomaly detection. Final legal verification and approval authority remains strictly with authorized government revenue officials.*

---

## Executive Summary

**BhuSatya** (भू-सत्य / *Earth's Truth*) is an enterprise-grade, human-in-the-loop land record digitization and verification platform developed for **Smart India Hackathon 2026 (Problem Statement ID: SIH26018)**. 

Indian revenue departments manage millions of historical, complex, and partially degraded land records (e.g., Sale Deeds, Records of Rights / Jamabandi, Mutation Orders, and Patta certificates). Manual digitization is error-prone and vulnerable to land title discrepancies, while fully automated "black-box" systems are legally non-viable in revenue jurisprudence.

**BhuSatya bridges this gap** by combining:
1. **Dual-Model Ultralytics YOLO Vision:** Specialized detectors for macro document layout and micro legal document elements (stamps, signatures, tables).
2. **Table Fusion & Deduplication:** Spatial IoU algorithms reconciling multi-detector predictions.
3. **Deep Learning Tabular OCR (PaddleOCR):** High-accuracy text extraction on cropped table regions.
4. **Deterministic Cadastral Validation Engine:** Multi-rule verification comparing extracted document data against official cadastral registries, historical revenue records, and GIS satellite measurements.
5. **Government Officer Review & Append-Only Audit Trail:** A full human-in-the-loop workflow enabling field-level corrections with raw OCR provenance and complete evidentiary audit logs.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DOCUMENT INGESTION                                   │
│            Land Deeds / Jamabandi / Mutation Certificates (PDF / Scanned Images)       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             DUAL-MODEL COMPUTER VISION                                 │
│  ┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐  │
│  │   Model A: Land Layout Detector      │    │ Model B: Document Element Detector   │  │
│  │   (YOLOv8n — 10 Layout Classes)      │    │ (YOLOv8n — Table / Signature / Stamp)│  │
│  └──────────────────┬───────────────────┘    └──────────────────┬───────────────────┘  │
│                     │                                           │                      │
│                     └─────────────────────┬─────────────────────┘                      │
│                                           ▼                                            │
│                       Spatial IoU Table Fusion & Deduplication                         │
│                    (Preserves Signatures, Stamps, & Fused Tables)                      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TEXT EXTRACTION & STRUCTURED PARSING                            │
│  ┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐  │
│  │   Sub-Image Region Cropping          │───►│   PaddleOCR Deep Learning Engine     │  │
│  │   (High-DPI Region Bounding Boxes)   │    │   (PP-OCRv6 Text & Recognition)      │  │
│  └──────────────────────────────────────┘    └──────────────────┬───────────────────┘  │
│                                                                 ▼                      │
│                                                      Structured Field Parser           │
│                                             (Khasra, Khata, Owner, Area, Village)      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     MULTI-TIER CADASTRAL VALIDATION ENGINE                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │  • Mandatory Field Check       • Cadastral Registry Match   • Share Math Check   │  │
│  │  • Khasra/Parcel Syntax Check  • Area Consistency (GIS/RoR) • Mutation Approval  │  │
│  │  • Administrative Hierarchy    • Owner Identity & Rights    • Cross-Record Check │  │
│  └──────────────────────────────────────────┬───────────────────────────────────────┘  │
│                                             ▼                                          │
│                           Deterministic Evidentiary Risk Score                         │
│                           (LOW / MEDIUM / HIGH / CRITICAL)                             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       HUMAN-IN-THE-LOOP OFFICER WORKFLOW                               │
│  ┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐  │
│  │   Side-by-Side Review Workspace      │    │   Append-Only PostgreSQL Audit Trail │  │
│  │   • Visual Bounding Box Inspection   │    │   • Every edit logged with timestamp │  │
│  │   • Field Confirm / Edit / Flag      │    │   • Preserves raw OCR vs corrected   │  │
│  │   • Evidence Explanations            │    │   • Officer identity tracking        │  │
│  └──────────────────┬───────────────────┘    └──────────────────┬───────────────────┘  │
│                     │                                           │                      │
│                     └─────────────────────┬─────────────────────┘                      │
│                                           ▼                                            │
│                         OFFICER DECISION: APPROVE / REJECT                             │
│                                           ▼                                            │
│                         Canonical Verified Record & JSON Export                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Dual-Model Machine Learning Pipeline
- **Model A — Land Layout Detector (`land_layout_detector.pt`):** Trained on cadastral documents to classify 10 layout elements: `abandon`, `figure`, `figure_caption`, `formula_caption`, `isolate_formula`, `plain_text`, `table`, `table_caption`, `table_footnote`, `title`.
- **Model B — Document Element Detector (`table_signature_stamp_detector.pt`):** High-precision detector for legal verification markers: `table`, `signature`, `stamp`.
- **Intelligent Table Fusion:** Overlapping table bboxes across models are mathematically merged using Intersection-over-Union ($\text{IoU} \ge 0.70$), picking the optimal bounding box while preserving signatures and stamps.
- **Resource Optimization:** Both models run as persistent memory singletons on CPU/GPU without re-instantiation per request.

### 2. High-Accuracy Tabular OCR (PaddleOCR)
- Uses state-of-the-art **PP-OCRv6** lightweight neural networks for text detection and directional recognition.
- Automatically handles degraded scan conditions, varying contrast, and complex tabular structures typical in Indian revenue paperwork.
- Completely eliminates mock/dummy OCR data in production.

### 3. Multi-Rule Cadastral Validation Engine
Validates parsed document fields against official cadastral ground-truth:
| Validation Rule | Category | Description |
|---|---|---|
| `REQUIRED_FIELD_PRESENT` | Syntax | Verifies mandatory fields (Khasra No., Landowner Name, Area). |
| `PARCEL_FORMAT` | Syntax | Validates Indian land parcel syntax (e.g., standard numbers or fractional `145/2`). |
| `ADMIN_HIERARCHY` | Spatial | Cross-checks Village, Tehsil, and District against official revenue master records. |
| `PARCEL_EXISTS` | Cadastral | Confirms the parcel exists in the official cadastral registry. |
| `AREA_CONSISTENCY` | Cadastral | Cross-checks document area against GIS satellite measurements and historical RoR within tolerance. |
| `HOLDER_MATCH` | Legal | Evaluates extracted landowner name against current registered rights holder. |
| `MUTATION_EXISTS` | Revenue | Verifies mutation order number against state revenue mutation register. |
| `MUTATION_PARCEL_MATCH` | Revenue | Ensures the referenced mutation applies to the exact parcel under review. |
| `MUTATION_STATUS` | Legal | Confirms whether the mutation was approved, pending, or contested. |
| `SHARE_TOTAL` | Math | Validates that recorded parcel shares sum up exactly to 100% (1/1). |
| `CROSS_RECORD_CONSISTENT`| Integrity | Validates that deed details do not conflict with previous verified documents. |

### 4. Officer Review Workspace & Immutable Audit Trail
- **Dual-Pane UI:** Side-by-side view showing the original rendered deed with interactive YOLO bounding boxes alongside extracted tabular records.
- **Field Correction Provenance:** When an officer corrects a field, the original raw OCR extraction is permanently preserved, while the active value is updated.
- **Append-Only Audit Log:** All events (`DOCUMENT_UPLOADED`, `INFERENCE_COMPLETED`, `FIELD_UPDATED`, `VALIDATION_EXECUTED`, `DECISION_RECORDED`) are logged with the authenticated officer ID, timestamp, and metadata in PostgreSQL.
- **Tamper-Resistant Export:** Generates an official, signed JSON export containing canonical record data and complete verification provenance.

---

## Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Backend** | Python 3.11, FastAPI | High-performance async REST API |
| **Database** | PostgreSQL 16, SQLAlchemy 2.x, Alembic | Relational database, ORM, and schema migrations |
| **Object Detection** | Ultralytics YOLOv8 | Layout, table, signature, and stamp detection |
| **Text Recognition** | PaddleOCR (PP-OCRv6), PyMuPDF, Pillow | Tabular text recognition and PDF rasterization |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Responsive, modern government officer portal |
| **Icons & Charts** | Lucide React | Clean, professional UI components |
| **Containerization** | Docker, Debian Bookworm Slim | Reproducible production backend environment |
| **Cloud Hosting** | Vercel (Frontend), Railway (Backend + DB + Volume) | Production deployment architecture |

---

## Repository Structure

```text
BhuSatya/
├── backend/
│   ├── alembic/                      # Database migration scripts & environment
│   ├── app/
│   │   ├── api/                      # REST API endpoints (auth, docs, detections, validation, review)
│   │   ├── db/                       # PostgreSQL connection, session management, seed script
│   │   ├── models/                   # SQLAlchemy declarative models (documents, audit, users, parcels)
│   │   ├── schemas/                  # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── layout_detection/     # YOLO Model A, Model B, fusion & crop services
│   │   │   ├── table_extraction/     # PaddleOCR extractor & base classes
│   │   │   ├── validation/           # Cadastral validation rules & risk engine
│   │   │   ├── audit_service.py      # Immutable audit logging service
│   │   │   └── field_parser.py       # Domain-specific land record field parsing
│   │   ├── config.py                 # Centralized settings & path resolution
│   │   └── main.py                   # FastAPI application & lifecycle hooks
│   ├── ml_models/                    # Trained YOLO model weights (.pt)
│   ├── tests/                        # 43 automated unit, integration, and E2E tests
│   ├── Dockerfile                    # Production backend container definition
│   └── requirements.txt              # Pinned Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/                      # Axios API client with auth token interceptor
│   │   ├── components/               # Reusable UI components, tables, modals, badges
│   │   ├── pages/                    # Portal views (Dashboard, Upload, Analysis, Verification, Audit)
│   │   ├── types/                    # TypeScript interfaces for API contracts
│   │   └── main.tsx                  # React entry point
│   ├── vercel.json                   # Vercel SPA routing rewrite rules
│   └── package.json                  # Frontend dependencies and build scripts
└── README.md                         # Complete project documentation & setup guide
```

---

## Step-by-Step Local Setup Guide

Follow these instructions to run the entire BhuSatya stack locally.

### Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.11** (`python --version`)
- **Node.js 18+** & **npm** (`node --version`, `npm --version`)
- **PostgreSQL 16** (running natively on port `5432`)
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/AkshithCodez/BhuSatya.git
cd BhuSatya
```

---

### Step 2: Set Up PostgreSQL Database

1. Open your PostgreSQL shell (`psql`) or pgAdmin.
2. Create the database user and database:

```sql
CREATE USER bhusatya WITH PASSWORD 'password';
CREATE DATABASE bhusatya OWNER bhusatya;
GRANT ALL PRIVILEGES ON DATABASE bhusatya TO bhusatya;
```

---

### Step 3: Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   # Windows
   copy .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

   *Verify your `.env` contains:*
   ```env
   DATABASE_URL=postgresql+psycopg://bhusatya:password@localhost:5432/bhusatya
   SECRET_KEY=CHANGE_THIS_TO_A_RANDOM_SECRET_KEY
   STORAGE_ROOT=.
   TABLE_TEXT_PROVIDER=paddle_ocr
   LAND_LAYOUT_MODEL_PATH=./ml_models/land_layout_detector.pt
   DOCUMENT_ELEMENT_MODEL_PATH=./ml_models/table_signature_stamp_detector.pt
   DEMO_MODE=false
   TESTING=false
   FRONTEND_URL=http://localhost:5173
   ```

5. Run database migrations:
   ```bash
   python -m alembic upgrade head
   ```

6. Seed prototype reference data *(Cadastral records, reference parcels, and demo officer accounts)*:
   ```bash
   python -m app.seed
   ```

7. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Live Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### Step 4: Frontend Setup

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure `.env`:
   ```bash
   copy .env.example .env
   ```
   *In local development, leaving `VITE_API_BASE_URL` empty automatically routes requests via the Vite proxy (`/api` → `http://127.0.0.1:8000`).*

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

### Step 5: Demo Officer Credentials

Use these credentials to log in to the officer review portal:

| Role | Email | Password |
|---|---|---|
| **Verification Officer** | `officer@bhusatya.gov.in` | `BhuSatya@123` |
| **Data Entry Operator** | `operator@bhusatya.gov.in` | `BhuSatya@123` |
| **System Administrator** | `admin@bhusatya.gov.in` | `BhuSatya@123` |

---

### Step 6: Running Automated Tests

To run the complete automated test suite (43 tests covering integration, unit, two-model YOLO, and cadastral validation logic):

```bash
cd backend
python -m pytest tests/ -v
```

---

## Production Cloud Deployment (Vercel & Railway)

BhuSatya is architected for zero-downtime, scalable cloud deployment:

### 1. Railway Backend & Database
1. **Provision PostgreSQL**: In [Railway](https://railway.app), create a new project and add a **PostgreSQL 16** service.
2. **Deploy Backend**: Click **New Service** → **GitHub Repo**, select repository root directory `backend`. Railway will build automatically using `backend/Dockerfile`.
3. **Mount Persistent Volume**: In the backend service settings, add a Persistent Volume mounted at `/data` (5–10 GB) to persist uploaded deeds, rendered pages, and crops.
4. **Environment Variables**:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` *(Auto-references provisioned Railway DB)*
   - `STORAGE_ROOT`: `/data`
   - `TABLE_TEXT_PROVIDER`: `paddle_ocr`
   - `LAND_LAYOUT_MODEL_PATH`: `./ml_models/land_layout_detector.pt`
   - `DOCUMENT_ELEMENT_MODEL_PATH`: `./ml_models/table_signature_stamp_detector.pt`
   - `SECRET_KEY`: *(Generate secure 64-char hex key)*
   - `FRONTEND_URL` / `FRONTEND_ORIGIN`: `https://<your-vercel-domain>.vercel.app`
   - `DEMO_MODE`: `false`
   - `TESTING`: `false`
5. **Startup**: The container runs `python -m alembic upgrade head` to apply all migrations automatically before starting Uvicorn with a single worker.

### 2. Vercel Frontend SPA
1. In [Vercel](https://vercel.com), click **Add New Project** → Import the BhuSatya repository.
2. Set Root Directory to `frontend`.
3. Framework Preset: `Vite`. Build Command: `npm run build`, Output Directory: `dist`.
4. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://<your-railway-service>.up.railway.app` *(without trailing slash)*
5. The included `frontend/vercel.json` ensures that all client-side routes (e.g., `/verification/49`, `/audit-trail`) support direct browser refresh.

---

## Ethical & Legal Compliance Notice

BhuSatya is engineered in strict accordance with the evidentiary requirements of Indian revenue jurisprudence:
1. **No Automated Approvals:** AI models only generate recommendations and highlight discrepancies; legal acceptance or rejection requires explicit, authenticated officer sign-off.
2. **Evidentiary Traceability:** Bounding-box regions, original OCR readings, and intermediate feature vectors are permanently linked to the record.
3. **Neutral Language:** The system does not label discrepancies as "fraud" or "fake"; it presents factual deviations from registered cadastral baselines.

---

## Acknowledgments & License

Developed for **Smart India Hackathon 2026** under Problem Statement **SIH26018**.  
Released under the [MIT License](LICENSE).
