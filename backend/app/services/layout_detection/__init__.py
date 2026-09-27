"""Layout detection package with two-model YOLO architecture and table deduplication."""
from app.services.layout_detection.base import BaseYOLODetector
from app.services.layout_detection.land_layout_detector import (
    LandLayoutDetector,
    get_land_layout_detector,
)
from app.services.layout_detection.document_element_detector import (
    DocumentElementDetector,
    get_document_element_detector,
)
from app.services.layout_detection.fusion import (
    calculate_iou,
    fuse_page_detections,
)
from app.services.layout_detection.crop_service import crop_image_region
from app.services.layout_detection.schemas import (
    BBox,
    DetectionResult,
    FusedRegionResult,
    TwoModelDetectionResponse,
)
from app.services.layout_detection.detector import LayoutDetector
from app.services.layout_detection.mock_detector import MockLayoutDetector

__all__ = [
    "BaseYOLODetector",
    "LandLayoutDetector",
    "get_land_layout_detector",
    "DocumentElementDetector",
    "get_document_element_detector",
    "calculate_iou",
    "fuse_page_detections",
    "crop_image_region",
    "BBox",
    "DetectionResult",
    "FusedRegionResult",
    "TwoModelDetectionResponse",
    "LayoutDetector",
    "MockLayoutDetector",
]
