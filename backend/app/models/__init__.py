"""Models package - imports all ORM models for Alembic/create_all discovery."""
from app.models.user import User
from app.models.document import Document, DocumentPage
from app.models.detection import Detection, ExtractedRegion
from app.models.extraction import TableExtraction, ExtractedField
from app.models.land_record import (
    Parcel, Person, ParcelRight, Mutation,
    RegistrationRecord, ReferenceRecord,
)
from app.models.validation import ValidationResult
from app.models.review import Review, FieldCorrection
from app.models.audit import AuditEvent

__all__ = [
    "User", "Document", "DocumentPage",
    "Detection", "ExtractedRegion",
    "TableExtraction", "ExtractedField",
    "Parcel", "Person", "ParcelRight", "Mutation",
    "RegistrationRecord", "ReferenceRecord",
    "ValidationResult", "Review", "FieldCorrection",
    "AuditEvent",
]
