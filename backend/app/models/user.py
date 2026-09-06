"""User ORM model."""
from sqlalchemy import Column, Integer, String, DateTime, func

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # DATA_ENTRY_OPERATOR | VERIFICATION_OFFICER | ADMINISTRATOR
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
