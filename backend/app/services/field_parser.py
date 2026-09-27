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
    confidence: Optional[float] = None
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
        "khasra no", "khasra", "khasra number", "खसरा", "खसरा नं",
    ],
    "survey_number": ["survey no", "survey number", "survey", "सर्वे", "सर्वे नं"],
    "parcel_number": ["parcel no", "parcel number", "parcel"],
    "holder_name": [
        "holder name", "holder", "owner", "owner name", "name",
        "right holder", "dharank", "धारक",
    ],
    "father_name": [
        "father name", "father", "father's name", "s/o", "d/o", "w/o",
        "pita", "पिता",
    ],
    "father_or_spouse_name": [
        "father or spouse name", "father/spouse name", "father or spouse", "father/spouse",
        "spouse name", "husband name", "पति", "पिता/पति",
    ],
    "area": ["area", "kshetrafal", "क्षेत्रफल"],
    "area_unit": ["area unit", "unit", "इकाई"],
    "mutation_number": [
        "mutation no", "mutation", "mutation number", "dakhil kharij",
        "दाखिल खारिज",
    ],
    "mutation_date": ["mutation date", "dakhil date", "mutation dt", "तारीख"],
    "registration_number": [
        "registration no", "registration", "reg no", "registration number", "पंजीकरण",
    ],
    "land_classification": [
        "land type", "land classification", "classification", "bhumi prakar", "भूमि प्रकार",
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


def parse_fields(
    raw_text: str,
    extraction_method: str = "unknown",
    source_confidence: Optional[float] = None,
) -> ParseResult:
    """
    Parse raw text into structured land record fields.

    Handles formats like:
        Khata No: 76
        Khasra No: 145/2
        Area: 3.82 Acre
    And two-line table OCR outputs:
        Khata No:
        76
        Khasra No:
        145/2
    """
    result = ParseResult(raw_text=raw_text)

    if not raw_text or not raw_text.strip():
        result.errors.append("Empty text provided")
        return result

    raw_lines = [l.strip() for l in raw_text.strip().split('\n') if l.strip()]
    i = 0
    while i < len(raw_lines):
        line = raw_lines[i]

        raw_key = None
        raw_value = None

        # 1. Try single-line delimiter format: "Key: Value" or "Key - Value"
        match = re.match(r'^(.+?)(?::\s*|[-—=]\s*|\s*\|\s*|\t+|\s{2,})(.+)$', line)
        if match:
            cand_key = match.group(1).strip()
            cand_val = match.group(2).strip()
            if _find_field_name(cand_key):
                raw_key = cand_key
                raw_value = cand_val

        # 2. If no single-line match, check if line is a standalone field label
        # e.g. "Village:", "Khata No:", "Holder Name:", "Area:"
        if not raw_key:
            field_cand = _find_field_name(line)
            if field_cand and i + 1 < len(raw_lines):
                next_line = raw_lines[i + 1]
                # If next line is not another recognized field label, it is the value
                if not _find_field_name(next_line):
                    raw_key = line
                    raw_value = next_line
                    i += 1  # Consume next line as value

        # 3. Check if line starts with known alias followed by value without delimiter
        if not raw_key:
            line_clean = line.strip()
            for canonical, aliases in FIELD_ALIASES.items():
                for alias in sorted(aliases, key=len, reverse=True):
                    if line_clean.lower().startswith(alias.lower()):
                        rem = line_clean[len(alias):].strip().lstrip(':-—=|').strip()
                        if rem and not rem.lower().startswith("no:"):
                            raw_key = alias
                            raw_value = rem
                            break
                if raw_key:
                    break

        if not raw_key or not raw_value:
            i += 1
            continue

        field_name = _find_field_name(raw_key)
        if not field_name:
            i += 1
            continue

        normalized_value = _normalize_text(raw_value)
        unit = None

        # Special handling for area
        if field_name == "area":
            normalized_value, unit = _parse_area(raw_value)

        # Special handling for names - title case
        if field_name in ("holder_name", "father_name", "father_or_spouse_name"):
            normalized_value = raw_value.strip().title()

        parsed = ParsedField(
            field_name=field_name,
            value=raw_value,
            normalized_value=normalized_value,
            unit=unit,
            source_text=f"{raw_key}: {raw_value}",
            confidence=source_confidence,
        )
        result.fields.append(parsed)

        # If area has unit, also emit area_unit field
        if field_name == "area" and unit:
            result.fields.append(ParsedField(
                field_name="area_unit",
                value=unit,
                normalized_value=unit,
                source_text=f"{raw_key}: {raw_value}",
                confidence=source_confidence,
            ))

        i += 1

    if not result.fields:
        result.errors.append("No recognized fields found in the text")

    return result

