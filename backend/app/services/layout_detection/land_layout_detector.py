"""Model A: Land Layout Detector service.

Primary role: document layout and table structure detection.
Checkpoint: backend/ml_models/land_layout_detector.pt
Classes in checkpoint: abandon, figure, figure_caption, formula_caption,
isolate_formula, plain_text, table, table_caption, table_footnote, title.
"""
import logging
from typing import Optional
from app.config import settings
from app.services.layout_detection.base import BaseYOLODetector
from app.services.layout_detection.schemas import DetectionResult

logger = logging.getLogger(__name__)


class LandLayoutDetector(BaseYOLODetector):
    """Ultralytics YOLO detector for land document layout analysis."""

    def __init__(
        self,
        model_path: Optional[str] = None,
        confidence: Optional[float] = None,
    ):
        super().__init__(
            model_path=model_path or settings.LAND_LAYOUT_MODEL_PATH,
            confidence=confidence if confidence is not None else settings.LAND_LAYOUT_CONFIDENCE,
            model_name="land_layout_detector",
            model_role="layout",
            model_version="v1.0",
        )

    def detect_page(
        self,
        image_path: str,
        confidence: Optional[float] = None,
        page_number: int = 1,
        document_page_id: Optional[int] = None,
    ) -> list[DetectionResult]:
        """Run inference on a page image and return normalized layout detections."""
        return self.predict(
            image_path=image_path,
            confidence=confidence,
            id_prefix=f"lay_p{page_number}",
            page_number=page_number,
            document_page_id=document_page_id,
        )


# Singleton instance
_land_layout_detector_instance: Optional[LandLayoutDetector] = None


def get_land_layout_detector() -> LandLayoutDetector:
    """Get or create singleton instance of LandLayoutDetector."""
    global _land_layout_detector_instance
    if _land_layout_detector_instance is None:
        _land_layout_detector_instance = LandLayoutDetector()
    return _land_layout_detector_instance
