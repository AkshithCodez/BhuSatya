"""Model B: Table / Signature / Stamp Detector service.

Primary role: document-element detection (especially signature and stamp, plus table verification).
Checkpoint: backend/ml_models/table_signature_stamp_detector.pt
Classes: table, signature, stamp.
"""
import logging
from typing import Optional
from app.config import settings
from app.services.layout_detection.base import BaseYOLODetector
from app.services.layout_detection.schemas import DetectionResult

logger = logging.getLogger(__name__)


class DocumentElementDetector(BaseYOLODetector):
    """Ultralytics YOLO detector for signatures, stamps, and tables."""

    def __init__(
        self,
        model_path: Optional[str] = None,
        confidence: Optional[float] = None,
    ):
        super().__init__(
            model_path=model_path or settings.DOCUMENT_ELEMENT_MODEL_PATH,
            confidence=confidence if confidence is not None else settings.DOCUMENT_ELEMENT_CONFIDENCE,
            model_name="table_signature_stamp_detector",
            model_role="document_elements",
            model_version="v1.0",
        )

    def detect_page(
        self,
        image_path: str,
        confidence: Optional[float] = None,
        page_number: int = 1,
        document_page_id: Optional[int] = None,
    ) -> list[DetectionResult]:
        """Run inference on a page image and return normalized element detections."""
        return self.predict(
            image_path=image_path,
            confidence=confidence,
            id_prefix=f"elem_p{page_number}",
            page_number=page_number,
            document_page_id=document_page_id,
        )


# Singleton instance
_document_element_detector_instance: Optional[DocumentElementDetector] = None


def get_document_element_detector() -> DocumentElementDetector:
    """Get or create singleton instance of DocumentElementDetector."""
    global _document_element_detector_instance
    if _document_element_detector_instance is None:
        _document_element_detector_instance = DocumentElementDetector()
    return _document_element_detector_instance
