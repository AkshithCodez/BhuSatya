# Model Integration Guide — Model 1 & Model 2

This document provides clear instructions for integrating both machine learning models in **BhuSatya**.

---

## 1. Model 1: Layout Detector (YOLOv8n)

### Purpose
Detects regions of interest on digitized land documents:
- `table`: Revenue record tabular grid containing parcel, holder, and area details.
- `signature`: Official stamps / signature of the Patwari or Revenue Inspector.
- `stamp`: Government seal / emblem.

### Where to Place the Model File
Place your trained weights file directly in:
```
backend/ml_models/layout_detector.pt
```

### Configuration (`backend/.env`)
```ini
LAYOUT_MODEL_PATH=./ml_models/layout_detector.pt
LAYOUT_MODEL_CONFIDENCE=0.35
DEMO_MODE=false
```

### How It Works in Code
The backend automatically detects if `layout_detector.pt` is present:
- **If present**: [detector.py](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/backend/app/services/layout_detection/detector.py) loads it via `ultralytics.YOLO` and runs real inference on CPU or CUDA GPU.
- **If absent**: Falls back to `MockLayoutDetector` (`DEMO_MODE=true`), returning realistic sample bounding boxes so development, testing, and UI demonstration never break.

### Cropping Behavior
Whenever detection completes on a page, `crop_region` in [preprocessing_service.py](file:///c:/Users/reddy/Downloads/GoatFiles/project/SIH%202026/BhuSatya/BhuSatya/backend/app/services/preprocessing_service.py) automatically slices out each detected table, stamp, and signature, storing high-resolution crops in `backend/detected_regions/` with database tracking in `extracted_regions`.

---

## 2. Model 2: Table Text Extractor (Pluggable Factory)

### Purpose
Takes a cropped table image produced by Model 1 and converts the tabular content into text or key-value pairs.

### Current Implementation
The system implements the **Factory Pattern** in `backend/app/services/table_extraction/factory.py`.

Available providers right now:
1. `mock` (Default): Returns structured text for demo parcels (Rampur 145/2, 146, etc.).
2. `ocr`: Optional pytesseract OCR extractor (`optional_ocr.py`).
3. `manual`: Accepts officer-typed table text directly.

### How to Integrate Your Custom Model 2

When your custom table OCR / recognition model is ready:

#### Step 1: Create the Extractor Class
Create `backend/app/services/table_extraction/custom_model.py`:

```python
from app.services.table_extraction.base import TableTextExtractor, TableExtractionResult

class CustomModelTableTextExtractor(TableTextExtractor):
    def __init__(self, model_path: str = "./ml_models/table_extractor.pt"):
        # 1. Initialize your model here (e.g. PyTorch, HuggingFace, Paddle, etc.)
        self.model = ...

    def extract(self, table_image_path: str) -> TableExtractionResult:
        # 2. Run inference on the cropped table image
        extracted_text = self.model.predict(table_image_path)
        
        # 3. Return the normalized text
        return TableExtractionResult(
            raw_text=extracted_text,
            extraction_method="custom_model",
            confidence=0.92,
        )
```

#### Step 2: Register in `factory.py`
In `backend/app/services/table_extraction/factory.py`, import your class and add the key `"custom"`:

```python
elif provider == "custom":
    from app.services.table_extraction.custom_model import CustomModelTableTextExtractor
    return CustomModelTableTextExtractor()
```

#### Step 3: Switch Provider in `.env`
Set in `backend/.env`:
```ini
TABLE_TEXT_PROVIDER=custom
```

### Zero Disruption Guarantee
Once Model 2 returns `TableExtractionResult.raw_text`, the downstream pipeline:
- Structured regex field parser (`field_parser.py`)
- 10-rule validation engine (`validation/engine.py`)
- Risk score calculator (`risk_service.py`)
- Human-in-the-loop verification workstation (`OfficerReviewPage.tsx`)
- Immutable audit trail (`audit_service.py`)

**operates completely untouched.** No frontend or database changes are required.
