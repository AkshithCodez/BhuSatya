"""
BhuSatya — Intelligent Land Record Digitization & Validation System

FastAPI application entry point.
AI assists document digitization and anomaly detection.
Final verification remains with authorized government officials.
"""
import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.database import Base, engine, SessionLocal
from app.db.seed import seed_database

# Import all models so Base.metadata.create_all finds them
import app.models  # noqa: F401

# API routers
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.detections import router as detections_router
from app.api.extraction import router as extraction_router
from app.api.validation import router as validation_router
from app.api.review import router as review_router
from app.api.parcels import router as parcels_router
from app.api.audit import router as audit_router
from app.api.dashboard import router as dashboard_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle — create tables and seed data on startup."""
    # Create directories
    for dir_path in [settings.STORAGE_DIR, settings.UPLOAD_DIR, settings.DOCUMENT_PAGES_DIR, settings.DETECTED_REGIONS_DIR]:
        os.makedirs(dir_path, exist_ok=True)

    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

    # Seed demo data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    # Model status
    if settings.model_available:
        logger.info(f"Layout model available at {settings.LAYOUT_MODEL_PATH}")
    else:
        logger.warning(
            f"Layout model NOT found at {settings.LAYOUT_MODEL_PATH}. "
            f"{'Using mock detections (DEMO_MODE).' if settings.DEMO_MODE else 'Detection endpoints will return errors.'}"
        )

    logger.info(f"Table text provider: {settings.TABLE_TEXT_PROVIDER}")
    logger.info(f"DEMO_MODE: {settings.DEMO_MODE}")

    yield

    logger.info("Shutting down...")


app = FastAPI(
    title="BhuSatya",
    description=(
        "Intelligent Land Record Digitization & Validation System. "
        "AI assists document digitization and anomaly detection. "
        "Final verification remains with authorized government officials."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(detections_router)
app.include_router(extraction_router)
app.include_router(validation_router)
app.include_router(review_router)
app.include_router(parcels_router)
app.include_router(audit_router)
app.include_router(dashboard_router)


@app.get("/health")
@app.get("/api/health")
def health_check():
    """API health check reporting backend, database, and layout model status."""
    from app.db.database import check_db_health
    db_healthy = check_db_health()
    return {
        "status": "healthy" if db_healthy else "degraded",
        "backend": "ok",
        "database": "ok" if db_healthy else "unavailable",
        "layout_model": "available" if settings.model_available else "unavailable",
        "app": settings.APP_NAME,
        "model_path": settings.LAYOUT_MODEL_PATH,
        "demo_mode": settings.DEMO_MODE,
        "table_text_provider": settings.TABLE_TEXT_PROVIDER,
    }
