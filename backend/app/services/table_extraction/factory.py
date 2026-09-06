"""
Factory for creating table text extractors based on TABLE_TEXT_PROVIDER config.

When Model 2 is ready:
1. Create custom_model.py implementing TableTextExtractor
2. Set TABLE_TEXT_PROVIDER=custom in .env
3. Add the case to this factory
"""
from app.services.table_extraction.base import TableTextExtractor
from app.services.table_extraction.mock import MockTableTextExtractor
from app.services.table_extraction.manual import ManualTableTextExtractor
from app.services.table_extraction.optional_ocr import OptionalOCRTableTextExtractor


def create_table_extractor(provider: str) -> TableTextExtractor:
    """
    Create a table text extractor based on the provider name.

    Args:
        provider: One of 'mock', 'manual', 'ocr', 'custom'

    Returns:
        A TableTextExtractor instance.
    """
    providers = {
        "mock": MockTableTextExtractor,
        "manual": ManualTableTextExtractor,
        "ocr": OptionalOCRTableTextExtractor,
    }

    if provider not in providers:
        raise ValueError(
            f"Unknown TABLE_TEXT_PROVIDER: '{provider}'. "
            f"Available: {list(providers.keys())}. "
            "For custom Model 2, implement FutureCustomModelTableTextExtractor "
            "and add it to the factory."
        )

    return providers[provider]()
