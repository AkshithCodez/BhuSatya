"""Cross-document consistency validator (placeholder)."""
from sqlalchemy.orm import Session
from app.services.validation.base import Validator, ValidationResultData


class CrossDocumentValidator(Validator):
    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        # Placeholder — will compare fields across multiple documents
        # for the same parcel once multiple documents exist
        return []
