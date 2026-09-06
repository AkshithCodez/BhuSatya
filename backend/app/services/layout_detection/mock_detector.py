"""
Mock layout detector for DEMO_MODE when layout_detector.pt is unavailable.

Returns hardcoded detections that simulate real model output.
Do NOT silently pretend the real model ran — always mark as mock.
"""
from app.services.layout_detection.schemas import BBox, DetectionResult, LayoutDetectionResponse


class MockLayoutDetector:
    """Returns demo detections when the real model is not available."""

    def __init__(self, confidence: float = 0.35):
        self.confidence = confidence

    @property
    def is_available(self) -> bool:
        return True

    def detect(self, image_path: str, confidence: float | None = None) -> LayoutDetectionResponse:
        """Return mock detections for demo purposes."""
        return LayoutDetectionResponse(
            detections=[
                DetectionResult(
                    id="det_001",
                    class_id=0,
                    class_name="table",
                    confidence=0.972,
                    bbox=BBox(x1=165.2, y1=111.5, x2=1548.8, y2=690.6),
                    image_width=1700,
                    image_height=2200,
                ),
                DetectionResult(
                    id="det_002",
                    class_id=2,
                    class_name="stamp",
                    confidence=0.941,
                    bbox=BBox(x1=1200.0, y1=1800.0, x2=1500.0, y2=2050.0),
                    image_width=1700,
                    image_height=2200,
                ),
                DetectionResult(
                    id="det_003",
                    class_id=1,
                    class_name="signature",
                    confidence=0.887,
                    bbox=BBox(x1=800.0, y1=1850.0, x2=1150.0, y2=2000.0),
                    image_width=1700,
                    image_height=2200,
                ),
            ],
            model_name="YOLOv8n-layout-detector (MOCK)",
            confidence_threshold=confidence or self.confidence,
        )
