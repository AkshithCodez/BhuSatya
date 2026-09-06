"""Dashboard router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.document import Document
from app.schemas.dashboard import DashboardStats, RecentDocument, DashboardResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Get dashboard statistics and recent documents."""
    total = db.query(Document).count()
    processed = db.query(Document).filter(
        Document.status.notin_(["UPLOADED"])
    ).count()
    needs_review = db.query(Document).filter(
        Document.status.in_(["REVIEW_REQUIRED", "READY_FOR_APPROVAL"])
    ).count()
    verified = db.query(Document).filter(
        Document.status == "VERIFIED"
    ).count()
    high_risk = db.query(Document).filter(
        Document.risk_level.in_(["HIGH", "CRITICAL"])
    ).count()

    stats = DashboardStats(
        total_documents=total,
        processed=processed,
        needs_review=needs_review,
        verified=verified,
        high_risk=high_risk,
    )

    recent = db.query(Document).order_by(Document.created_at.desc()).limit(10).all()

    return DashboardResponse(
        stats=stats,
        recent_documents=[
            RecentDocument(
                id=doc.id,
                original_filename=doc.original_filename,
                village=doc.village,
                khasra_number=doc.khasra_number,
                created_at=doc.created_at,
                risk_level=doc.risk_level,
                status=doc.status,
            )
            for doc in recent
        ],
    )
