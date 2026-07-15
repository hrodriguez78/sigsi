from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ControlCategory(str, Enum):
    ORGANIZATIONAL = "organizativo"
    PEOPLE = "personas"
    PHYSICAL = "fisico"
    TECHNOLOGICAL = "tecnologico"


class ImplementationStatus(str, Enum):
    NOT_STARTED = "no_iniciado"
    IN_PROGRESS = "en_progreso"
    IMPLEMENTED = "implementado"
    EFFECTIVE = "efectivo"
    NOT_APPLICABLE = "no_aplicable"


class ComplianceLevel(str, Enum):
    FULL = "total"
    PARTIAL = "parcial"
    MINIMAL = "minimo"
    NONE = "ninguno"
    NOT_ASSESSED = "no_evaluado"


class ControlCreate(BaseModel):
    organization_id: str
    control_id: str = Field(..., description="Ej: A.5.1, A.8.12")
    name: str = Field(..., min_length=2, max_length=300)
    description: str = ""
    category: ControlCategory = ControlCategory.ORGANIZATIONAL
    annex_a: Optional[str] = None
    iso_clause: Optional[str] = None
    implementation_status: ImplementationStatus = ImplementationStatus.NOT_STARTED
    compliance_level: ComplianceLevel = ComplianceLevel.NOT_ASSESSED
    responsible_id: Optional[str] = None
    evidence_description: Optional[str] = ""
    notes: Optional[str] = ""
    tags: list[str] = []


class ControlUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ControlCategory] = None
    annex_a: Optional[str] = None
    iso_clause: Optional[str] = None
    implementation_status: Optional[ImplementationStatus] = None
    compliance_level: Optional[ComplianceLevel] = None
    responsible_id: Optional[str] = None
    evidence_description: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[list[str]] = None


class EvidenceCreate(BaseModel):
    control_id: str
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = ""
    file_url: Optional[str] = None
    evidence_type: str = "documento"


class EvidenceResponse(BaseModel):
    id: str
    control_id: str
    title: str
    description: str = ""
    file_url: Optional[str] = None
    evidence_type: str = "documento"
    uploaded_by: Optional[str] = None
    created_at: datetime


class ControlResponse(BaseModel):
    id: str
    organization_id: str
    control_id: str
    name: str
    description: str = ""
    category: str
    annex_a: Optional[str] = None
    iso_clause: Optional[str] = None
    implementation_status: str
    compliance_level: str
    responsible_id: Optional[str] = None
    evidence_description: str = ""
    notes: str = ""
    tags: list[str] = []
    evidence_count: int = 0
    created_at: datetime
    updated_at: datetime


class ControlListResponse(BaseModel):
    controls: list[ControlResponse]
    total: int
    page: int
    page_size: int


class ControlStatsResponse(BaseModel):
    total: int
    by_category: dict[str, int]
    by_status: dict[str, int]
    by_compliance: dict[str, int]
    compliance_percentage: float
    implementation_percentage: float


class SoAResponse(BaseModel):
    organization_id: str
    total_controls: int
    applicable_controls: int
    implemented: int
    effective: int
    partial: int
    not_implemented: int
    compliance_pct: float
    controls: list[ControlResponse]
