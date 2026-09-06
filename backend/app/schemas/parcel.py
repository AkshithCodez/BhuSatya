"""Parcel schemas including timeline and graph data."""
from pydantic import BaseModel
from typing import Optional


class ParcelOut(BaseModel):
    id: int
    state: str
    district: str
    tehsil: str
    village: str
    khata_number: Optional[str] = None
    khasra_number: str
    area: Optional[float] = None
    area_unit: str = "acre"
    land_classification: Optional[str] = None
    gis_area: Optional[float] = None
    gis_area_unit: str = "acre"
    gis_polygon: Optional[str] = None
    current_holders: list[dict] = []

    class Config:
        from_attributes = True


class TimelineEvent(BaseModel):
    year: str
    event_type: str
    description: str
    details: Optional[dict] = None


class ParcelTimeline(BaseModel):
    parcel_id: int
    khasra_number: str
    events: list[TimelineEvent]


class GraphNode(BaseModel):
    id: str
    type: str  # person, parcel, mutation, deed
    label: str
    data: Optional[dict] = None


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str


class ParcelGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
