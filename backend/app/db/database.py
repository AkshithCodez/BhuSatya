"""SQLAlchemy database setup supporting PostgreSQL (psycopg 3) with SQLite fallback."""
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import StaticPool

from app.config import settings

logger = logging.getLogger(__name__)


def build_engine(url: str):
    """Build an engine appropriate for PostgreSQL or SQLite."""
    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            echo=False,
        )
    else:
        return create_engine(
            url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            echo=False,
        )


# Primary engine initialization
try:
    engine = build_engine(settings.DATABASE_URL)
    # Quick connectivity check
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info(f"Database connected successfully: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
except Exception as e:
    if not settings.DATABASE_URL.startswith("sqlite"):
        logger.warning(
            f"Could not connect to configured database ({e}). "
            "Falling back to local SQLite (bhusatya.db) for development."
        )
        engine = build_engine("sqlite:///./bhusatya.db")
    else:
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency yielding database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health() -> bool:
    """Return True if database can execute a ping query."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
