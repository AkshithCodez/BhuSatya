"""
PaddleOCR-based text extractor.
Integrated from teammate's OCR pipeline (SIH-2026).

Provides table region text extraction using PaddleOCR when installed,
with graceful fallback if dependencies are absent.
"""
import logging
from typing import Optional
from app.services.table_extraction.base import TableTextExtractor, TableExtractionResult

logger = logging.getLogger(__name__)


class PaddleOCRTableTextExtractor(TableTextExtractor):
    """Table text extraction using PaddleOCR."""

    def __init__(self):
        self._ocr = None
        self._initialized = False

    def _get_ocr(self):
        if not self._initialized:
            try:
                import os
                import warnings
                warnings.filterwarnings("ignore")
                os.environ["PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT"] = "0"
                os.environ["FLAGS_use_mkldnn"] = "0"
                os.environ["GLOG_minloglevel"] = "3"
                os.environ["PPOCR_SHOW_LOG"] = "0"

                import importlib
                paddleocr_mod = importlib.import_module("paddleocr")
                PaddleOCR = getattr(paddleocr_mod, "PaddleOCR")
                self._ocr = PaddleOCR(
                    device="cpu",
                    lang="en",
                    use_textline_orientation=False,
                    text_det_limit_side_len=1280,
                    text_recognition_batch_size=6,
                )
                logger.info("PaddleOCR engine initialized successfully.")
            except ImportError:
                logger.warning("PaddleOCR is not installed in the environment.")
                self._ocr = None
            except Exception as e:
                logger.warning(f"Could not initialize PaddleOCR: {e}")
                self._ocr = None
            self._initialized = True
        return self._ocr

    def extract(self, table_image_path: str) -> TableExtractionResult:
        ocr = self._get_ocr()
        if ocr is None:
            return TableExtractionResult(
                extraction_method="paddle_ocr",
                error="PaddleOCR is not available. Please install paddleocr or ensure C++ runtimes are installed.",
            )

        try:
            import numpy as np
            from PIL import Image

            pil_img = Image.open(table_image_path).convert("RGB")
            img_rgb = np.array(pil_img)
            results = list(ocr.predict(img_rgb))

            extracted_lines = []
            rec_confidences = []

            if results and results[0] is not None:
                raw = results[0]
                if isinstance(raw, dict):
                    texts = raw.get("rec_texts") or []
                    scores = raw.get("rec_scores") or []
                    extracted_lines = [str(t).strip() for t in texts if str(t).strip()]
                    rec_confidences = [float(s) for s in scores if s is not None]
                elif isinstance(raw, list):
                    for item in raw:
                        if item and len(item) > 1 and item[1]:
                            line_text = str(item[1][0]).strip()
                            if line_text:
                                extracted_lines.append(line_text)
                                if len(item[1]) > 1 and item[1][1] is not None:
                                    try:
                                        rec_confidences.append(float(item[1][1]))
                                    except (ValueError, TypeError):
                                        pass

            full_text = "\n".join(extracted_lines)
            mean_conf = (
                round(sum(rec_confidences) / len(rec_confidences), 4)
                if rec_confidences
                else None
            )

            return TableExtractionResult(
                raw_text=full_text,
                extraction_method="paddle_ocr",
                confidence=mean_conf,
            )

        except Exception as e:
            logger.error(f"PaddleOCR extraction failed on {table_image_path}: {e}")
            return TableExtractionResult(
                extraction_method="paddle_ocr",
                error=f"PaddleOCR extraction error: {str(e)}",
            )
