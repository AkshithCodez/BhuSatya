"""
Manual table text extractor — officer types/pastes text from a detected table.

The text goes through the same real parser and validation system.
Useful until Model 2 is ready.
"""
from app.services.table_extraction.base import TableTextExtractor, TableExtractionResult


class ManualTableTextExtractor(TableTextExtractor):
    """Accepts manually-entered text from an officer."""

    def __init__(self):
        self._pending_text: str | None = None

    def set_text(self, text: str):
        """Set the manually entered text."""
        self._pending_text = text

    def extract(self, table_image_path: str) -> TableExtractionResult:
        if not self._pending_text:
            return TableExtractionResult(
                raw_text="",
                extraction_method="manual",
                confidence=1.0,
                error="No text has been entered yet. Use the text input to provide table content.",
            )

        result = TableExtractionResult(
            raw_text=self._pending_text,
            extraction_method="manual",
            confidence=1.0,
        )
        self._pending_text = None
        return result
