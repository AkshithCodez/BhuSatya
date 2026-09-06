"""Document upload and management router."""
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.document import Document, DocumentPage
from app.schemas.document import DocumentOut, DocumentList
from app.services.document_service import validate_file, save_upload, convert_pdf_to_images, prepare_image
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a land document (image or PDF)."""
    is_valid, file_type, error = validate_file(file.filename or "unknown")
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    saved_filename, file_path = save_upload(content, file.filename or "upload")

    doc = Document(
        filename=saved_filename,
        original_filename=file.filename or "unknown",
        file_path=file_path,
        file_type=file_type,
        file_size=len(content),
        status="UPLOADED",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Convert to page images
    if file_type == "pdf":
        pages = convert_pdf_to_images(file_path, doc.id)
    else:
        pages = prepare_image(file_path, doc.id)

    for page_data in pages:
        page = DocumentPage(
            document_id=doc.id,
            page_number=page_data["page_number"],
            image_path=page_data["image_path"],
            image_width=page_data.get("width"),
            image_height=page_data.get("height"),
        )
        db.add(page)

    db.commit()

    log_audit_event(
        db, "DOCUMENT_UPLOADED",
        f"Document '{file.filename}' uploaded ({len(pages)} pages)",
        document_id=doc.id,
    )

    doc_out = DocumentOut(
        id=doc.id,
        filename=doc.filename,
        original_filename=doc.original_filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        status=doc.status,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        page_count=len(pages),
    )
    return doc_out


@router.get("", response_model=DocumentList)
def list_documents(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all documents."""
    docs = db.query(Document).order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(Document).count()

    items = []
    for doc in docs:
        page_count = db.query(DocumentPage).filter(DocumentPage.document_id == doc.id).count()
        items.append(DocumentOut(
            id=doc.id,
            filename=doc.filename,
            original_filename=doc.original_filename,
            file_type=doc.file_type,
            file_size=doc.file_size,
            status=doc.status,
            village=doc.village,
            khasra_number=doc.khasra_number,
            risk_score=doc.risk_score,
            risk_level=doc.risk_level,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
            page_count=page_count,
        ))

    return DocumentList(documents=items, total=total)


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get document details."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    page_count = db.query(DocumentPage).filter(DocumentPage.document_id == doc.id).count()
    return DocumentOut(
        id=doc.id,
        filename=doc.filename,
        original_filename=doc.original_filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        status=doc.status,
        village=doc.village,
        khasra_number=doc.khasra_number,
        risk_score=doc.risk_score,
        risk_level=doc.risk_level,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        page_count=page_count,
    )
