"""
Real YOLOv8n layout detector — wraps our trained layout_detector.pt model.

Uses the exact inference approach from the training notebook:
  model = YOLO("layout_detector.pt")
  results = model.predict(image_path, conf=0.35, verbose=False)

CPU-compatible. Uses CUDA automatically if available.
"""
import logging
from pathlib import Path
from typing import Optional

from app.services.layout_detection.schemas import BBox, DetectionResult, LayoutDetectionResponse

logger = logging.getLogger(__name__)

CLASS_NAMES = {
    0: "table",
    1: "signature",
    2: "stamp",
}


class LayoutDetector:
    """Real YOLO-based layout detector using our trained model."""

    def __init__(self, model_path: str, confidence: float = 0.35):
        self.model_path = model_path
        self.confidence = confidence
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load the YOLO model. Fails gracefully if model file doesn't exist."""
        model_file = Path(self.model_path)
        if not model_file.exists():
            logger.warning(
                f"Model file not found at {self.model_path}. "
                "Layout detection will not be available. "
                "Place layout_detector.pt in backend/ml_models/"
            )
            return

        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_path)
            logger.info(f"Layout detection model loaded from {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self.model = None

    @property
    def is_available(self) -> bool:
        return self.model is not None

    def detect(self, image_path: str, confidence: Optional[float] = None) -> LayoutDetectionResponse:
        """
        Run YOLO inference on a document image.

        Args:
            image_path: Path to the image file.
            confidence: Override confidence threshold (uses default if None).

        Returns:
            LayoutDetectionResponse with detections or error.
        """
        if not self.is_available:
            return LayoutDetectionResponse(
                error="Layout detection model is not loaded. Place layout_detector.pt in backend/ml_models/"
            )

        conf = confidence if confidence is not None else self.confidence
        image_file = Path(image_path)

        if not image_file.exists():
            return LayoutDetectionResponse(error=f"Image file not found: {image_path}")

        try:
            results = self.model.predict(
                str(image_path),
                conf=conf,
                verbose=False,
            )

            result = results[0]
            detections = []

            for index, box in enumerate(result.boxes):
                class_id = int(box.cls[0])
                class_confidence = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append(DetectionResult(
                    id=f"det_{index + 1:03d}",
                    class_id=class_id,
                    class_name=CLASS_NAMES.get(class_id, f"unknown_{class_id}"),
                    confidence=round(class_confidence, 4),
                    bbox=BBox(
                        x1=round(x1, 1),
                        y1=round(y1, 1),
                        x2=round(x2, 1),
                        y2=round(y2, 1),
                    ),
                    image_width=result.orig_shape[1],
                    image_height=result.orig_shape[0],
                ))

            logger.info(
                f"Detected {len(detections)} elements in {image_path} "
                f"(conf≥{conf})"
            )

            return LayoutDetectionResponse(
                detections=detections,
                confidence_threshold=conf,
            )

        except Exception as e:
            logger.error(f"YOLO inference failed on {image_path}: {e}")
            return LayoutDetectionResponse(error=f"Inference failed: {str(e)}")
