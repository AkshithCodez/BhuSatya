"""
Structured field parser — converts raw text into normalized land record fields.

Uses regex, normalization, and aliases for deterministic parsing.
Does NOT use an LLM.
"""
import re
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class ParsedField:
    field_name: str
    value: str
    normalized_value: Optional[str] = None
    unit: Optional[str] = None
    confidence: float = 0.7
    source_text: str = ""


@dataclass
class ParseResult:
    fields: list[ParsedField] = field(default_factory=list)
    raw_text: str = ""
    errors: list[str] = field(default_factory=list)


# Aliases for field names (handles Hindi/English/abbreviation variations)
FIELD_ALIASES = {
    "state": ["state", "rajya", "प्रदेश"],
    "district": ["district", "dist", "jila", "जिला"],
    "tehsil": ["tehsil", "tahsil", "तहसील"],
    "village": ["village", "gram", "gaon", "गाँव", "ग्राम"],
    "khata_number": ["khata no", "khata", "khata number", "खाता", "खाता नं"],
    "khasra_number": [
        "khasra no", "khasra", "khasra number", "survey no", "survey number",
        "parcel no", "parcel number", "खसरा", "खसरा नं",
    ],
    "holder_name": [
        "holder name", "holder", "owner", "owner name", "name",
        "right holder", "dharank", "धारक",
    ],
    "father_name": [
        "father name", "father", "father's name", "s/o", "d/o", "w/o",
        "pita", "पिता",
    ],
    "area": ["area", "kshetrafal", "क्षेत्रफल"],
    "mutation_number": [
        "mutation no", "mutation", "mutation number", "dakhil kharij",
        "दाखिल खारिज",
    ],
    "mutation_date": ["mutation date", "dakhil date"],
    "registration_number": [
        "registration no", "registration", "reg no", "registration number",
    ],
    "land_classification": [
        "land type", "land classification", "classification", "bhumi prakar",
    ],
    "share": ["share", "hissa", "हिस्सा"],
}

AREA_UNITS = {
    "acre": ["acre", "acres", "ac", "एकड़"],
    "hectare": ["hectare", "hectares", "ha", "हेक्टेयर"],
    "bigha": ["bigha", "बीघा"],
    "biswa": ["biswa", "बिस्वा"],
    "kanal": ["kanal", "कनाल"],
    "marla": ["marla", "मरला"],
    "sq_ft": ["sq ft", "sqft", "square feet", "sq.ft"],
    "sq_m": ["sq m", "sqm", "square meter", "sq.m"],
}


def _normalize_text(text: str) -> str:
    """Normalize whitespace and strip."""
    return re.sub(r'\s+', ' ', text).strip()


def _find_field_name(key: str) -> Optional[str]:
    """Map a raw key to a canonical field name."""
    key_lower = key.lower().strip().rstrip(':').strip()
    # 1. Exact match first
    for canonical, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            if alias.lower() == key_lower:
                return canonical

    # 2. Check longest matching aliases first to prevent substrings like 'name' shadowing 'father name'
    all_pairs = []
    for canonical, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            all_pairs.append((alias, canonical))
    all_pairs.sort(key=lambda x: len(x[0]), reverse=True)

    for alias, canonical in all_pairs:
        if alias.lower() in key_lower:
            return canonical
    return None


def _parse_area(value: str) -> tuple[str, Optional[str]]:
    """Extract numeric area value and unit."""
    value = value.strip()
    for unit_canonical, unit_aliases in AREA_UNITS.items():
        for alias in unit_aliases:
            if alias.lower() in value.lower():
                numeric = re.sub(r'[^\d.]', '', value.split(alias.lower())[0] if alias.lower() in value.lower() else value)
                if numeric:
                    return numeric, unit_canonical
    # Just numeric
    numeric = re.sub(r'[^\d.]', '', value)
    return numeric if numeric else value, None


def parse_fields(raw_text: str, extraction_method: str = "unknown") -> ParseResult:
    """
    Parse raw text into structured land record fields.

    Handles formats like:
        Khata No: 76
        Khasra No: 145/2
        Area: 3.82 Acre
    """
    result = ParseResult(raw_text=raw_text)

    if not raw_text or not raw_text.strip():
        result.errors.append("Empty text provided")
        return result

    lines = raw_text.strip().split('\n')

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Try key: value format
        match = re.match(r'^(.+?):\s*(.+)$', line)
        if not match:
            continue

        raw_key = match.group(1).strip()
        raw_value = match.group(2).strip()

        field_name = _find_field_name(raw_key)
        if not field_name:
            continue

        normalized_value = _normalize_text(raw_value)
        unit = None

        # Special handling for area
        if field_name == "area":
            normalized_value, unit = _parse_area(raw_value)

        # Special handling for names - title case
        if field_name in ("holder_name", "father_name"):
            normalized_value = raw_value.strip().title()

        parsed = ParsedField(
            field_name=field_name,
            value=raw_value,
            normalized_value=normalized_value,
            unit=unit,
            source_text=line,
            confidence=0.7 if extraction_method == "temporary_mock" else 0.85,
        )

        result.fields.append(parsed)

    if not result.fields:
        result.errors.append("No recognized fields found in the text")

    return result
