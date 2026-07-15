from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ProcessType(str, Enum):
    STRATEGIC = "estrategico"
    TACTICAL = "tactico"
    OPERATIONAL = "operativo"
    SUPPORT = "soporte"


class ProcessStatus(str, Enum):
    ACTIVE = "activo"
    INACTIVE = "inactivo"
    DRAFT = "borrador"
    UNDER_REVIEW = "en_revision"


class RiskLevel(str, Enum):
    LOW = "bajo"
    MEDIUM = "medio"
    HIGH = "alto"
    CRITICAL = "critico"


class ProcessCreate(BaseModel):
    organization_id: str
    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = ""
    process_type: ProcessType = ProcessType.OPERATIONAL
    parent_id: Optional[str] = None
    owner_id: Optional[str] = None
    objective: Optional[str] = ""
    scope: Optional[str] = ""
    risk_level: RiskLevel = RiskLevel.LOW
    tags: list[str] = []


class ProcessUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    process_type: Optional[ProcessType] = None
    parent_id: Optional[str] = None
    owner_id: Optional[str] = None
    objective: Optional[str] = None
    scope: Optional[str] = None
    status: Optional[ProcessStatus] = None
    risk_level: Optional[RiskLevel] = None
    tags: Optional[list[str]] = None


class ProcessResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    code: str
    description: str = ""
    process_type: str
    parent_id: Optional[str] = None
    owner_id: Optional[str] = None
    objective: str = ""
    scope: str = ""
    status: str = "borrador"
    risk_level: str = "bajo"
    tags: list[str] = []
    created_at: datetime
    updated_at: datetime


class ProcessListResponse(BaseModel):
    processes: list[ProcessResponse]
    total: int
    page: int
    page_size: int
