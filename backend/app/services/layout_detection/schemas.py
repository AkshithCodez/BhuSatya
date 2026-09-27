"""Layout detection data schemas for two-model YOLO integration."""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BBox:
    x1: float
    y1: float
    x2: float
    y2: float

    @property
    def width(self) -> float:
        return max(0.0, self.x2 - self.x1)

    @property
    def height(self) -> float:
        return max(0.0, self.y2 - self.y1)

    @property
    def area(self) -> float:
        return self.width * self.height

    def intersection(self, other: "BBox") -> float:
        ix1 = max(self.x1, other.x1)
        iy1 = max(self.y1, other.y1)
        ix2 = min(self.x2, other.x2)
        iy2 = min(self.y2, other.y2)
        iw = max(0.0, ix2 - ix1)
        ih = max(0.0, iy2 - iy1)
        return iw * ih

    def union(self, other: "BBox") -> float:
        return self.area + other.area - self.intersection(other)

    def iou(self, other: "BBox") -> float:
        u = self.union(other)
        if u <= 0.0:
            return 0.0
        return self.intersection(other) / u


@dataclass
class DetectionResult:
    id: str
    class_id: int
    class_name: str
    confidence: float
    bbox: BBox
    image_width: int
    image_height: int
    model_name: str = "land_layout_detector"
    model_role: str = "layout"
    model_version: str = "v1.0"
    document_page_id: Optional[int] = None
    page_number: int = 1



@dataclass
class FusedRegionResult:
    region_type: str  # table, signature, stamp, etc.
    class_name: str
    source: str  # model_fusion, model_single, manual_selection
    bbox: BBox
    image_width: int
    image_height: int
    page_number: int = 1
    document_page_id: Optional[int] = None
    primary_detection_id: Optional[str] = None
    supporting_detection_ids: list[str] = field(default_factory=list)
    confidence: Optional[float] = None
    associated_caption_id: Optional[str] = None
    associated_footnote_id: Optional[str] = None


@dataclass
class LayoutDetectionResponse:
    detections: list[DetectionResult] = field(default_factory=list)
    confidence_threshold: float = 0.35
    error: Optional[str] = None
    model_name: Optional[str] = None



@dataclass
class TwoModelDetectionResponse:
    detections: list[DetectionResult] = field(default_factory=list)
    fused_regions: list[FusedRegionResult] = field(default_factory=list)
    model_statuses: dict[str, str] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)

