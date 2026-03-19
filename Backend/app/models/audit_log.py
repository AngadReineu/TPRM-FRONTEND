from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    ts         = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    user       = Column(String, nullable=False)
    role       = Column(String, nullable=False)
    action     = Column(String, nullable=False)   # Control Updated | Supplier Added | Alert Triggered | etc.
    entity     = Column(String, nullable=True)    # name of the affected object
    desc       = Column(Text, nullable=True)
    ip         = Column(String, nullable=True)
    status     = Column(String, default="Success") # Success | Warning | Info
