from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    nit: str = Field(..., min_length=9, max_length=20)
    description: Optional[str] = ""
    address: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = None
    website: Optional[str] = None


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None


class OrganizationResponse(BaseModel):
    id: str
    name: str
    nit: str
    description: str = ""
    address: str = ""
    phone: str = ""
    email: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class OrganizationListResponse(BaseModel):
    organizations: list[OrganizationResponse]
    total: int
    page: int
    page_size: int
