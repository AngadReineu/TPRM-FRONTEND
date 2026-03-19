from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role          = Column(String, default="Risk Manager")     # Risk Manager | Compliance Officer | Admin | DPO
    avatar        = Column(String, nullable=True)
    status        = Column(String, default="Active")           # Active | Inactive
    last_login    = Column(DateTime(timezone=True), nullable=True)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
