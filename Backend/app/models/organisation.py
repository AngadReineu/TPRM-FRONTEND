from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from ..database import Base
import uuid


class Organisation(Base):
    __tablename__ = "organisations"

    id         = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name       = Column(String, nullable=False)
    industry   = Column(String, nullable=True)
    status     = Column(String, default="active")  # active | suspended
    created_at = Column(DateTime(timezone=True), server_default=func.now())