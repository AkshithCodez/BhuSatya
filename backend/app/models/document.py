"""Document and DocumentPage ORM models."""
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    stored_filename = Column(String)
    original_filename = Column(String, nullable=False)
    mime_type = Column(String)
    file_type = Column(String, nullable=False)  # image/png, image/jpeg, application/pdf
    file_path = Column(String, nullable=False)
    file_hash = Column(String)
    file_size = Column(Integer)

    state = Column(String)
    district = Column(String)
    tehsil = Column(String)
    village = Column(String)
    khasra_number = Column(String)

    status = Column(String, nullable=False, default="UPLOADED")
    # Statuses: UPLOADED, DETECTING_LAYOUT, LAYOUT_DETECTED, TEXT_EXTRACTION_PENDING,
    #           TEXT_EXTRACTED, STRUCTURED, VALIDATING, REVIEW_REQUIRED, READY_FOR_APPROVAL,
    #           VERIFIED, REJECTED, INVESTIGATION_REQUIRED
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, server_default=func.now())
    processing_started_at = Column(DateTime)
    processing_completed_at = Column(DateTime)

    risk_score = Column(Float)
    risk_level = Column(String)  # LOW, MODERATE, HIGH, CRITICAL
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    image_path = Column(String, nullable=False)
    image_width = Column(Integer)
    image_height = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

    document = relationship("Document", back_populates="pages")
