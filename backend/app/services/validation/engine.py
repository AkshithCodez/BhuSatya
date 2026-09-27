"""
Validation engine — runs all validators and aggregates results.

Each validator is independent. This engine orchestrates them.
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.services.validation.base import ValidationResultData
from app.services.validation.reference_matcher import match_reference_parcel
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
    """Runs all validators in sequence and collects results with unified resolution context."""

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

    def validate(self, fields: dict, db: Session, document_id: Optional[int] = None) -> list[ValidationResultData]:
        """Run all validators against extracted fields using PostgreSQL reference data."""
        # 1. Resolve reference parcel using cadastral matching logic
        match_result = match_reference_parcel(fields, db)
        context = {
            "match_result": match_result,
            "parcel": match_result.parcel,
            "document_id": document_id,
        }

        all_results = []

        for validator in self.validators:
            try:
                results = validator.validate(fields, db, context=context)
                all_results.extend(results)
            except Exception as e:
                all_results.append(ValidationResultData(
                    rule=validator.__class__.__name__,
                    rule_code="VALIDATOR_ERROR",
                    status="SKIP",
                    severity="LOW",
                    message=f"Validator error: {str(e)}",
                ))

        return all_results

