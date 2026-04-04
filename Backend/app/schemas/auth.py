from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Risk Manager"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    org_id: Optional[str] = None
    org_name: Optional[str] = None
    industry: Optional[str] = None
    avatar: Optional[str] = None
    status: str

    model_config = {"from_attributes": True}


class RegisterPayload(BaseModel):
    org_name: str
    industry: str
    name: str
    email: str
    password: str