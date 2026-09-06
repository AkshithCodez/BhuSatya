"""Document and DocumentPage ORM models."""
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # image/png, image/jpeg, application/pdf
    file_size = Column(Integer)
    status = Column(String, nullable=False, default="UPLOADED")
    # Statuses: UPLOADED, DETECTING_LAYOUT, LAYOUT_DETECTED, WAITING_FOR_TEXT_EXTRACTION,
    #           TEXT_EXTRACTED, STRUCTURED, VALIDATING, REVIEW_REQUIRED, READY_FOR_APPROVAL,
    #           VERIFIED, REJECTED, INVESTIGATION_REQUIRED
    village = Column(String)
    khasra_number = Column(String)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
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
