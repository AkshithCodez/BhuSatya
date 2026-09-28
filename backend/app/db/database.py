"""
SQLAlchemy database setup.
PostgreSQL (psycopg 3) is the primary runtime database.
Silent fallback to SQLite is strictly disabled.
"""
import logging
import os
from typing import Dict, Any
from fastapi import HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

logger = logging.getLogger(__name__)


def build_engine(url: str):
    """Build SQLAlchemy engine strictly based on configured DATABASE_URL."""
    # Normalize postgresql:// or postgres:// to postgresql+psycopg:// for psycopg 3
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)

    if url.startswith("sqlite"):
        # SQLite is allowed ONLY if explicitly configured (e.g. during isolated unit tests)
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            echo=False,
        )
    else:
        # PostgreSQL with psycopg 3
        return create_engine(
            url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 5},
            echo=False,
        )


# Initialize engine with the normalized DATABASE_URL
engine = build_engine(settings.normalized_database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db_status() -> Dict[str, Any]:
    """
    Check real database connectivity without silent fallbacks.
    Returns status dictionary indicating engine type and health.
    """
    dialect = engine.dialect.name
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "engine": dialect,
            "url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL,
        }
    except Exception as e:
        return {
            "status": "unavailable",
            "engine": dialect,
            "reason": str(e),
            "url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL,
        }


def check_db_health() -> bool:
    """Return True if database is online and responding to ping query."""
    status = get_db_status()
    return status["status"] == "ok"


def get_db():
    """
    FastAPI dependency yielding database session.
    Fails fast with HTTP 503 if the database is unavailable.
    Does NOT silently fall back to an alternate database.
    """
    status = get_db_status()
    if status["status"] != "ok":
        raise HTTPException(
            status_code=503,
            detail=f"Database unavailable ({status['engine']}): {status['reason']}. PostgreSQL 16 is required.",
        )

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
