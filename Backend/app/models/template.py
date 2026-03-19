from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, Integer
from sqlalchemy.sql import func
from ..database import Base


class Template(Base):
    __tablename__ = "templates"

    id             = Column(String, primary_key=True, index=True)
    name           = Column(String, nullable=False)
    description    = Column(Text, nullable=True)
    category       = Column(String, nullable=True)          # Security | Compliance | Process | etc.
    deployed       = Column(Boolean, default=False)
    vendor_count   = Column(Integer, default=0)
    question_count = Column(Integer, default=0)
    anomalies      = Column(JSON, default=[])               # list of anomaly preview objects
    tags           = Column(JSON, default=[])               # list of tag strings

    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())
