from pydantic import BaseModel
from typing import Optional, List, Any


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    deployed: bool
    vendor_count: int
    question_count: int
    anomalies: List[Any] = []
    tags: List[str] = []

    model_config = {"from_attributes": True}
