"""
Test configuration and fixtures.
Ensures unit and integration test execution is strictly isolated.
Section 21: Test data exists only inside test databases/fixtures and never leaks into runtime.
"""
import os
import pytest

# Flag testing environment
os.environ["TESTING"] = "true"

from app.config import settings
settings.TESTING = True

from app.main import app as fastapi_app
from app.db.database import Base, build_engine, get_db
from app.db.seed import seed_database
import app.models  # noqa: F401
from sqlalchemy.orm import sessionmaker

test_db_url = "sqlite:///./test_bhusatya.db"
test_engine = build_engine(test_db_url)
TestSession = sessionmaker(bind=test_engine)


def override_get_db():
    """Dependency override providing isolated SQLite test session."""
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup isolated test database for unit and API integration tests."""
    Base.metadata.create_all(bind=test_engine)

    # Seed demo reference data in test database
    session = TestSession()
    try:
        seed_database(session)
    finally:
        session.close()

    # Override get_db dependency in FastAPI app
    fastapi_app.dependency_overrides[get_db] = override_get_db

    yield

    # Clean up
    fastapi_app.dependency_overrides.clear()
    test_engine.dispose()
    if os.path.exists("./test_bhusatya.db"):
        try:
            os.remove("./test_bhusatya.db")
        except Exception:
            pass
