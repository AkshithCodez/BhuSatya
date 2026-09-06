# SIH26018 — Intelligent Land Record Digitization & Validation System

**BhuSatya** — An AI-assisted system for digitizing old land documents, extracting information, validating against reference records, and enabling officer review with full audit history.

> **AI assists document digitization and anomaly detection. Final verification remains with authorized government officials.**

---

## Custom AI Model

| Property | Value |
|----------|-------|
| Framework | Ultralytics YOLOv8 |
| Architecture | YOLOv8n |
| Exported checkpoint | `layout_detector.pt` |
| Size | ≈ 6.3 MB |
| Classes | `table` (0), `signature` (1), `stamp` (2) |

### Model Status

| Model | Status | Description |
|-------|--------|-------------|
| **Model 1** — Layout Detection | ✅ Trained & Integrated | YOLOv8n detecting table/signature/stamp regions |
| **Model 2** — Table Text Extraction | 🔜 Under Development | Currently replaced by pluggable temporary extraction provider |

### Important Limitation

Model 1 performs **object detection only**. It detects regions — it does NOT read text, authenticate signatures, or verify stamps. Detection ≠ verification.

---

## Architecture

```
Upload Land Document
        ↓
  File Validation
        ↓
  PDF → Page Images (if needed)
        ↓
  YOLOv8n layout_detector.pt (Model 1)
        ↓
  ┌──────────┬────────────┬──────────┐
  │  TABLE   │ SIGNATURE  │  STAMP   │
  │ bbox+conf│ bbox+conf  │ bbox+conf│
  └──────────┴────────────┴──────────┘
        ↓
  Crop table regions
        ↓
  TableTextExtractor (Future Model 2 / current mock)
        ↓
  Structured Field Parser
        ↓
  Validation Engine (RoR / Mutation / GIS cross-check)
        ↓
  Officer Review & Correction
        ↓
  Audit Trail → Approval → Verified Record
```

---

## Tech Stack

**Backend:** Python 3.11, FastAPI, SQLAlchemy, Pydantic, SQLite, Ultralytics, OpenCV, Pillow

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Leaflet, React Flow

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
copy .env.example .env    # Windows
cp .env.example .env      # Linux/Mac

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Model Placement

Place the trained model weight at:

```
backend/ml_models/layout_detector.pt
```

The application will start without it (DEMO_MODE), but real YOLO inference requires this file.

---

## Future Model 2 Integration

When your teammate's table text extraction model is ready:

1. Create `backend/app/services/table_extraction/custom_model.py`
2. Implement the `TableTextExtractor` interface:

```python
class CustomModelTableTextExtractor(TableTextExtractor):
    def extract(self, table_image_path: str) -> TableExtractionResult:
        # Load and run your model here
        ...
```

3. Set `TABLE_TEXT_PROVIDER=custom` in `.env`

**Nothing else in the frontend, validation, database, or officer workflow needs to change.**

---

## Environment Variables

See `.env.example` for all configuration options.

| Variable | Default | Description |
|----------|---------|-------------|
| `LAYOUT_MODEL_PATH` | `./ml_models/layout_detector.pt` | Path to YOLOv8n weights |
| `LAYOUT_MODEL_CONFIDENCE` | `0.35` | Detection confidence threshold |
| `TABLE_TEXT_PROVIDER` | `mock` | Table text extraction provider |
| `DEMO_MODE` | `true` | Enable demo mode fallback |
| `SECRET_KEY` | (required) | JWT secret key |

---

## License

This project was developed for Smart India Hackathon 2026.
