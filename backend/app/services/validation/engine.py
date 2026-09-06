"""
Validation engine — runs all validators and aggregates results.

Each validator is independent. This engine orchestrates them.
"""
from sqlalchemy.orm import Session
from app.services.validation.base import ValidationResultData
from app.services.validation.required_fields import RequiredFieldsValidator
from app.services.validation.parcel_format import ParcelFormatValidator
from app.services.validation.administrative_hierarchy import AdministrativeHierarchyValidator
from app.services.validation.parcel_existence import ParcelExistenceValidator
from app.services.validation.area_validator import AreaValidator
from app.services.validation.holder_validator import HolderValidator
from app.services.validation.mutation_validator import MutationValidator
from app.services.validation.share_validator import ShareValidator
from app.services.validation.registration_validator import RegistrationValidator
from app.services.validation.cross_document_validator import CrossDocumentValidator


class ValidationEngine:
    """Runs all validators in sequence and collects results."""

    def __init__(self):
        self.validators = [
            RequiredFieldsValidator(),
            ParcelFormatValidator(),
            AdministrativeHierarchyValidator(),
            ParcelExistenceValidator(),
            AreaValidator(),
            HolderValidator(),
            MutationValidator(),
            ShareValidator(),
            RegistrationValidator(),
            CrossDocumentValidator(),
        ]

    def validate(self, fields: dict, db: Session) -> list[ValidationResultData]:
        """Run all validators against the extracted fields."""
        all_results = []

        for validator in self.validators:
            try:
                results = validator.validate(fields, db)
                all_results.extend(results)
            except Exception as e:
                all_results.append(ValidationResultData(
                    rule=validator.__class__.__name__,
                    status="SKIP",
                    message=f"Validator error: {str(e)}",
                ))

        return all_results
