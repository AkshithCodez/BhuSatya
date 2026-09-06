"""Document service — upload, file validation, PDF→image conversion."""
import os
import uuid
import logging
from pathlib import Path
from typing import Optional

from PIL import Image

from app.config import settings

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp"}
ALLOWED_PDF_TYPES = {".pdf"}
MAX_PDF_PAGES = 10


def validate_file(filename: str) -> tuple[bool, str, str]:
    """
    Validate uploaded file type.

    Returns:
        (is_valid, file_type, error_message)
    """
    ext = Path(filename).suffix.lower()

    if ext in ALLOWED_IMAGE_TYPES:
        return True, "image", ""
    elif ext in ALLOWED_PDF_TYPES:
        return True, "pdf", ""
    else:
        return False, "", f"Unsupported file type: {ext}. Allowed: {ALLOWED_IMAGE_TYPES | ALLOWED_PDF_TYPES}"


def save_upload(file_content: bytes, original_filename: str) -> tuple[str, str]:
    """
    Save uploaded file to disk.

    Returns:
        (saved_filename, file_path)
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    ext = Path(original_filename).suffix.lower()
    saved_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as f:
        f.write(file_content)

    logger.info(f"Saved upload: {original_filename} → {file_path}")
    return saved_filename, file_path


def convert_pdf_to_images(pdf_path: str, document_id: int) -> list[dict]:
    """
    Convert PDF pages to PNG images using PyMuPDF.

    Returns:
        List of {page_number, image_path, width, height}
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        logger.error("PyMuPDF not installed. Cannot convert PDF.")
        return []

    pages_dir = os.path.join(settings.DOCUMENT_PAGES_DIR, str(document_id))
    os.makedirs(pages_dir, exist_ok=True)

    pages = []
    try:
        doc = fitz.open(pdf_path)
        page_count = min(len(doc), MAX_PDF_PAGES)

        for page_num in range(page_count):
            page = doc[page_num]
            # Render at 2x for quality
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat)

            image_filename = f"page_{page_num + 1}.png"
            image_path = os.path.join(pages_dir, image_filename)
            pix.save(image_path)

            pages.append({
                "page_number": page_num + 1,
                "image_path": image_path,
                "width": pix.width,
                "height": pix.height,
            })

        doc.close()
        logger.info(f"Converted {page_count} PDF pages for document {document_id}")

    except Exception as e:
        logger.error(f"PDF conversion failed: {e}")

    return pages


def prepare_image(image_path: str, document_id: int) -> list[dict]:
    """
    Prepare a single image upload — store metadata.

    Returns:
        List with single page dict.
    """
    pages_dir = os.path.join(settings.DOCUMENT_PAGES_DIR, str(document_id))
    os.makedirs(pages_dir, exist_ok=True)

    try:
        img = Image.open(image_path)
        width, height = img.size

        # Copy to pages directory
        page_path = os.path.join(pages_dir, "page_1.png")
        img.save(page_path, "PNG")

        return [{
            "page_number": 1,
            "image_path": page_path,
            "width": width,
            "height": height,
        }]
    except Exception as e:
        logger.error(f"Image preparation failed: {e}")
        return []
