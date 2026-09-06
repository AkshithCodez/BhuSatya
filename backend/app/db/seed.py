"""
Seed demo data — Prototype Reference Dataset.

Creates 3 demo parcels with persons, rights, mutations, and reference records.
This is NOT actual live government data — it is clearly labelled as prototype reference data.
"""
import json
import hashlib
import logging
from sqlalchemy.orm import Session


def _hash_password(password: str) -> str:
    """Simple hash for prototype. Production should use proper bcrypt."""
    return hashlib.sha256(password.encode()).hexdigest()

from app.models.user import User
from app.models.land_record import (
    Parcel, Person, ParcelRight, Mutation,
    RegistrationRecord, ReferenceRecord,
)

logger = logging.getLogger(__name__)


def seed_database(db: Session):
    """Seed the database with demo data if empty."""
    # Check if already seeded
    if db.query(User).first():
        logger.info("Database already seeded, skipping.")
        return

    logger.info("Seeding database with prototype reference data...")

    # ── Users ──
    users = [
        User(
            email="officer@sih.demo",
            hashed_password=_hash_password("demo123"),
            full_name="Dr. Rajesh Sharma",
            role="VERIFICATION_OFFICER",
        ),
        User(
            email="operator@sih.demo",
            hashed_password=_hash_password("demo123"),
            full_name="Anita Verma",
            role="DATA_ENTRY_OPERATOR",
        ),
        User(
            email="admin@sih.demo",
            hashed_password=_hash_password("demo123"),
            full_name="Sunil Gupta",
            role="ADMINISTRATOR",
        ),
    ]
    db.add_all(users)
    db.flush()

    # ── Persons ──
    ramesh = Person(name="Ramesh Kumar", father_name="Suresh Kumar")
    priya = Person(name="Priya Sharma", father_name="Mohan Sharma")
    anil = Person(name="Anil Singh", father_name="Bharat Singh")
    sunita = Person(name="Sunita Devi", father_name="Raghunath Prasad")
    vijay = Person(name="Vijay Patel", father_name="Gopal Patel")
    db.add_all([ramesh, priya, anil, sunita, vijay])
    db.flush()

    # ── GIS Polygon for main demo parcel ──
    demo_polygon = json.dumps([
        [28.6100, 77.2090],
        [28.6105, 77.2095],
        [28.6108, 77.2088],
        [28.6103, 77.2083],
        [28.6100, 77.2090],
    ])

    # ── Parcel 1: Main Demo (Rampur) ──
    parcel1 = Parcel(
        state="Demo State",
        district="Demo District",
        tehsil="Demo Tehsil",
        village="Rampur",
        khata_number="76",
        khasra_number="145/2",
        area=3.28,
        area_unit="acre",
        land_classification="Agricultural",
        gis_area=3.29,
        gis_area_unit="acre",
        gis_polygon=demo_polygon,
    )
    db.add(parcel1)
    db.flush()

    # Rights: Historical → Ramesh, Current → Priya
    db.add(ParcelRight(
        parcel_id=parcel1.id, person_id=ramesh.id,
        right_type="OWNER", share="1/1", is_current=0,
        start_date="1990", end_date="2004",
        source="Historical RoR",
    ))
    db.add(ParcelRight(
        parcel_id=parcel1.id, person_id=priya.id,
        right_type="OWNER", share="1/1", is_current=1,
        start_date="2004",
        source="Mutation #8732",
    ))

    # Mutation: Ramesh → Priya
    db.add(Mutation(
        mutation_number="8732",
        parcel_id=parcel1.id,
        mutation_type="SALE",
        from_person_id=ramesh.id,
        to_person_id=priya.id,
        area=3.28,
        area_unit="acre",
        mutation_date="2004",
        status="APPROVED",
    ))

    # Registration
    db.add(RegistrationRecord(
        registration_number="REG-2004-5678",
        parcel_id=parcel1.id,
        document_type="SALE_DEED",
        from_person_id=ramesh.id,
        to_person_id=priya.id,
        registration_date="2004-03-15",
    ))

    # Reference records for validation
    db.add_all([
        ReferenceRecord(
            parcel_id=parcel1.id,
            record_type="HISTORICAL_ROR",
            field_name="area",
            value="3.28",
            normalized_value="3.28",
            unit="acre",
            source_description="Historical RoR",
            record_year="1990",
        ),
        ReferenceRecord(
            parcel_id=parcel1.id,
            record_type="MUTATION",
            field_name="area",
            value="3.28",
            normalized_value="3.28",
            unit="acre",
            source_description="Mutation 8732",
            record_year="2004",
        ),
        ReferenceRecord(
            parcel_id=parcel1.id,
            record_type="HISTORICAL_ROR",
            field_name="holder_name",
            value="Ramesh Kumar",
            normalized_value="Ramesh Kumar",
            source_description="Historical RoR",
            record_year="1990",
        ),
        ReferenceRecord(
            parcel_id=parcel1.id,
            record_type="CURRENT_ROR",
            field_name="holder_name",
            value="Priya Sharma",
            normalized_value="Priya Sharma",
            source_description="Current RoR",
            record_year="2004",
        ),
    ])

    # ── Parcel 2: Anil Singh parcel ──
    parcel2_polygon = json.dumps([
        [28.6120, 77.2100],
        [28.6125, 77.2108],
        [28.6130, 77.2102],
        [28.6125, 77.2095],
        [28.6120, 77.2100],
    ])
    parcel2 = Parcel(
        state="Demo State",
        district="Demo District",
        tehsil="Demo Tehsil",
        village="Rampur",
        khata_number="77",
        khasra_number="146",
        area=2.50,
        area_unit="acre",
        land_classification="Agricultural",
        gis_area=2.51,
        gis_area_unit="acre",
        gis_polygon=parcel2_polygon,
    )
    db.add(parcel2)
    db.flush()

    db.add(ParcelRight(
        parcel_id=parcel2.id, person_id=anil.id,
        right_type="OWNER", share="1/1", is_current=1,
        start_date="2010",
        source="Mutation #9001",
    ))
    db.add(Mutation(
        mutation_number="9001",
        parcel_id=parcel2.id,
        mutation_type="INHERITANCE",
        from_person_id=sunita.id,
        to_person_id=anil.id,
        area=2.50,
        area_unit="acre",
        mutation_date="2010",
        status="APPROVED",
    ))
    db.add(ReferenceRecord(
        parcel_id=parcel2.id,
        record_type="CURRENT_ROR",
        field_name="area",
        value="2.50",
        normalized_value="2.50",
        unit="acre",
        source_description="Current RoR",
        record_year="2010",
    ))

    # ── Parcel 3: Shared parcel ──
    parcel3_polygon = json.dumps([
        [28.6140, 77.2110],
        [28.6148, 77.2118],
        [28.6152, 77.2112],
        [28.6145, 77.2105],
        [28.6140, 77.2110],
    ])
    parcel3 = Parcel(
        state="Demo State",
        district="Demo District",
        tehsil="Demo Tehsil",
        village="Sundarpur",
        khata_number="120",
        khasra_number="230/1",
        area=5.00,
        area_unit="acre",
        land_classification="Residential",
        gis_area=4.98,
        gis_area_unit="acre",
        gis_polygon=parcel3_polygon,
    )
    db.add(parcel3)
    db.flush()

    db.add(ParcelRight(
        parcel_id=parcel3.id, person_id=vijay.id,
        right_type="OWNER", share="1/2", is_current=1,
        start_date="2015",
        source="Mutation #10500",
    ))
    db.add(ParcelRight(
        parcel_id=parcel3.id, person_id=sunita.id,
        right_type="OWNER", share="1/2", is_current=1,
        start_date="2015",
        source="Mutation #10500",
    ))
    db.add(Mutation(
        mutation_number="10500",
        parcel_id=parcel3.id,
        mutation_type="PARTITION",
        mutation_date="2015",
        status="APPROVED",
    ))
    db.add(ReferenceRecord(
        parcel_id=parcel3.id,
        record_type="CURRENT_ROR",
        field_name="area",
        value="5.00",
        normalized_value="5.00",
        unit="acre",
        source_description="Current RoR",
        record_year="2015",
    ))

    db.commit()
    logger.info("Database seeded successfully with 3 demo parcels.")
