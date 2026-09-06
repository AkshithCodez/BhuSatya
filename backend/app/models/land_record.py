"""Land record ORM models: Parcel, Person, ParcelRight, Mutation, RegistrationRecord, ReferenceRecord."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, func

from app.db.database import Base


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    tehsil = Column(String, nullable=False)
    village = Column(String, nullable=False)
    khata_number = Column(String)
    khasra_number = Column(String, nullable=False, index=True)
    area = Column(Float)
    area_unit = Column(String, default="acre")
    land_classification = Column(String)
    gis_area = Column(Float)
    gis_area_unit = Column(String, default="acre")
    # GIS polygon as JSON string for prototype
    gis_polygon = Column(Text)
    created_at = Column(DateTime, server_default=func.now())


class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    father_name = Column(String)
    address = Column(String)
    created_at = Column(DateTime, server_default=func.now())


class ParcelRight(Base):
    __tablename__ = "parcel_rights"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False)
    right_type = Column(String, default="OWNER")  # OWNER, LESSEE, MORTGAGEE
    share = Column(String, default="1/1")
    is_current = Column(Integer, default=1)
    start_date = Column(String)
    end_date = Column(String)
    source = Column(String)  # Historical RoR, Mutation, Sale Deed
    created_at = Column(DateTime, server_default=func.now())


class Mutation(Base):
    __tablename__ = "mutations"

    id = Column(Integer, primary_key=True, index=True)
    mutation_number = Column(String, nullable=False, unique=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    mutation_type = Column(String)  # SALE, INHERITANCE, GIFT, PARTITION
    from_person_id = Column(Integer, ForeignKey("persons.id"))
    to_person_id = Column(Integer, ForeignKey("persons.id"))
    area = Column(Float)
    area_unit = Column(String, default="acre")
    mutation_date = Column(String)
    status = Column(String, default="APPROVED")  # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime, server_default=func.now())


class RegistrationRecord(Base):
    __tablename__ = "registration_records"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"))
    document_type = Column(String)  # SALE_DEED, GIFT_DEED, LEASE
    from_person_id = Column(Integer, ForeignKey("persons.id"))
    to_person_id = Column(Integer, ForeignKey("persons.id"))
    registration_date = Column(String)
    created_at = Column(DateTime, server_default=func.now())


class ReferenceRecord(Base):
    __tablename__ = "reference_records"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    record_type = Column(String, nullable=False)  # HISTORICAL_ROR, MUTATION, GIS, CURRENT_ROR
    field_name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    normalized_value = Column(String)
    unit = Column(String)
    source_description = Column(String)
    record_year = Column(String)
    created_at = Column(DateTime, server_default=func.now())
