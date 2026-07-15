from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


class InspectionType(str, Enum):
    QUALITY = "calidad"
    SECURITY = "seguridad"
    ENVIRONMENTAL = "ambiental"
    OPERATIONAL = "operacional"
    COMPLIANCE = "cumplimiento"
    SAFETY = "seguridad_industrial"
    OTHER = "otro"


class InspectionResult(str, Enum):
    PASS = "aprobado"
    FAIL = "no_aprobado"
    PARTIAL = "parcial"
    PENDING = "pendiente"


class InspectionStatus(str, Enum):
    SCHEDULED = "programada"
    IN_PROGRESS = "en_curso"
    COMPLETED = "completada"
    CANCELLED = "cancelada"


class InspectionChecklistItem(BaseModel):
    description: str
    status: str = "pendiente"
    observation: str = ""
    photo_url: str = ""


class InspectionCreate(BaseModel):
    organization_id: str
    client_organization_id: str
    work_order_id: Optional[str] = None
    inspection_type: InspectionType
    title: str = Field(..., min_length=3, max_length=200)
    description: str = ""
    scheduled_date: Optional[date] = None
    inspector_name: str = ""
    inspector_id: Optional[str] = None
    location: str = ""
    checklist: list[InspectionChecklistItem] = []
    notes: str = ""


class InspectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[InspectionStatus] = None
    result: Optional[InspectionResult] = None
    inspector_name: Optional[str] = None
    inspector_id: Optional[str] = None
    completed_date: Optional[date] = None
    location: Optional[str] = None
    checklist: Optional[list[InspectionChecklistItem]] = None
    findings: Optional[list[str]] = None
    corrective_actions: Optional[list[str]] = None
    notes: Optional[str] = None
    score: Optional[float] = None


class InspectionResponse(BaseModel):
    id: str
    organization_id: str
    client_organization_id: str
    work_order_id: Optional[str] = None
    inspection_number: str
    inspection_type: str
    title: str
    description: str
    status: str
    result: str
    scheduled_date: Optional[str] = None
    completed_date: Optional[str] = None
    inspector_name: str
    inspector_id: Optional[str] = None
    location: str
    checklist: list[dict]
    findings: list[str]
    corrective_actions: list[str]
    score: Optional[float] = None
    notes: str
    created_at: datetime
    updated_at: datetime


class InspectionListResponse(BaseModel):
    inspections: list[InspectionResponse]
    total: int
    page: int
    page_size: int


class InspectionStatsResponse(BaseModel):
    total: int = 0
    scheduled: int = 0
    in_progress: int = 0
    completed: int = 0
    cancelled: int = 0
    passed: int = 0
    failed: int = 0
    partial: int = 0
    avg_score: float = 0.0
    compliance_rate: float = 0.0
