"""Detection and DetectedRegion ORM models."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    document_page_id = Column(Integer, ForeignKey("document_pages.id"), nullable=True)
    page_number = Column(Integer, nullable=False)
    detection_id = Column(String, nullable=False)  # e.g. det_001
    class_id = Column(Integer, nullable=False)
    class_name = Column(String, nullable=False)  # table, signature, stamp
    confidence = Column(Float, nullable=False)

    bbox_x1 = Column(Float, nullable=False)
    bbox_y1 = Column(Float, nullable=False)
    bbox_x2 = Column(Float, nullable=False)
    bbox_y2 = Column(Float, nullable=False)

    image_width = Column(Integer, nullable=False)
    image_height = Column(Integer, nullable=False)

    model_name = Column(String, default="YOLOv8n-layout")
    model_role = Column(String(50), nullable=True)  # layout | document_elements | fusion
    model_version = Column(String, default="v1.0")
    raw_output = Column(Text)  # JSON raw predictions

    created_at = Column(DateTime, server_default=func.now())

    document = relationship("Document", back_populates="detections")
    region = relationship("DetectedRegion", back_populates="detection", uselist=False, cascade="all, delete-orphan")


class DetectedRegion(Base):
    __tablename__ = "detected_regions"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(Integer, ForeignKey("detections.id"), nullable=True, unique=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    document_page_id = Column(Integer, ForeignKey("document_pages.id"), nullable=True)
    page_number = Column(Integer, nullable=False)

    region_type = Column(String)  # table, signature, stamp
    class_name = Column(String, nullable=False)  # table, signature, stamp
    source = Column(String, nullable=False, default="yolo")  # yolo, manual_selection, model_fusion, model_single
    supporting_detection_ids = Column(String(255), nullable=True)
    x1 = Column(Float, nullable=True)
    y1 = Column(Float, nullable=True)
    x2 = Column(Float, nullable=True)
    y2 = Column(Float, nullable=True)
    image_width = Column(Integer, nullable=True)
    image_height = Column(Integer, nullable=True)

    crop_path = Column(String, nullable=False)
    crop_width = Column(Integer)
    crop_height = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

    detection = relationship("Detection", back_populates="region")


# Backwards compatibility alias
ExtractedRegion = DetectedRegion
