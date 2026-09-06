"""
Optional OCR-based table text extractor (placeholder).

Uses pytesseract if available, otherwise returns an error.
This is a fallback, NOT Model 2.
"""
from app.services.table_extraction.base import TableTextExtractor, TableExtractionResult


class OptionalOCRTableTextExtractor(TableTextExtractor):
    """OCR-based text extraction using Tesseract (if installed)."""

    def extract(self, table_image_path: str) -> TableExtractionResult:
        try:
            import pytesseract
            from PIL import Image

            img = Image.open(table_image_path)
            text = pytesseract.image_to_string(img)

            return TableExtractionResult(
                raw_text=text.strip(),
                extraction_method="ocr_tesseract",
                confidence=0.5,
            )
        except ImportError:
            return TableExtractionResult(
                extraction_method="ocr_tesseract",
                error="pytesseract is not installed. Install it with: pip install pytesseract",
            )
        except Exception as e:
            return TableExtractionResult(
                extraction_method="ocr_tesseract",
                error=f"OCR failed: {str(e)}",
            )
