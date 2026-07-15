from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class AssetType(str, Enum):
    HARDWARE = "hardware"
    SOFTWARE = "software"
    INFORMATION = "informacion"
    SERVICE = "servicio"
    NETWORK = "red"
    PERSONNEL = "personal"
    FACILITY = "instalacion"


class Criticality(str, Enum):
    LOW = "bajo"
    MEDIUM = "medio"
    HIGH = "alto"
    CRITICAL = "critico"


class CIAClassification(BaseModel):
    confidentiality: int = Field(1, ge=1, le=5, description="1=sin impacto, 5=catastrófico")
    integrity: int = Field(1, ge=1, le=5, description="1=sin impacto, 5=catastrófico")
    availability: int = Field(1, ge=1, le=5, description="1=sin impacto, 5=catastrófico")


class AssetCreate(BaseModel):
    organization_id: str
    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = ""
    asset_type: AssetType = AssetType.HARDWARE
    criticality: Criticality = Criticality.LOW
    cia: CIAClassification = CIAClassification()
    process_id: Optional[str] = None
    owner_id: Optional[str] = None
    location: Optional[str] = ""
    brand: Optional[str] = ""
    model: Optional[str] = ""
    serial_number: Optional[str] = ""
    ip_address: Optional[str] = ""
    operating_system: Optional[str] = ""
    responsible_user_id: Optional[str] = None
    acquisition_date: Optional[str] = None
    warranty_until: Optional[str] = None
    cost: Optional[float] = None
    status: str = "activo"
    tags: list[str] = []
    custom_fields: dict = {}


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    asset_type: Optional[AssetType] = None
    criticality: Optional[Criticality] = None
    cia: Optional[CIAClassification] = None
    process_id: Optional[str] = None
    owner_id: Optional[str] = None
    location: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    ip_address: Optional[str] = None
    operating_system: Optional[str] = None
    responsible_user_id: Optional[str] = None
    acquisition_date: Optional[str] = None
    warranty_until: Optional[str] = None
    cost: Optional[float] = None
    status: Optional[str] = None
    tags: Optional[list[str]] = None
    custom_fields: Optional[dict] = None


class AssetResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    code: str
    description: str = ""
    asset_type: str
    criticality: str
    cia: dict
    process_id: Optional[str] = None
    owner_id: Optional[str] = None
    location: str = ""
    brand: str = ""
    model: str = ""
    serial_number: str = ""
    ip_address: str = ""
    operating_system: str = ""
    responsible_user_id: Optional[str] = None
    acquisition_date: Optional[str] = None
    warranty_until: Optional[str] = None
    cost: Optional[float] = None
    status: str = "activo"
    tags: list[str] = []
    custom_fields: dict = {}
    created_at: datetime
    updated_at: datetime


class AssetListResponse(BaseModel):
    assets: list[AssetResponse]
    total: int
    page: int
    page_size: int


class AssetStatsResponse(BaseModel):
    total: int
    by_type: dict[str, int]
    by_criticality: dict[str, int]
    by_status: dict[str, int]
    avg_cia: dict[str, float]
