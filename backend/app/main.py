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
from app.db.database import Base, engine

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
    """Application lifecycle — initialize directories and verify tables without silent fallbacks."""
    # Create directories
    for dir_path in [settings.STORAGE_DIR, settings.UPLOAD_DIR, settings.DOCUMENT_PAGES_DIR, settings.DETECTED_REGIONS_DIR]:
        os.makedirs(dir_path, exist_ok=True)

    # Check real database connectivity
    from app.db.database import get_db_status
    db_status = get_db_status()
    if db_status["status"] == "ok":
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("PostgreSQL database tables verified.")
            from app.db.database import SessionLocal
            from app.db.seed import seed_database
            with SessionLocal() as db_session:
                seed_database(db_session)
        except Exception as e:
            logger.error(f"Failed to initialize database tables: {e}")
    else:
        logger.warning(
            f"Database unavailable on startup ({db_status['engine']}): {db_status.get('reason')}. "
            "PostgreSQL 16 is required. Database endpoints will return HTTP 503."
        )

    # Two-Model YOLO status
    from app.services.layout_detection import get_land_layout_detector, get_document_element_detector
    layout_det = get_land_layout_detector()
    elem_det = get_document_element_detector()

    if layout_det.is_available:
        logger.info(f"Model A (Land Layout) available at {settings.LAND_LAYOUT_MODEL_PATH}")
    else:
        logger.warning(f"Model A (Land Layout) NOT found at {settings.LAND_LAYOUT_MODEL_PATH}")

    if elem_det.is_available:
        logger.info(f"Model B (Document Elements) available at {settings.DOCUMENT_ELEMENT_MODEL_PATH}")
    else:
        logger.warning(f"Model B (Document Elements) NOT found at {settings.DOCUMENT_ELEMENT_MODEL_PATH}")

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
    """Truthful health check reflecting actual runtime dependencies and both models without simulation."""
    from app.db.database import get_db_status
    from app.services.layout_detection import get_land_layout_detector, get_document_element_detector

    db_status = get_db_status()
    layout_det = get_land_layout_detector()
    elem_det = get_document_element_detector()

    layout_available = layout_det.is_available
    elem_available = elem_det.is_available

    layout_classes = list(layout_det.get_classes().values()) if layout_available else []
    elem_classes = list(elem_det.get_classes().values()) if elem_available else []

    # Check PaddleOCR availability
    paddle_available = False
    if settings.TABLE_TEXT_PROVIDER in ("paddle_ocr", "paddleocr"):
        import importlib.util
        paddle_available = importlib.util.find_spec("paddleocr") is not None
    elif settings.TABLE_TEXT_PROVIDER == "manual":
        paddle_available = True

    overall_healthy = (
        db_status["status"] == "ok"
        and (layout_available or elem_available)
        and (paddle_available or settings.TABLE_TEXT_PROVIDER == "manual")
    )

    response = {
        "status": "ok" if overall_healthy else "degraded",
        "backend": {
            "status": "ok",
        },
        "database": {
            "status": db_status["status"],
            "engine": db_status["engine"],
        },
        "models": {
            "land_layout_detector": {
                "status": "available" if layout_available else "unavailable",
                "classes": layout_classes,
                "model_path": settings.LAND_LAYOUT_MODEL_PATH,
            },
            "table_signature_stamp_detector": {
                "status": "available" if elem_available else "unavailable",
                "classes": elem_classes,
                "model_path": settings.DOCUMENT_ELEMENT_MODEL_PATH,
            },
        },
        "table_text_provider": {
            "status": "available" if paddle_available else "unavailable",
            "provider": settings.TABLE_TEXT_PROVIDER,
        },
        # Backwards compatibility alias
        "layout_model": {
            "status": "available" if (layout_available and elem_available) else ("partial" if (layout_available or elem_available) else "unavailable"),
            "provider": "ultralytics",
        },
    }

    if db_status["status"] != "ok":
        response["database"]["reason"] = db_status.get("reason", "Connection failed")
    if not layout_available:
        response["models"]["land_layout_detector"]["reason"] = f"Model A not found or failed to load at {settings.LAND_LAYOUT_MODEL_PATH}"
    if not elem_available:
        response["models"]["table_signature_stamp_detector"]["reason"] = f"Model B not found or failed to load at {settings.DOCUMENT_ELEMENT_MODEL_PATH}"
    if not paddle_available and settings.TABLE_TEXT_PROVIDER in ("paddle_ocr", "paddleocr"):
        response["table_text_provider"]["reason"] = "paddleocr package not installed in environment"

    return response

