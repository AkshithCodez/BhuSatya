"""Parcel service — lookup, timeline, and graph data construction."""
import json
from sqlalchemy.orm import Session
from app.models.land_record import Parcel, Person, ParcelRight, Mutation
from app.schemas.parcel import TimelineEvent, GraphNode, GraphEdge


def get_parcel_timeline(parcel_id: int, db: Session) -> list[TimelineEvent]:
    """Build a timeline of events for a parcel."""
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id).first()
    if not parcel:
        return []

    events = []

    # Get all rights (historical and current)
    rights = db.query(ParcelRight).filter(
        ParcelRight.parcel_id == parcel_id
    ).order_by(ParcelRight.start_date).all()

    for right in rights:
        person = db.query(Person).filter(Person.id == right.person_id).first()
        if person:
            events.append(TimelineEvent(
                year=right.start_date or "Unknown",
                event_type="RIGHT_HOLDER" if right.is_current else "HISTORICAL_HOLDER",
                description=f"{person.name} — {right.source or 'RoR'}",
                details={"share": right.share, "is_current": bool(right.is_current)},
            ))

    # Get mutations
    mutations = db.query(Mutation).filter(
        Mutation.parcel_id == parcel_id
    ).order_by(Mutation.mutation_date).all()

    for mut in mutations:
        from_person = db.query(Person).filter(Person.id == mut.from_person_id).first()
        to_person = db.query(Person).filter(Person.id == mut.to_person_id).first()

        desc = f"Mutation #{mut.mutation_number}"
        if mut.mutation_type:
            desc += f" ({mut.mutation_type})"
        if from_person and to_person:
            desc += f": {from_person.name} → {to_person.name}"

        events.append(TimelineEvent(
            year=mut.mutation_date or "Unknown",
            event_type="MUTATION",
            description=desc,
            details={"mutation_type": mut.mutation_type, "status": mut.status},
        ))

    # Sort by year
    events.sort(key=lambda e: e.year)
    return events


def get_parcel_graph(parcel_id: int, db: Session) -> tuple[list[GraphNode], list[GraphEdge]]:
    """Build a knowledge graph for a parcel."""
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id).first()
    if not parcel:
        return [], []

    nodes = []
    edges = []
    seen_persons = set()

    # Parcel node
    nodes.append(GraphNode(
        id=f"parcel_{parcel.id}",
        type="parcel",
        label=f"Khasra {parcel.khasra_number}",
        data={"village": parcel.village, "area": parcel.area},
    ))

    # Rights and persons
    rights = db.query(ParcelRight).filter(ParcelRight.parcel_id == parcel_id).all()
    for right in rights:
        person = db.query(Person).filter(Person.id == right.person_id).first()
        if person and person.id not in seen_persons:
            seen_persons.add(person.id)
            nodes.append(GraphNode(
                id=f"person_{person.id}",
                type="person",
                label=person.name,
            ))

        if person:
            edge_label = "HOLDS_RIGHTS_IN" if right.is_current else "HELD_RIGHTS_IN"
            edges.append(GraphEdge(
                id=f"right_{right.id}",
                source=f"person_{person.id}",
                target=f"parcel_{parcel.id}",
                label=edge_label,
            ))

    # Mutations
    mutations = db.query(Mutation).filter(Mutation.parcel_id == parcel_id).all()
    for mut in mutations:
        mut_node_id = f"mutation_{mut.id}"
        nodes.append(GraphNode(
            id=mut_node_id,
            type="mutation",
            label=f"Mutation #{mut.mutation_number}",
            data={"type": mut.mutation_type, "date": mut.mutation_date},
        ))

        edges.append(GraphEdge(
            id=f"mut_updates_{mut.id}",
            source=mut_node_id,
            target=f"parcel_{parcel.id}",
            label="UPDATES",
        ))

        if mut.from_person_id:
            from_person = db.query(Person).filter(Person.id == mut.from_person_id).first()
            if from_person:
                if from_person.id not in seen_persons:
                    seen_persons.add(from_person.id)
                    nodes.append(GraphNode(
                        id=f"person_{from_person.id}",
                        type="person",
                        label=from_person.name,
                    ))
                edges.append(GraphEdge(
                    id=f"mut_from_{mut.id}",
                    source=f"person_{from_person.id}",
                    target=mut_node_id,
                    label="TRANSFERRED_VIA",
                ))

        if mut.to_person_id:
            to_person = db.query(Person).filter(Person.id == mut.to_person_id).first()
            if to_person:
                if to_person.id not in seen_persons:
                    seen_persons.add(to_person.id)
                    nodes.append(GraphNode(
                        id=f"person_{to_person.id}",
                        type="person",
                        label=to_person.name,
                    ))
                edges.append(GraphEdge(
                    id=f"mut_to_{mut.id}",
                    source=mut_node_id,
                    target=f"person_{to_person.id}",
                    label="TRANSFERS_TO",
                ))

    return nodes, edges
