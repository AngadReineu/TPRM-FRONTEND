from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(String, primary_key=True, index=True)
    name            = Column(String, nullable=False)
    email           = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    avatar          = Column(String, nullable=True)
    status          = Column(String, default="Active")           # Active | Inactive
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    # V1 multi-tenancy columns
    org_id          = Column(String, nullable=True, index=True)
    role            = Column(String, default="admin")            # admin | vendor
    is_active       = Column(Boolean, default=True)
    last_login      = Column(DateTime(timezone=True), nullable=True)
