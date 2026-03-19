from sqlalchemy import Column, String, Integer, DateTime, Text, BigInteger
from sqlalchemy.sql import func
from ..database import Base


class Document(Base):
    __tablename__ = "documents"

    id           = Column(String, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    mime_type    = Column(String, nullable=True)
    size_bytes   = Column(BigInteger, default=0)
    path         = Column(String, nullable=False)          # path on disk / S3 key
    vendor_id    = Column(String, nullable=True, index=True)
    vendor_name  = Column(String, nullable=True)
    category     = Column(String, nullable=True)           # NDA | DPA | ISO | SOW | Other
    uploaded_by  = Column(String, nullable=True)
    status       = Column(String, default="Active")        # Active | Archived

    created_at   = Column(DateTime(timezone=True), server_default=func.now())
