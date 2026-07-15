from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class RiskCategory(str, Enum):
    STRATEGIC = "estrategico"
    OPERATIONAL = "operativo"
    COMPLIANCE = "cumplimiento"
    FINANCIAL = "financiero"
    REPUTATIONAL = "reputacional"
    TECHNICAL = "tecnico"


class RiskLevel(str, Enum):
    LOW = "bajo"
    MEDIUM = "medio"
    HIGH = "alto"
    CRITICAL = "critico"


class RiskStatus(str, Enum):
    IDENTIFIED = "identificado"
    ANALYZING = "en_analisis"
    TREATING = "en_tratamiento"
    MONITORING = "en_seguimiento"
    ACCEPTED = "aceptado"
    CLOSED = "cerrado"


class TreatmentType(str, Enum):
    MITIGATE = "mitigar"
    TRANSFER = "transferir"
    AVOID = "evitar"
    ACCEPT = "aceptar"


class RiskCreate(BaseModel):
    organization_id: str
    name: str = Field(..., min_length=2, max_length=300)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = ""
    category: RiskCategory = RiskCategory.OPERATIONAL
    asset_id: Optional[str] = None
    process_id: Optional[str] = None
    source: Optional[str] = ""
    consequence: Optional[str] = ""
    probability: int = Field(1, ge=1, le=5, description="1=raro, 5=casi seguro")
    impact: int = Field(1, ge=1, le=5, description="1=insignificante, 5=catastrófico")
    treatment: Optional[TreatmentType] = None
    treatment_plan: Optional[str] = ""
    owner_id: Optional[str] = None
    tags: list[str] = []


class RiskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[RiskCategory] = None
    asset_id: Optional[str] = None
    process_id: Optional[str] = None
    source: Optional[str] = None
    consequence: Optional[str] = None
    probability: Optional[int] = None
    impact: Optional[int] = None
    treatment: Optional[TreatmentType] = None
    treatment_plan: Optional[str] = None
    owner_id: Optional[str] = None
    status: Optional[RiskStatus] = None
    tags: Optional[list[str]] = None


class RiskResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    code: str
    description: str = ""
    category: str
    asset_id: Optional[str] = None
    process_id: Optional[str] = None
    source: str = ""
    consequence: str = ""
    probability: int
    impact: int
    risk_level: str
    risk_score: int
    treatment: Optional[str] = None
    treatment_plan: str = ""
    owner_id: Optional[str] = None
    status: str = "identificado"
    tags: list[str] = []
    created_at: datetime
    updated_at: datetime


class RiskListResponse(BaseModel):
    risks: list[RiskResponse]
    total: int
    page: int
    page_size: int


class RiskMatrixResponse(BaseModel):
    matrix: list[list[int]]
    labels_probability: list[str]
    labels_impact: list[str]
    risks_by_cell: dict[str, list[str]]


class RiskStatsResponse(BaseModel):
    total: int
    by_level: dict[str, int]
    by_category: dict[str, int]
    by_status: dict[str, int]
    avg_score: float
    top_risks: list[dict]


class TreatmentCreate(BaseModel):
    risk_id: str
    treatment_type: TreatmentType
    plan: str = Field(..., min_length=10)
    responsible_id: Optional[str] = None
    deadline: Optional[str] = None
    budget: Optional[float] = None


class TreatmentResponse(BaseModel):
    id: str
    risk_id: str
    treatment_type: str
    plan: str
    responsible_id: Optional[str] = None
    deadline: Optional[str] = None
    budget: Optional[float] = None
    status: str = "pendiente"
    created_at: datetime
    updated_at: datetime
