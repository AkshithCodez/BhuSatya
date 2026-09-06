"""
Mock table text extractor — temporary replacement until Model 2 is ready.

Returns demo land record text for known sample documents.
This is NOT the real model. The extraction_method is always 'temporary_mock'.
"""
from app.services.table_extraction.base import TableTextExtractor, TableExtractionResult


DEMO_TABLE_TEXT = """Khata No: 76
Khasra No: 145/2
Holder Name: Ramesh Kumar
Father Name: Suresh Kumar
Area: 3.82 Acre
Mutation No: 8732
Village: Rampur
Tehsil: Demo Tehsil
District: Demo District
State: Demo State"""


class MockTableTextExtractor(TableTextExtractor):
    """
    Temporary mock provider returning demo text.

    Layout detection = trained custom YOLOv8n model ✅
    Table-text extraction = temporary provider until custom Model 2 is available 🔜
    """

    def extract(self, table_image_path: str) -> TableExtractionResult:
        return TableExtractionResult(
            raw_text=DEMO_TABLE_TEXT,
            extraction_method="temporary_mock",
            confidence=0.0,
        )
