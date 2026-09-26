"""
Searchable PDF generation service.
Integrated from teammate's PaddleOCR + PyMuPDF pipeline (SIH-2026).

Converts scanned document images into searchable PDFs by overlaying recognized text
at corresponding coordinates using PyMuPDF (fitz).
"""
import io
import logging
from pathlib import Path
from typing import Optional, List, Tuple
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


def create_searchable_pdf_from_ocr(
    input_image_path: str,
    output_pdf_path: str,
    ocr_lines: List[Tuple[np.ndarray, str]],
    jpeg_quality: int = 85,
) -> bool:
    """
    Build a searchable PDF from an image and OCR text boxes.

    Args:
        input_image_path: Path to the scanned page image.
        output_pdf_path: Path where the searchable PDF will be saved.
        ocr_lines: List of tuples (polygon_coords, text).
        jpeg_quality: Quality of the background image in the PDF.

    Returns:
        True if successful, False otherwise.
    """
    try:
        import pymupdf as fitz
    except ImportError:
        logger.error("pymupdf is not installed. Cannot build searchable PDF.")
        return False

    try:
        pil_img = Image.open(input_image_path).convert("RGB")
        orig_w, orig_h = pil_img.size

        img_buf = io.BytesIO()
        pil_img.save(img_buf, format="JPEG", quality=jpeg_quality, optimize=False)

        pdf_doc = fitz.open()
        pdf_page = pdf_doc.new_page(width=orig_w, height=orig_h)
        pdf_page.insert_image(fitz.Rect(0, 0, orig_w, orig_h), stream=img_buf.getvalue())

        text_count = 0
        for poly, text in ocr_lines:
            poly_arr = np.asarray(poly, dtype=np.float32)
            if poly_arr.ndim == 3:
                poly_arr = poly_arr[0]

            x0 = float(poly_arr[:, 0].min())
            y0 = float(poly_arr[:, 1].min())
            y1 = float(poly_arr[:, 1].max())
            box_h = max(1.0, y1 - y0)

            # Insert invisible text overlay (render_mode=3) for OCR searchability
            pdf_page.insert_text(
                fitz.Point(x0, y1 - box_h * 0.15),
                str(text),
                fontsize=max(6.0, box_h * 0.8),
                render_mode=3,
            )
            text_count += 1

        output_dir = Path(output_pdf_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)

        pdf_doc.save(output_pdf_path, deflate=True, garbage=3)
        pdf_doc.close()
        logger.info(f"Generated searchable PDF with {text_count} text blocks -> {output_pdf_path}")
        return True

    except Exception as e:
        logger.error(f"Failed to generate searchable PDF: {e}")
        return False
