"""
Abstract base class for table text extraction.

Model 2 is NOT trained yet. This interface defines the contract
that any future table text extraction model must implement.

When Model 2 is ready, implement:
    class CustomModelTableTextExtractor(TableTextExtractor):
        def extract(self, table_image_path: str) -> TableExtractionResult:
            ...

Set TABLE_TEXT_PROVIDER=custom in .env. Nothing else changes.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class TableExtractionResult:
    raw_text: str = ""
    extraction_method: str = "unknown"
    confidence: Optional[float] = None
    error: Optional[str] = None
    fields: dict = field(default_factory=dict)


class TableTextExtractor(ABC):
    """Interface for table text extraction providers."""

    @abstractmethod
    def extract(self, table_image_path: str) -> TableExtractionResult:
        """
        Extract text from a cropped table image.

        Args:
            table_image_path: Path to the cropped table region image.

        Returns:
            TableExtractionResult with raw text and metadata.
        """
        ...
