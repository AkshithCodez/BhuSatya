"""Detection router — runs two real YOLO models, table fusion, and manages regions."""
import os
import time
from typing import Optional
from PIL import Image
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.config import settings
from app.models.document import Document, DocumentPage
from app.models.detection import Detection, DetectedRegion, ExtractedRegion
from app.schemas.detection import (
    DetectionOut,
    DetectionResponse,
    BBox,
    RegionOut,
    ManualRegionRequest,
)
from app.services.layout_detection import (
    get_land_layout_detector,
    get_document_element_detector,
    fuse_page_detections,
    crop_image_region,
)
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/api", tags=["detections"])


@router.post("/documents/{document_id}/detect", response_model=list[DetectionResponse])
def detect_layout(document_id: int, db: Session = Depends(get_db)):
    """
    Run two-model YOLO detection pipeline on all pages of a document.
    1. Land Layout Detector (Model A) -> document layout & table structure
    2. Document Element Detector (Model B) -> tables, signatures, stamps
    3. Persist raw detections from both models with full provenance
    4. Table IoU deduplication / fusion (IoU >= threshold)
    5. Generate crops for final regions (fused tables, signatures, stamps)
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    layout_detector = get_land_layout_detector()
    element_detector = get_document_element_detector()

    layout_available = layout_detector.is_available
    element_available = element_detector.is_available

    if not layout_available and not element_available:
        raise HTTPException(
            status_code=503,
            detail=(
                "Neither layout detector nor document element detector is available. "
                f"Verify checkpoints at {settings.LAND_LAYOUT_MODEL_PATH} and {settings.DOCUMENT_ELEMENT_MODEL_PATH}."
            ),
        )

    # Truthful model status reporting
    models_status = {
        "land_layout_detector": "available" if layout_available else "failed",
        "table_signature_stamp_detector": "available" if element_available else "failed",
    }

    # Delete previous automated detections and regions for this document to ensure clean state
    # Preserve manual selections
    db.query(DetectedRegion).filter(
        DetectedRegion.document_id == document_id,
        DetectedRegion.source != "manual_selection",
    ).delete(synchronize_session=False)
    db.query(Detection).filter(Detection.document_id == document_id).delete(synchronize_session=False)
    db.commit()

    # Update document status
    doc.status = "DETECTING_LAYOUT"
    db.commit()

    pages = db.query(DocumentPage).filter(
        DocumentPage.document_id == document_id
    ).order_by(DocumentPage.page_number).all()

    if not pages:
        raise HTTPException(status_code=400, detail="No page images found for this document")

    all_responses = []

    for page in pages:
        image_path = page.image_path
        if not os.path.exists(image_path):
            continue

        try:
            with Image.open(image_path) as img:
                img_w, img_h = img.size
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read image {image_path}: {e}")

        # Model A: Land Layout Detector
        dets_a = []
        if layout_available:
            log_audit_event(
                db,
                "LAND_LAYOUT_INFERENCE_STARTED",
                f"Land layout detector started for page {page.page_number}",
                document_id=doc.id,
            )
            dets_a = layout_detector.detect_page(
                image_path=image_path,
                page_number=page.page_number,
                document_page_id=page.id,
            )
            log_audit_event(
                db,
                "LAND_LAYOUT_INFERENCE_COMPLETED",
                f"Land layout detector found {len(dets_a)} elements on page {page.page_number}",
                document_id=doc.id,
                details={"detections_count": len(dets_a)},
            )

        # Model B: Document Element Detector
        dets_b = []
        if element_available:
            log_audit_event(
                db,
                "DOCUMENT_ELEMENT_INFERENCE_STARTED",
                f"Document element detector started for page {page.page_number}",
                document_id=doc.id,
            )
            dets_b = element_detector.detect_page(
                image_path=image_path,
                page_number=page.page_number,
                document_page_id=page.id,
            )
            log_audit_event(
                db,
                "DOCUMENT_ELEMENT_INFERENCE_COMPLETED",
                f"Document element detector found {len(dets_b)} elements on page {page.page_number}",
                document_id=doc.id,
                details={"detections_count": len(dets_b)},
            )

        # Persist ALL raw detections in PostgreSQL with provenance
        raw_detections = dets_a + dets_b
        det_id_to_db_id = {}
        for det in raw_detections:
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
                model_name=det.model_name,
                model_role=det.model_role,
                model_version=det.model_version,
            )
            db.add(db_det)
            db.flush()
            det_id_to_db_id[det.id] = db_det.id

        # Deduplicate tables and fuse detections
        fused_regions = fuse_page_detections(
            layout_detections=dets_a,
            element_detections=dets_b,
            page_number=page.page_number,
            document_page_id=page.id,
            image_width=img_w,
            image_height=img_h,
            iou_threshold=settings.TABLE_DEDUP_IOU_THRESHOLD,
        )

        regions_dir = os.path.join(
            settings.DETECTED_REGIONS_DIR,
            str(document_id),
            f"page_{page.page_number}",
        )
        os.makedirs(regions_dir, exist_ok=True)

        page_fused_region_outs = []
        for idx, fused in enumerate(fused_regions):
            crop_filename = f"{fused.class_name}_{fused.source}_{idx + 1:03d}.png"
            crop_path = os.path.join(regions_dir, crop_filename)

            try:
                crop_w, crop_h = crop_image_region(
                    image_path=image_path,
                    bbox=fused.bbox,
                    output_path=crop_path,
                )
            except Exception as e:
                continue

            primary_db_id = det_id_to_db_id.get(fused.primary_detection_id)
            supporting_ids_str = (
                ",".join(fused.supporting_detection_ids)
                if fused.supporting_detection_ids
                else None
            )

            db_region = DetectedRegion(
                detection_id=primary_db_id,
                document_id=document_id,
                document_page_id=page.id,
                page_number=page.page_number,
                region_type=fused.region_type,
                class_name=fused.class_name,
                source=fused.source,
                supporting_detection_ids=supporting_ids_str,
                x1=fused.bbox.x1,
                y1=fused.bbox.y1,
                x2=fused.bbox.x2,
                y2=fused.bbox.y2,
                image_width=fused.image_width,
                image_height=fused.image_height,
                crop_path=crop_path,
                crop_width=crop_w,
                crop_height=crop_h,
            )
            db.add(db_region)
            db.flush()

            # Audit events according to requirements
            if fused.source == "model_fusion":
                log_audit_event(
                    db,
                    "TABLE_DETECTIONS_FUSED",
                    f"Fused table detection from Model A ({fused.primary_detection_id}) and Model B ({supporting_ids_str})",
                    document_id=doc.id,
                    details={
                        "primary": fused.primary_detection_id,
                        "supporting": fused.supporting_detection_ids,
                    },
                )
            if fused.region_type == "table":
                log_audit_event(
                    db,
                    "TABLE_REGION_CREATED",
                    f"Table region created (source: {fused.source})",
                    document_id=doc.id,
                    details={"region_id": db_region.id, "source": fused.source},
                )
            elif fused.region_type == "signature":
                log_audit_event(
                    db,
                    "ELEMENT_DETECTED",
                    "Signature Region Detected",
                    document_id=doc.id,
                    details={"region_id": db_region.id, "class": "signature"},
                )
            elif fused.region_type == "stamp":
                log_audit_event(
                    db,
                    "ELEMENT_DETECTED",
                    "Stamp Region Detected",
                    document_id=doc.id,
                    details={"region_id": db_region.id, "class": "stamp"},
                )

            log_audit_event(
                db,
                "REGION_CROPPED",
                f"{fused.class_name.title()} region cropped ({crop_w}x{crop_h}px)",
                document_id=doc.id,
                details={"region_id": db_region.id, "crop_path": crop_path},
            )

            page_fused_region_outs.append(
                RegionOut(
                    id=db_region.id,
                    detection_id=primary_db_id,
                    document_id=document_id,
                    page_number=page.page_number,
                    region_type=db_region.region_type,
                    class_name=db_region.class_name,
                    source=db_region.source,
                    supporting_detection_ids=db_region.supporting_detection_ids,
                    crop_path=db_region.crop_path,
                    crop_url=f"/api/regions/{db_region.id}/image",
                    crop_width=db_region.crop_width,
                    crop_height=db_region.crop_height,
                    x1=db_region.x1,
                    y1=db_region.y1,
                    x2=db_region.x2,
                    y2=db_region.y2,
                    image_width=db_region.image_width,
                    image_height=db_region.image_height,
                    created_at=db_region.created_at,
                )
            )

        detection_outs = [
            DetectionOut(
                id=d.id,
                document_page_id=d.document_page_id,
                class_id=d.class_id,
                class_name=d.class_name,
                confidence=d.confidence,
                bbox=BBox(x1=d.bbox.x1, y1=d.bbox.y1, x2=d.bbox.x2, y2=d.bbox.y2),
                image_width=d.image_width,
                image_height=d.image_height,
                model_name=d.model_name,
                model_role=d.model_role,
                model_version=d.model_version,
            )
            for d in raw_detections
        ]

        all_responses.append(
            DetectionResponse(
                document_id=document_id,
                page=page.page_number,
                confidence_threshold=min(
                    settings.LAND_LAYOUT_CONFIDENCE,
                    settings.DOCUMENT_ELEMENT_CONFIDENCE,
                ),
                detections=detection_outs,
                models_status=models_status,
                fused_regions=page_fused_region_outs,
            )
        )

    doc.status = "LAYOUT_DETECTED"
    db.commit()

    return all_responses


@router.get("/documents/{document_id}/detections")
def get_detections(document_id: int, page: int = 0, db: Session = Depends(get_db)):
    """Get stored raw detections with model provenance for a document."""
    query = db.query(Detection).filter(Detection.document_id == document_id)
    if page > 0:
        query = query.filter(Detection.page_number == page)
    query = query.order_by(Detection.page_number, Detection.id)

    detections = query.all()
    return [
        DetectionOut(
            id=d.detection_id,
            document_page_id=d.document_page_id,
            class_id=d.class_id,
            class_name=d.class_name,
            confidence=d.confidence,
            bbox=BBox(x1=d.bbox_x1, y1=d.bbox_y1, x2=d.bbox_x2, y2=d.bbox_y2),
            image_width=d.image_width,
            image_height=d.image_height,
            model_name=d.model_name,
            model_role=d.model_role,
            model_version=d.model_version,
        )
        for d in detections
    ]


@router.post("/documents/{document_id}/manual-region", response_model=RegionOut)
def create_manual_region(
    document_id: int,
    req: ManualRegionRequest,
    db: Session = Depends(get_db),
):
    """Create a manual table region selection, generate a real crop, and persist metadata."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    page = db.query(DocumentPage).filter(
        DocumentPage.document_id == document_id,
        DocumentPage.page_number == req.page_number,
    ).first()
    if not page or not os.path.exists(page.image_path):
        raise HTTPException(status_code=404, detail=f"Page {req.page_number} image not found")

    try:
        with Image.open(page.image_path) as img:
            img_w, img_h = img.size
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read page image: {e}")

    # Clamp coordinates safely
    x1 = max(0.0, min(float(req.x1), float(img_w)))
    y1 = max(0.0, min(float(req.y1), float(img_h)))
    x2 = max(0.0, min(float(req.x2), float(img_w)))
    y2 = max(0.0, min(float(req.y2), float(img_h)))

    if x1 > x2:
        x1, x2 = x2, x1
    if y1 > y2:
        y1, y2 = y2, y1

    if (x2 - x1) < 5 or (y2 - y1) < 5:
        raise HTTPException(status_code=400, detail="Selected region is too small (minimum 5x5 pixels)")

    regions_dir = os.path.join(
        settings.DETECTED_REGIONS_DIR,
        str(document_id),
        f"page_{req.page_number}",
    )
    os.makedirs(regions_dir, exist_ok=True)
    crop_filename = f"manual_{req.region_type}_{int(time.time() * 1000)}.png"
    crop_path = os.path.join(regions_dir, crop_filename)

    try:
        crop_w, crop_h = crop_image_region(
            image_path=page.image_path,
            bbox=BBox(x1=x1, y1=y1, x2=x2, y2=y2),
            output_path=crop_path,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cropping failed: {e}")

    if not os.path.exists(crop_path) or crop_w <= 0 or crop_h <= 0:
        raise HTTPException(status_code=500, detail="Failed to generate cropped region image")

    region = DetectedRegion(
        detection_id=None,
        document_id=document_id,
        document_page_id=page.id,
        page_number=req.page_number,
        region_type=req.region_type,
        class_name=req.region_type,
        source="manual_selection",
        x1=x1,
        y1=y1,
        x2=x2,
        y2=y2,
        image_width=img_w,
        image_height=img_h,
        crop_path=crop_path,
        crop_width=crop_w,
        crop_height=crop_h,
    )
    db.add(region)
    doc.status = "LAYOUT_DETECTED"
    db.commit()
    db.refresh(region)

    log_audit_event(
        db,
        "MANUAL_REGION_CREATED",
        f"Manual {req.region_type} region created on page {req.page_number} [{x1:.0f},{y1:.0f} to {x2:.0f},{y2:.0f}]",
        document_id=document_id,
        details={
            "region_id": region.id,
            "page_number": req.page_number,
            "source": "manual_selection",
            "box": [x1, y1, x2, y2],
        },
    )

    log_audit_event(
        db,
        "REGION_CROPPED",
        f"Manual {req.region_type} region cropped ({crop_w}x{crop_h}px)",
        document_id=document_id,
        details={"region_id": region.id, "crop_path": crop_path},
    )

    return RegionOut(
        id=region.id,
        detection_id=None,
        document_id=region.document_id,
        page_number=region.page_number,
        region_type=region.region_type,
        class_name=region.class_name,
        source=region.source,
        crop_path=region.crop_path,
        crop_url=f"/api/regions/{region.id}/image",
        crop_width=region.crop_width,
        crop_height=region.crop_height,
        x1=region.x1,
        y1=region.y1,
        x2=region.x2,
        y2=region.y2,
        image_width=region.image_width,
        image_height=region.image_height,
        created_at=region.created_at,
    )


@router.get("/documents/{document_id}/regions")
def get_regions(document_id: int, db: Session = Depends(get_db)):
    """Get extracted regions (crops) for a document."""
    regions = db.query(DetectedRegion).filter(
        DetectedRegion.document_id == document_id
    ).order_by(DetectedRegion.page_number, DetectedRegion.id).all()

    return [
        RegionOut(
            id=r.id,
            detection_id=r.detection_id,
            document_id=r.document_id,
            page_number=r.page_number,
            region_type=r.region_type or r.class_name,
            class_name=r.class_name,
            source=r.source or "yolo",
            supporting_detection_ids=r.supporting_detection_ids,
            crop_path=r.crop_path,
            crop_url=f"/api/regions/{r.id}/image",
            crop_width=r.crop_width,
            crop_height=r.crop_height,
            x1=r.x1 if r.x1 is not None else (r.detection.bbox_x1 if r.detection else None),
            y1=r.y1 if r.y1 is not None else (r.detection.bbox_y1 if r.detection else None),
            x2=r.x2 if r.x2 is not None else (r.detection.bbox_x2 if r.detection else None),
            y2=r.y2 if r.y2 is not None else (r.detection.bbox_y2 if r.detection else None),
            image_width=r.image_width if r.image_width is not None else (r.detection.image_width if r.detection else None),
            image_height=r.image_height if r.image_height is not None else (r.detection.image_height if r.detection else None),
            created_at=r.created_at,
        )
        for r in regions
    ]


@router.get("/regions/{region_id}/image")
def get_region_image(region_id: int, db: Session = Depends(get_db)):
    """Serve a cropped region image."""
    region = db.query(DetectedRegion).filter(DetectedRegion.id == region_id).first()
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
