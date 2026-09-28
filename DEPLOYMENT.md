# BhuSatya — Cloud Deployment Guide

**SIH26018 Intelligent Land Record Digitization and Validation System**

This guide documents the production deployment architecture for BhuSatya:
- **Frontend**: Vercel (React + Vite SPA)
- **Backend**: Railway (Docker containerized FastAPI service with real YOLO & PaddleOCR models)
- **Database**: Railway PostgreSQL 16 (persisting cadastral parcels, extractions, validations, reviews, and audit events)
- **Persistent Storage**: Railway Volume mounted at `/data` (persisting uploaded deeds, page renders, and cropped table regions)

---

## Architecture Overview

```text
┌──────────────────────────┐           ┌────────────────────────────────────────┐
│      Vercel (SPA)        │  HTTPS    │           Railway (Container)          │
│  React + TypeScript      ├──────────►│  FastAPI + Python 3.11                 │
│  Static CDN Distribution │           │  Single Uvicorn Worker (Memory Safe)   │
└──────────────────────────┘           └───┬───────────────────────────────┬────┘
                                           │                               │
                                           │ /data                         │ SQL
                                           ▼                               ▼
                              ┌─────────────────────────┐     ┌────────────────────────┐
                              │     Railway Volume      │     │   Railway PostgreSQL   │
                              │  /data/uploads          │     │  parcels, rights       │
                              │  /data/document_pages   │     │  extractions, audit    │
                              │  /data/detected_regions │     │  validation_results    │
                              └─────────────────────────┘     └────────────────────────┘
```

---

## Part 1: Railway Backend & Database Deployment

### 1. Create Railway Project & Provision PostgreSQL
1. Log in to [Railway](https://railway.app).
2. Click **New Project** → **Provision PostgreSQL**.
3. Railway will provision a dedicated PostgreSQL 16 database and automatically create a `DATABASE_URL` variable.

### 2. Deploy the Backend Service
1. In the same project, click **New Service** → **GitHub Repo**.
2. Select your BhuSatya repository and choose the `deployment` branch.
3. Configure **Service Settings**:
   - **Root Directory**: `backend`
   - **Build**: Uses `backend/Dockerfile` automatically.
4. Add a **Persistent Volume**:
   - In the backend service settings, go to the **Volumes** tab.
   - Click **Add Volume**.
   - Set **Mount Path** to `/data`.
   - Size: 5 GB to 10 GB (sufficient for deeds, pages, and detection crops).

### 3. Configure Backend Environment Variables
In the Railway backend service **Variables** tab, set:

| Variable | Recommended Value | Description |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-reference to the provisioned Railway PostgreSQL |
| `STORAGE_ROOT` | `/data` | Mount point of the persistent Railway volume |
| `TABLE_TEXT_PROVIDER` | `paddle_ocr` | Real PaddleOCR table extractor |
| `LAND_LAYOUT_MODEL_PATH` | `./ml_models/land_layout_detector.pt` | Model A checkpoint (bundled in container) |
| `DOCUMENT_ELEMENT_MODEL_PATH` | `./ml_models/table_signature_stamp_detector.pt` | Model B checkpoint (bundled in container) |
| `FRONTEND_URL` | `https://<your-vercel-domain>.vercel.app` | Production frontend domain for CORS |
| `FRONTEND_ORIGIN` | `https://<your-vercel-domain>.vercel.app` | Additional CORS origin |
| `SECRET_KEY` | *(Generate a 64-char hex key)* | JWT encryption key |
| `DEMO_MODE` | `false` | Disables mock fallbacks |
| `TESTING` | `false` | Production runtime guard |

### 4. Automatic Database Migrations on Startup
The container starts via:
```bash
python -m alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
```
This automatically runs all Alembic migrations against Railway PostgreSQL before Uvicorn starts listening.

### 5. (Optional) Manual Prototype Reference Dataset Seeding
Production startup **never** runs demo seeding automatically. If you wish to populate the prototype cadastral reference records (e.g. Rampur parcel 145/2) for testing/hackathon demonstration, connect via Railway CLI or run:
```bash
railway run python -m app.seed
```
*Note: This data is explicitly labelled as `PROTOTYPE_REFERENCE_DATASET`.*

---

## Part 2: Vercel Frontend Deployment

### 1. Import Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New Project** → Import your BhuSatya repository.

### 2. Configure Build Settings
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables
In Vercel project settings under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://<your-railway-service>.up.railway.app` |

*(Omit any trailing slash).*

### 4. Deploy
Click **Deploy**. The `frontend/vercel.json` file ensures that all React Router routes (e.g., `/verification/49`, `/audit-trail`) support direct browser refresh without 404 errors.

---

## Part 3: Operational Procedures

### How to Check System Health
Visit:
```text
https://<your-railway-service>.up.railway.app/health
```
Expected production response:
```json
{
  "status": "ok",
  "backend": { "status": "ok" },
  "database": { "status": "ok", "engine": "postgresql" },
  "models": {
    "land_layout_detector": { "status": "available", "classes": [...] },
    "table_signature_stamp_detector": { "status": "available", "classes": [...] }
  },
  "table_text_provider": { "status": "available", "provider": "paddle_ocr" }
}
```

### How to View Logs
- **Railway**: Go to your project dashboard → Backend service → **Deployments** → Click active deployment → **View Logs**.
- **Vercel**: Go to your project dashboard → **Deployments** → Click deployment → **Functions / Runtime Logs**.

### How to Redeploy
- **Railway**: Pushing to the `deployment` branch on GitHub triggers an automatic Docker build and redeployment.
- **Vercel**: Pushing to the `deployment` branch triggers an automatic frontend rebuild.
