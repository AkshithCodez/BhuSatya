"""Parcels router — parcel details, timeline, and knowledge graph."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.land_record import Parcel, ParcelRight, Person
from app.schemas.parcel import ParcelOut, ParcelTimeline, ParcelGraph
from app.services.parcel_service import get_parcel_timeline, get_parcel_graph

router = APIRouter(prefix="/api/parcels", tags=["parcels"])


@router.get("")
def list_parcels(db: Session = Depends(get_db)):
    """List all parcels in reference database."""
    parcels = db.query(Parcel).all()
    result = []
    for p in parcels:
        # Get current holders
        holders = []
        rights = db.query(ParcelRight).filter(
            ParcelRight.parcel_id == p.id,
            ParcelRight.is_current == 1,
        ).all()
        for r in rights:
            person = db.query(Person).filter(Person.id == r.person_id).first()
            if person:
                holders.append({"name": person.name, "share": r.share})

        result.append(ParcelOut(
            id=p.id,
            state=p.state,
            district=p.district,
            tehsil=p.tehsil,
            village=p.village,
            khata_number=p.khata_number,
            khasra_number=p.khasra_number,
            area=p.area,
            area_unit=p.area_unit,
            land_classification=p.land_classification,
            gis_area=p.gis_area,
            gis_area_unit=p.gis_area_unit,
            gis_polygon=p.gis_polygon,
            current_holders=holders,
        ))

    return result


@router.get("/{parcel_id}", response_model=ParcelOut)
def get_parcel(parcel_id: int, db: Session = Depends(get_db)):
    """Get parcel details."""
    p = db.query(Parcel).filter(Parcel.id == parcel_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Parcel not found")

    holders = []
    rights = db.query(ParcelRight).filter(
        ParcelRight.parcel_id == p.id,
        ParcelRight.is_current == 1,
    ).all()
    for r in rights:
        person = db.query(Person).filter(Person.id == r.person_id).first()
        if person:
            holders.append({"name": person.name, "share": r.share})

    return ParcelOut(
        id=p.id,
        state=p.state,
        district=p.district,
        tehsil=p.tehsil,
        village=p.village,
        khata_number=p.khata_number,
        khasra_number=p.khasra_number,
        area=p.area,
        area_unit=p.area_unit,
        land_classification=p.land_classification,
        gis_area=p.gis_area,
        gis_area_unit=p.gis_area_unit,
        gis_polygon=p.gis_polygon,
        current_holders=holders,
    )


@router.get("/{parcel_id}/timeline", response_model=ParcelTimeline)
def get_timeline(parcel_id: int, db: Session = Depends(get_db)):
    """Get parcel timeline."""
    p = db.query(Parcel).filter(Parcel.id == parcel_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Parcel not found")

    events = get_parcel_timeline(parcel_id, db)
    return ParcelTimeline(
        parcel_id=parcel_id,
        khasra_number=p.khasra_number,
        events=events,
    )


@router.get("/{parcel_id}/graph", response_model=ParcelGraph)
def get_graph(parcel_id: int, db: Session = Depends(get_db)):
    """Get knowledge graph data for a parcel."""
    nodes, edges = get_parcel_graph(parcel_id, db)
    return ParcelGraph(nodes=nodes, edges=edges)
