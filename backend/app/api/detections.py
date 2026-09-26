"""Detection router — runs YOLO model and manages detections."""
import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.config import settings
from app.models.document import Document, DocumentPage
from app.models.detection import Detection, ExtractedRegion
from app.schemas.detection import DetectionOut, DetectionResponse, BBox, RegionOut
from app.services.layout_detection import LayoutDetector, MockLayoutDetector
from app.services.preprocessing_service import preprocess_for_detection, crop_region
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/api", tags=["detections"])

# Initialize detector (lazy — loaded on first use)
_detector = None


def get_detector():
    global _detector
    if _detector is None:
        if settings.model_available:
            _detector = LayoutDetector(
                settings.LAYOUT_MODEL_PATH,
                settings.LAYOUT_MODEL_CONFIDENCE,
            )
        elif settings.DEMO_MODE:
            _detector = MockLayoutDetector(settings.LAYOUT_MODEL_CONFIDENCE)
        else:
            _detector = None
    return _detector


@router.post("/documents/{document_id}/detect", response_model=list[DetectionResponse])
def detect_layout(document_id: int, db: Session = Depends(get_db)):
    """Run YOLOv8n layout detection on all pages of a document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    detector = get_detector()
    if not detector:
        raise HTTPException(
            status_code=503,
            detail="Layout detection model is not available. Place layout_detector.pt in backend/ml_models/",
        )

    # Update status
    doc.status = "DETECTING_LAYOUT"
    db.commit()

    log_audit_event(
        db, "LAYOUT_DETECTION_STARTED",
        "Layout model inference started",
        document_id=doc.id,
    )

    pages = db.query(DocumentPage).filter(
        DocumentPage.document_id == document_id
    ).order_by(DocumentPage.page_number).all()

    if not pages:
        raise HTTPException(status_code=400, detail="No page images found for this document")

    all_responses = []

    for page in pages:
        # Preprocess (currently returns original)
        image_path = preprocess_for_detection(page.image_path)

        # Run YOLO detection
        result = detector.detect(image_path)

        if result.error:
            raise HTTPException(status_code=500, detail=result.error)

        # Store detections and create crops
        detection_outs = []
        regions_dir = os.path.join(
            settings.DETECTED_REGIONS_DIR,
            str(document_id),
            f"page_{page.page_number}",
        )
        os.makedirs(regions_dir, exist_ok=True)

        for det in result.detections:
            # Save detection to DB
            db_det = Detection(
                document_id=document_id,
                document_page_id=page.id,
                page_number=page.page_number,
                detection_id=det.id,
                class_id=det.class_id,
                class_name=det.class_name,
                confidence=det.confidence,
                bbox_x1=det.bbox.x1,
                bbox_y1=det.bbox.y1,
                bbox_x2=det.bbox.x2,
                bbox_y2=det.bbox.y2,
                image_width=det.image_width,
                image_height=det.image_height,
                model_name="YOLOv8n-layout",
                model_version="v1.0",
            )
            db.add(db_det)
            db.flush()

            # Crop region
            crop_filename = f"{det.class_name}_{det.id}.png"
            crop_path = os.path.join(regions_dir, crop_filename)

            try:
                crop_w, crop_h = crop_region(
                    image_path,
                    det.bbox.x1, det.bbox.y1,
                    det.bbox.x2, det.bbox.y2,
                    crop_path,
                )

                region = ExtractedRegion(
                    detection_id=db_det.id,
                    document_id=document_id,
                    document_page_id=page.id,
                    page_number=page.page_number,
                    region_type=det.class_name,
                    class_name=det.class_name,
                    crop_path=crop_path,
                    crop_width=crop_w,
                    crop_height=crop_h,
                )
                db.add(region)

                log_audit_event(
                    db, "REGION_CROPPED",
                    f"{det.class_name.title()} region cropped ({det.confidence:.1%} confidence)",
                    document_id=doc.id,
                    details={"detection_id": det.id, "class": det.class_name, "confidence": det.confidence},
                )
            except Exception as e:
                pass  # Non-critical — crop failed but detection is still stored

            detection_outs.append(DetectionOut(
                id=det.id,
                class_id=det.class_id,
                class_name=det.class_name,
                confidence=det.confidence,
                bbox=BBox(
                    x1=det.bbox.x1, y1=det.bbox.y1,
                    x2=det.bbox.x2, y2=det.bbox.y2,
                ),
                image_width=det.image_width,
                image_height=det.image_height,
            ))

            log_audit_event(
                db, "ELEMENT_DETECTED",
                f"Model detected {det.class_name}: {det.confidence:.1%}",
                document_id=doc.id,
                details={"detection_id": det.id, "class": det.class_name, "confidence": det.confidence},
            )

        all_responses.append(DetectionResponse(
            document_id=document_id,
            page=page.page_number,
            confidence_threshold=result.confidence_threshold,
            detections=detection_outs,
        ))

    doc.status = "LAYOUT_DETECTED"
    db.commit()

    return all_responses


@router.get("/documents/{document_id}/detections")
def get_detections(document_id: int, page: int = 0, db: Session = Depends(get_db)):
    """Get stored detections for a document."""
    query = db.query(Detection).filter(Detection.document_id == document_id)
    if page > 0:
        query = query.filter(Detection.page_number == page)
    query = query.order_by(Detection.page_number, Detection.detection_id)

    detections = query.all()
    return [
        DetectionOut(
            id=d.detection_id,
            class_id=d.class_id,
            class_name=d.class_name,
            confidence=d.confidence,
            bbox=BBox(x1=d.bbox_x1, y1=d.bbox_y1, x2=d.bbox_x2, y2=d.bbox_y2),
            image_width=d.image_width,
            image_height=d.image_height,
        )
        for d in detections
    ]


@router.get("/documents/{document_id}/regions")
def get_regions(document_id: int, db: Session = Depends(get_db)):
    """Get extracted regions (crops) for a document."""
    regions = db.query(ExtractedRegion).filter(
        ExtractedRegion.document_id == document_id
    ).all()

    return [
        RegionOut(
            id=r.id,
            detection_id=r.detection_id,
            document_id=r.document_id,
            page_number=r.page_number,
            class_name=r.class_name,
            crop_path=r.crop_path,
            crop_url=f"/api/regions/{r.id}/image",
            crop_width=r.crop_width,
            crop_height=r.crop_height,
        )
        for r in regions
    ]


@router.get("/regions/{region_id}/image")
def get_region_image(region_id: int, db: Session = Depends(get_db)):
    """Serve a cropped region image."""
    region = db.query(ExtractedRegion).filter(ExtractedRegion.id == region_id).first()
    if not region or not os.path.exists(region.crop_path):
        raise HTTPException(status_code=404, detail="Region image not found")
    return FileResponse(region.crop_path, media_type="image/png")


@router.get("/documents/{document_id}/page/{page_number}/image")
def get_page_image(document_id: int, page_number: int, db: Session = Depends(get_db)):
    """Serve a document page image."""
    page = db.query(DocumentPage).filter(
        DocumentPage.document_id == document_id,
        DocumentPage.page_number == page_number,
    ).first()
    if not page or not os.path.exists(page.image_path):
        raise HTTPException(status_code=404, detail="Page image not found")
    return FileResponse(page.image_path, media_type="image/png")
