"""Base detector class providing normalized Ultralytics YOLO inference and coordinate clamping."""
import logging
import os
from pathlib import Path
from typing import Optional
from PIL import Image

from app.services.layout_detection.schemas import BBox, DetectionResult

logger = logging.getLogger(__name__)


class BaseYOLODetector:
    """Reusable Ultralytics YOLO wrapper with lazy loading and strict output normalization."""

    def __init__(
        self,
        model_path: str,
        confidence: float = 0.35,
        model_name: str = "yolo_detector",
        model_role: str = "general",
        model_version: str = "v1.0",
    ):
        self.model_path = model_path
        self.confidence = confidence
        self.model_name = model_name
        self.model_role = model_role
        self.model_version = model_version
        self._model = None
        self._load_error: Optional[str] = None

    @property
    def is_available(self) -> bool:
        """Returns True if model file exists and is loadable."""
        if not Path(self.model_path).exists():
            return False
        try:
            self._ensure_loaded()
            return self._model is not None
        except Exception:
            return False

    def _ensure_loaded(self):
        """Lazy loader for YOLO model singleton."""
        if self._model is None and self._load_error is None:
            model_file = Path(self.model_path)
            if not model_file.exists():
                self._load_error = f"Model file not found at {self.model_path}"
                logger.warning(self._load_error)
                return

            try:
                from ultralytics import YOLO
                self._model = YOLO(self.model_path)
                logger.info(f"Loaded {self.model_name} from {self.model_path} (Task: {self._model.task})")
            except Exception as e:
                self._load_error = f"Failed to load YOLO model from {self.model_path}: {e}"
                logger.error(self._load_error)
                self._model = None

    def get_classes(self) -> dict[int, str]:
        """Dynamically inspect class names from the checkpoint."""
        try:
            self._ensure_loaded()
            if self._model is not None and hasattr(self._model, "names") and self._model.names:
                return {int(k): str(v) for k, v in self._model.names.items()}
        except Exception as e:
            logger.warning(f"Could not read class names for {self.model_name}: {e}")
        return {}

    def predict(
        self,
        image_path: str,
        confidence: Optional[float] = None,
        id_prefix: str = "det",
        page_number: int = 1,
        document_page_id: Optional[int] = None,
    ) -> list[DetectionResult]:
        """
        Execute genuine Ultralytics YOLO inference on an image file.

        Clamps coordinates to image boundaries and preserves exact model confidence.
        No mock or invented boxes.
        """
        self._ensure_loaded()
        if self._model is None:
            logger.warning(f"{self.model_name} cannot predict: {self._load_error or 'Model not loaded'}")
            return []

        img_file = Path(image_path)
        if not img_file.exists():
            logger.error(f"Image file not found: {image_path}")
            return []

        # Determine real image dimensions
        try:
            with Image.open(image_path) as img:
                img_w, img_h = img.size
        except Exception as e:
            logger.error(f"Failed to read image dimensions from {image_path}: {e}")
            return []

        conf_threshold = confidence if confidence is not None else self.confidence

        try:
            results = self._model.predict(
                str(image_path),
                conf=conf_threshold,
                verbose=False,
            )
        except Exception as e:
            logger.error(f"Ultralytics inference error on {self.model_name}: {e}")
            return []

        if not results:
            return []

        res = results[0]
        class_map = self.get_classes()
        detections: list[DetectionResult] = []

        for index, box in enumerate(res.boxes):
            class_id = int(box.cls[0].item() if hasattr(box.cls[0], "item") else box.cls[0])
            score = float(box.conf[0].item() if hasattr(box.conf[0], "item") else box.conf[0])
            xyxy = box.xyxy[0].tolist()

            # Safely clamp coordinates to image boundaries
            x1 = max(0.0, min(float(xyxy[0]), float(img_w)))
            y1 = max(0.0, min(float(xyxy[1]), float(img_h)))
            x2 = max(0.0, min(float(xyxy[2]), float(img_w)))
            y2 = max(0.0, min(float(xyxy[3]), float(img_h)))

            if x1 > x2:
                x1, x2 = x2, x1
            if y1 > y2:
                y1, y2 = y2, y1

            class_name = class_map.get(class_id, f"unknown_{class_id}")

            detections.append(
                DetectionResult(
                    id=f"{id_prefix}_{index + 1:03d}",
                    class_id=class_id,
                    class_name=class_name,
                    confidence=round(score, 4),
                    bbox=BBox(
                        x1=round(x1, 1),
                        y1=round(y1, 1),
                        x2=round(x2, 1),
                        y2=round(y2, 1),
                    ),
                    image_width=img_w,
                    image_height=img_h,
                    model_name=self.model_name,
                    model_role=self.model_role,
                    model_version=self.model_version,
                    page_number=page_number,
                    document_page_id=document_page_id,
                )
            )

        return detections
