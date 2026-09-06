"""Layout detection data schemas."""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BBox:
    x1: float
    y1: float
    x2: float
    y2: float


@dataclass
class DetectionResult:
    id: str
    class_id: int
    class_name: str
    confidence: float
    bbox: BBox
    image_width: int
    image_height: int


@dataclass
class LayoutDetectionResponse:
    detections: list[DetectionResult] = field(default_factory=list)
    model_name: str = "YOLOv8n-layout-detector"
    confidence_threshold: float = 0.35
    error: Optional[str] = None
