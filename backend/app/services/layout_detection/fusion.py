"""Table deduplication and cross-model detection fusion logic.

Model A (Land Layout): table, table_caption, table_footnote, etc.
Model B (Elements): table, signature, stamp.

Fuses overlapping table detections using IoU (>= threshold, default 0.70).
Prefers Model A geometry for fused tables as primary layout authority.
Preserves signatures and stamps from Model B.
Associates table captions and footnotes deterministically when geometry is clear.
"""
import logging
from typing import Optional
from app.config import settings
from app.services.layout_detection.schemas import (
    BBox,
    DetectionResult,
    FusedRegionResult,
)

logger = logging.getLogger(__name__)


def calculate_iou(box1: BBox, box2: BBox) -> float:
    """Calculate Intersection over Union (IoU) between two bounding boxes."""
    return box1.iou(box2)


def fuse_page_detections(
    layout_detections: list[DetectionResult],
    element_detections: list[DetectionResult],
    page_number: int = 1,
    document_page_id: Optional[int] = None,
    image_width: int = 0,
    image_height: int = 0,
    iou_threshold: Optional[float] = None,
) -> list[FusedRegionResult]:
    """
    Fuse and deduplicate detections from Model A (layout) and Model B (elements) for a single page.

    Returns:
        List of final FusedRegionResult instances ready for region persistence and downstream cropping.
    """
    threshold = (
        iou_threshold
        if iou_threshold is not None
        else settings.TABLE_DEDUP_IOU_THRESHOLD
    )

    # Separate by semantic category
    tables_a = [d for d in layout_detections if d.class_name == "table"]
    captions_a = [d for d in layout_detections if d.class_name == "table_caption"]
    footnotes_a = [d for d in layout_detections if d.class_name == "table_footnote"]

    tables_b = [d for d in element_detections if d.class_name == "table"]
    signatures_b = [d for d in element_detections if d.class_name == "signature"]
    stamps_b = [d for d in element_detections if d.class_name == "stamp"]

    final_regions: list[FusedRegionResult] = []

    # 1. Pairwise table IoU matching (Greedy best-match)
    pairs = []
    for a_idx, det_a in enumerate(tables_a):
        for b_idx, det_b in enumerate(tables_b):
            iou = calculate_iou(det_a.bbox, det_b.bbox)
            if iou >= threshold:
                pairs.append((iou, a_idx, b_idx))

    # Sort descending by IoU so strongest overlaps pair first
    pairs.sort(key=lambda x: x[0], reverse=True)

    matched_a = set()
    matched_b = set()
    fused_table_regions: list[FusedRegionResult] = []

    for iou, a_idx, b_idx in pairs:
        if a_idx in matched_a or b_idx in matched_b:
            continue
        matched_a.add(a_idx)
        matched_b.add(b_idx)

        det_a = tables_a[a_idx]
        det_b = tables_b[b_idx]

        # Fused table: Prefer Model A geometry, reference Model B as supporting
        fused_table_regions.append(
            FusedRegionResult(
                region_type="table",
                class_name="table",
                source="model_fusion",
                bbox=det_a.bbox,
                image_width=det_a.image_width or image_width,
                image_height=det_a.image_height or image_height,
                page_number=page_number,
                document_page_id=document_page_id or det_a.document_page_id,
                primary_detection_id=det_a.id,
                supporting_detection_ids=[det_b.id],
                confidence=det_a.confidence,
            )
        )
        logger.info(
            f"Fused overlapping tables (IoU={iou:.3f} >= {threshold}): "
            f"Model A '{det_a.id}' + Model B '{det_b.id}'"
        )

    # Unmatched tables from Model A
    for a_idx, det_a in enumerate(tables_a):
        if a_idx not in matched_a:
            fused_table_regions.append(
                FusedRegionResult(
                    region_type="table",
                    class_name="table",
                    source="model_single",
                    bbox=det_a.bbox,
                    image_width=det_a.image_width or image_width,
                    image_height=det_a.image_height or image_height,
                    page_number=page_number,
                    document_page_id=document_page_id or det_a.document_page_id,
                    primary_detection_id=det_a.id,
                    supporting_detection_ids=[],
                    confidence=det_a.confidence,
                )
            )

    # Unmatched tables from Model B
    for b_idx, det_b in enumerate(tables_b):
        if b_idx not in matched_b:
            fused_table_regions.append(
                FusedRegionResult(
                    region_type="table",
                    class_name="table",
                    source="model_single",
                    bbox=det_b.bbox,
                    image_width=det_b.image_width or image_width,
                    image_height=det_b.image_height or image_height,
                    page_number=page_number,
                    document_page_id=document_page_id or det_b.document_page_id,
                    primary_detection_id=det_b.id,
                    supporting_detection_ids=[],
                    confidence=det_b.confidence,
                )
            )

    # 2. Geometric association of Model A captions and footnotes to nearest table
    for tbl_region in fused_table_regions:
        tb = tbl_region.bbox

        # Associate caption: directly above table within 150px with horizontal overlap
        best_cap = None
        min_cap_dist = float("inf")
        for cap in captions_a:
            cb = cap.bbox
            if cb.y2 <= tb.y1 and (tb.y1 - cb.y2) <= 150.0:
                h_overlap = min(cb.x2, tb.x2) - max(cb.x1, tb.x1)
                if h_overlap > 0:
                    dist = tb.y1 - cb.y2
                    if dist < min_cap_dist:
                        min_cap_dist = dist
                        best_cap = cap.id
        tbl_region.associated_caption_id = best_cap

        # Associate footnote: directly below table within 150px with horizontal overlap
        best_foot = None
        min_foot_dist = float("inf")
        for foot in footnotes_a:
            fb = foot.bbox
            if fb.y1 >= tb.y2 and (fb.y1 - tb.y2) <= 150.0:
                h_overlap = min(fb.x2, tb.x2) - max(fb.x1, tb.x1)
                if h_overlap > 0:
                    dist = fb.y1 - tb.y2
                    if dist < min_foot_dist:
                        min_foot_dist = dist
                        best_foot = foot.id
        tbl_region.associated_footnote_id = best_foot

    final_regions.extend(fused_table_regions)

    # 3. Model B Signatures — primary source, individual regions
    for det_sig in signatures_b:
        final_regions.append(
            FusedRegionResult(
                region_type="signature",
                class_name="signature",
                source="model_single",
                bbox=det_sig.bbox,
                image_width=det_sig.image_width or image_width,
                image_height=det_sig.image_height or image_height,
                page_number=page_number,
                document_page_id=document_page_id or det_sig.document_page_id,
                primary_detection_id=det_sig.id,
                supporting_detection_ids=[],
                confidence=det_sig.confidence,
            )
        )

    # 4. Model B Stamps — primary source, individual regions
    for det_stamp in stamps_b:
        final_regions.append(
            FusedRegionResult(
                region_type="stamp",
                class_name="stamp",
                source="model_single",
                bbox=det_stamp.bbox,
                image_width=det_stamp.image_width or image_width,
                image_height=det_stamp.image_height or image_height,
                page_number=page_number,
                document_page_id=document_page_id or det_stamp.document_page_id,
                primary_detection_id=det_stamp.id,
                supporting_detection_ids=[],
                confidence=det_stamp.confidence,
            )
        )

    return final_regions
