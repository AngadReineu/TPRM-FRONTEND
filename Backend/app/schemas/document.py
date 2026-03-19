from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentResponse(BaseModel):
    id: str
    name: str
    original_name: str
    mime_type: Optional[str] = None
    size_bytes: int
    vendor_id: Optional[str] = None
    vendor_name: Optional[str] = None
    category: Optional[str] = None
    uploaded_by: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
