from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: int
    ts: datetime
    user: str
    role: str
    action: str
    entity: Optional[str] = None
    desc: Optional[str] = None
    ip: Optional[str] = None
    status: str

    model_config = {"from_attributes": True}
