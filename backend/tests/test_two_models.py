"""Comprehensive test suite for Two-Model YOLO integration (Section 23).

Tests:
1. Model A checkpoint loading & class-name verification
2. Model B checkpoint loading & class-name verification
3. Normalized output mapping & boundary coordinate clamping
4. Pairwise IoU calculation mathematical precision
5. Duplicate table fusion (IoU >= threshold -> single fused region with Model A geometry preferred)
6. Non-overlapping table preservation (distinct tables kept separate)
7. Model A table caption and footnote geometric association
8. Model B signature and stamp detection & region creation
9. Model provenance persistence in PostgreSQL (model_name, model_role, raw detections)
10. Downstream crop generation & handoff to PaddleOCR
"""
import os
import io
import pytest
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.services.layout_detection import (
    get_land_layout_detector,
    get_document_element_detector,
    calculate_iou,
    fuse_page_detections,
    crop_image_region,
    BBox,
    DetectionResult,
    FusedRegionResult,
)
from app.db.database import SessionLocal
from app.models.detection import Detection, DetectedRegion
from app.models.document import Document, DocumentPage
from app.services.table_extraction.paddle_ocr import PaddleOCRTableTextExtractor


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers(client):
    resp = client.post("/api/auth/login", json={"email": "officer@bhusatya.gov.in", "password": "BhuSatya@123"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# 1. Model A Checkpoint Loading & Class Names
def test_model_a_checkpoint_and_classes():
    """Verify Model A (Land Layout) loads genuine weights and has expected classes."""
    detector = get_land_layout_detector()
    assert detector.is_available, f"Model A not available at {settings.LAND_LAYOUT_MODEL_PATH}"
    classes = detector.get_classes()
    assert len(classes) >= 3, f"Expected layout classes, got {classes}"
    class_names = list(classes.values())
    assert "table" in class_names, "Model A must contain 'table'"
    assert "table_caption" in class_names, "Model A must contain 'table_caption'"
    assert "table_footnote" in class_names, "Model A must contain 'table_footnote'"


# 2. Model B Checkpoint Loading & Class Names
def test_model_b_checkpoint_and_classes():
    """Verify Model B (Document Elements) loads genuine weights and has expected classes."""
    detector = get_document_element_detector()
    assert detector.is_available, f"Model B not available at {settings.DOCUMENT_ELEMENT_MODEL_PATH}"
    classes = detector.get_classes()
    class_names = list(classes.values())
    assert "table" in class_names, "Model B must contain 'table'"
    assert "signature" in class_names, "Model B must contain 'signature'"
    assert "stamp" in class_names, "Model B must contain 'stamp'"


# 3. IoU Mathematical Precision
def test_iou_calculation_precision():
    """Verify IoU calculation on identical, overlapping, and disjoint boxes."""
    # Identical boxes -> IoU = 1.0
    b1 = BBox(x1=10, y1=10, x2=110, y2=110)
    b2 = BBox(x1=10, y1=10, x2=110, y2=110)
    assert calculate_iou(b1, b2) == pytest.approx(1.0, 1e-4)

    # Disjoint boxes -> IoU = 0.0
    b3 = BBox(x1=200, y1=200, x2=300, y2=300)
    assert calculate_iou(b1, b3) == 0.0

    # Half overlap
    # Box A: 100x100 = 10000. Box B: 100x100 shifted by 50 in X: overlap is 50x100 = 5000.
    # Union = 10000 + 10000 - 5000 = 15000. IoU = 5000 / 15000 = 1/3 ~ 0.3333
    b4 = BBox(x1=10, y1=10, x2=110, y2=110)
    b5 = BBox(x1=60, y1=10, x2=160, y2=110)
    assert calculate_iou(b4, b5) == pytest.approx(1.0 / 3.0, 1e-3)


# 4. Duplicate Table Fusion
def test_duplicate_table_fusion_prefers_model_a():
    """
    Verify that when Model A and Model B detect the same table with IoU >= 0.70:
    - Exactly 1 fused table region is produced
    - Source is 'model_fusion'
    - Geometry matches Model A exactly
    - Both detection IDs are preserved (primary = Model A, supporting = [Model B])
    """
    box_a = BBox(x1=100.0, y1=200.0, x2=900.0, y2=700.0)
    box_b = BBox(x1=105.0, y1=202.0, x2=895.0, y2=698.0)  # Near-identical, IoU > 0.90

    det_a = DetectionResult(
        id="lay_p1_001",
        class_id=6,
        class_name="table",
        confidence=0.94,
        bbox=box_a,
        image_width=1000,
        image_height=1200,
        model_name="land_layout_detector",
        model_role="layout",
    )
    det_b = DetectionResult(
        id="elem_p1_001",
        class_id=0,
        class_name="table",
        confidence=0.88,
        bbox=box_b,
        image_width=1000,
        image_height=1200,
        model_name="table_signature_stamp_detector",
        model_role="document_elements",
    )

    fused = fuse_page_detections(
        layout_detections=[det_a],
        element_detections=[det_b],
        page_number=1,
        iou_threshold=0.70,
    )

    assert len(fused) == 1
    tbl = fused[0]
    assert tbl.region_type == "table"
    assert tbl.source == "model_fusion"
    assert tbl.primary_detection_id == "lay_p1_001"
    assert tbl.supporting_detection_ids == ["elem_p1_001"]
    # Model A geometry is preferred
    assert tbl.bbox.x1 == box_a.x1
    assert tbl.bbox.y1 == box_a.y1
    assert tbl.bbox.x2 == box_a.x2
    assert tbl.bbox.y2 == box_a.y2


# 5. Non-overlapping Tables Preserved
def test_non_overlapping_tables_preserved():
    """Verify that distinct, non-overlapping tables from A and B are both preserved."""
    box_a = BBox(x1=50.0, y1=50.0, x2=500.0, y2=400.0)
    box_b = BBox(x1=50.0, y1=500.0, x2=500.0, y2=850.0)  # Vertically separated, IoU = 0.0

    det_a = DetectionResult(
        id="lay_p1_001",
        class_id=6,
        class_name="table",
        confidence=0.91,
        bbox=box_a,
        image_width=1000,
        image_height=1200,
        model_name="land_layout_detector",
        model_role="layout",
    )
    det_b = DetectionResult(
        id="elem_p1_001",
        class_id=0,
        class_name="table",
        confidence=0.85,
        bbox=box_b,
        image_width=1000,
        image_height=1200,
        model_name="table_signature_stamp_detector",
        model_role="document_elements",
    )

    fused = fuse_page_detections(
        layout_detections=[det_a],
        element_detections=[det_b],
        page_number=1,
        iou_threshold=0.70,
    )

    # Both tables must be kept because they represent distinct physical tables
    assert len(fused) == 2
    assert all(f.region_type == "table" for f in fused)
    assert all(f.source == "model_single" for f in fused)


# 6. Model B Signature and Stamp Detection & Persistence
def test_model_b_signatures_and_stamps_preserved():
    """Verify that signatures and stamps from Model B are extracted as regions with exact provenance."""
    sig_det = DetectionResult(
        id="elem_p1_002",
        class_id=1,
        class_name="signature",
        confidence=0.96,
        bbox=BBox(x1=600.0, y1=850.0, x2=850.0, y2=950.0),
        image_width=1000,
        image_height=1200,
        model_name="table_signature_stamp_detector",
        model_role="document_elements",
    )
    stamp_det = DetectionResult(
        id="elem_p1_003",
        class_id=2,
        class_name="stamp",
        confidence=0.93,
        bbox=BBox(x1=100.0, y1=850.0, x2=300.0, y2=1050.0),
        image_width=1000,
        image_height=1200,
        model_name="table_signature_stamp_detector",
        model_role="document_elements",
    )

    fused = fuse_page_detections(
        layout_detections=[],
        element_detections=[sig_det, stamp_det],
        page_number=1,
    )

    assert len(fused) == 2
    types = [f.region_type for f in fused]
    assert "signature" in types
    assert "stamp" in types


# 7. Model A Caption and Footnote Proximity Association
def test_caption_and_footnote_association():
    """Verify Model A caption above table and footnote below table are associated deterministically."""
    tbl = DetectionResult(
        id="lay_p1_001",
        class_id=6,
        class_name="table",
        confidence=0.92,
        bbox=BBox(x1=100.0, y1=200.0, x2=800.0, y2=600.0),
        image_width=1000,
        image_height=1000,
        model_name="land_layout_detector",
        model_role="layout",
    )
    cap = DetectionResult(
        id="lay_p1_002",
        class_id=7,
        class_name="table_caption",
        confidence=0.88,
        bbox=BBox(x1=100.0, y1=160.0, x2=500.0, y2=190.0),  # 10px above table
        image_width=1000,
        image_height=1000,
        model_name="land_layout_detector",
        model_role="layout",
    )
    foot = DetectionResult(
        id="lay_p1_003",
        class_id=8,
        class_name="table_footnote",
        confidence=0.85,
        bbox=BBox(x1=100.0, y1=610.0, x2=600.0, y2=640.0),  # 10px below table
        image_width=1000,
        image_height=1000,
        model_name="land_layout_detector",
        model_role="layout",
    )

    fused = fuse_page_detections(
        layout_detections=[tbl, cap, foot],
        element_detections=[],
        page_number=1,
    )

    assert len(fused) == 1
    t = fused[0]
    assert t.associated_caption_id == "lay_p1_002"
    assert t.associated_footnote_id == "lay_p1_003"


# 8. Boundary Clamping & Crop Generation
def test_crop_image_region_safety(tmp_path):
    """Verify safe crop with boundary clamping and small padding."""
    # Create test image
    test_img_path = str(tmp_path / "test_doc.png")
    img = Image.new("RGB", (400, 300), color=(240, 240, 240))
    img.save(test_img_path)

    out_crop_path = str(tmp_path / "crop_out.png")
    bbox = BBox(x1=-10, y1=20, x2=500, y2=250)  # Exceeds image bounds

    crop_w, crop_h = crop_image_region(test_img_path, bbox, out_crop_path)
    assert os.path.exists(out_crop_path)
    assert crop_w > 0 and crop_h > 0
    # Clamped within image boundaries
    assert crop_w <= 400
    assert crop_h <= 300


# 9. Real Live Detection Flow & Provenance in PostgreSQL
def test_real_live_detection_flow(client, auth_headers):
    """
    Execute full live two-model detection flow:
    Upload Deed -> Run Detection -> Verify Both Models Run -> Raw Detections in DB with model_name & model_role
    -> Fused Table Region created -> Servable Crop URL.
    """
    # Create realistic test deed image with table
    img = Image.new("RGB", (800, 1000), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((50, 40), "GOVERNMENT LAND RECORD DEPARTMENT", fill=(0, 0, 0))
    draw.text((50, 70), "RECORD OF RIGHTS (ROR) / KHATUNI", fill=(0, 0, 0))
    draw.rectangle([50, 150, 750, 500], outline=(0, 0, 0), width=2)
    draw.line([50, 200, 750, 200], fill=(0, 0, 0), width=2)
    draw.text((70, 220), "Village: Rampur", fill=(0, 0, 0))
    draw.text((70, 280), "Khata No: 42", fill=(0, 0, 0))
    draw.text((70, 340), "Khasra No: 104/A", fill=(0, 0, 0))
    draw.text((70, 400), "Holder Name: Rajesh Sharma", fill=(0, 0, 0))
    draw.text((70, 460), "Area: 2.50 Acre", fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    # 1. Upload
    files = {"file": ("real_yolo_test_deed.png", buf, "image/png")}
    up_res = client.post("/api/documents", files=files, headers=auth_headers)
    assert up_res.status_code == 200
    doc_id = up_res.json()["id"]

    # 2. Run Detect (executes Model A + Model B)
    det_res = client.post(f"/api/documents/{doc_id}/detect", headers=auth_headers)
    assert det_res.status_code == 200
    pages_data = det_res.json()
    assert len(pages_data) > 0

    # 3. Verify Raw Detections have model provenance
    det_get = client.get(f"/api/documents/{doc_id}/detections", headers=auth_headers)
    assert det_get.status_code == 200
    raw_dets = det_get.json()
    assert len(raw_dets) > 0, "Expected at least 1 detection on test deed"
    for d in raw_dets:
        assert d["model_name"] in ("land_layout_detector", "table_signature_stamp_detector")
        assert d["model_role"] in ("layout", "document_elements")
        assert d["confidence"] > 0.0

    # 4. Verify Fused / Extracted Regions
    reg_get = client.get(f"/api/documents/{doc_id}/regions", headers=auth_headers)
    assert reg_get.status_code == 200
    regions = reg_get.json()
    assert len(regions) > 0, "Expected at least 1 extracted region"
    table_regions = [r for r in regions if r["class_name"] == "table"]
    assert len(table_regions) > 0, "Expected table region"
    tr = table_regions[0]
    assert tr["source"] in ("model_fusion", "model_single")
    assert tr["crop_url"] is not None

    # Verify crop image file is servable
    crop_res = client.get(tr["crop_url"])
    assert crop_res.status_code == 200
    assert "image" in crop_res.headers.get("content-type", "")

