"""
Factory for creating table text extractors based on TABLE_TEXT_PROVIDER config.

When Model 2 is ready:
1. Create custom_model.py implementing TableTextExtractor
2. Set TABLE_TEXT_PROVIDER=custom in .env
3. Add the case to this factory
"""
import os
from app.config import settings
from app.services.table_extraction.base import TableTextExtractor
from app.services.table_extraction.mock import MockTableTextExtractor
from app.services.table_extraction.manual import ManualTableTextExtractor
from app.services.table_extraction.optional_ocr import OptionalOCRTableTextExtractor
from app.services.table_extraction.paddle_ocr import PaddleOCRTableTextExtractor


def create_table_extractor(provider: str) -> TableTextExtractor:
    """
    Create a table text extractor based on the provider name.

    Args:
        provider: One of 'paddle_ocr', 'manual', 'ocr', 'custom' (mock is test-only)

    Returns:
        A TableTextExtractor instance.
    """
    if provider == "mock":
        if not (settings.TESTING or os.environ.get("TESTING") == "true"):
            raise ValueError(
                "Mock table extractor is disabled in runtime flow to prevent dummy data injection. "
                "Use 'paddle_ocr' or 'manual' instead."
            )
        return MockTableTextExtractor()

    providers = {
        "manual": ManualTableTextExtractor,
        "ocr": OptionalOCRTableTextExtractor,
        "paddle_ocr": PaddleOCRTableTextExtractor,
        "paddleocr": PaddleOCRTableTextExtractor,
    }

    if provider not in providers:
        raise ValueError(
            f"Unknown TABLE_TEXT_PROVIDER: '{provider}'. "
            f"Available: {list(providers.keys())}."
        )

    return providers[provider]()
