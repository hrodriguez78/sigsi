from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class IncidentType(str, Enum):
    SECURITY = "seguridad"
    AVAILABILITY = "disponibilidad"
    DATA_BREACH = "brecha_datos"
    MALWARE = "malware"
    PHISHING = "phishing"
    UNAUTHORIZED_ACCESS = "acceso_no_autorizado"
    CONFIGURATION = "configuracion"
    HUMAN_ERROR = "error_humano"
    OTHER = "otro"


class IncidentSeverity(str, Enum):
    LOW = "bajo"
    MEDIUM = "medio"
    HIGH = "alto"
    CRITICAL = "critico"


class IncidentStatus(str, Enum):
    OPEN = "abierto"
    IN_PROGRESS = "en_investigacion"
    CONTAINED = "contenido"
    ERADICATED = "erradicado"
    RECOVERED = "recuperado"
    CLOSED = "cerrado"


class IncidentPriority(str, Enum):
    P1 = "p1_critico"
    P2 = "p2_alto"
    P3 = "p3_medio"
    P4 = "p4_bajo"


class IncidentCreate(BaseModel):
    organization_id: str
    title: str = Field(..., min_length=2, max_length=300)
    description: str = Field(..., min_length=10)
    incident_type: IncidentType = IncidentType.OTHER
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    priority: IncidentPriority = IncidentPriority.P3
    affected_assets: list[str] = []
    affected_processes: list[str] = []
    reported_by: Optional[str] = None
    reporter_email: Optional[str] = None
    detection_method: Optional[str] = ""
    tags: list[str] = []


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    incident_type: Optional[IncidentType] = None
    severity: Optional[IncidentSeverity] = None
    priority: Optional[IncidentPriority] = None
    status: Optional[IncidentStatus] = None
    assigned_to: Optional[str] = None
    affected_assets: Optional[list[str]] = None
    affected_processes: Optional[list[str]] = None
    detection_method: Optional[str] = None
    root_cause: Optional[str] = None
    containment_actions: Optional[str] = None
    eradication_actions: Optional[str] = None
    recovery_actions: Optional[str] = None
    lessons_learned: Optional[str] = None
    tags: Optional[list[str]] = None


class IncidentCommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    author: Optional[str] = None


class IncidentCommentResponse(BaseModel):
    id: str
    incident_id: str
    content: str
    author: str = ""
    created_at: datetime


class IncidentResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    description: str
    incident_type: str
    severity: str
    priority: str
    status: str = "abierto"
    assigned_to: Optional[str] = None
    affected_assets: list[str] = []
    affected_processes: list[str] = []
    reported_by: Optional[str] = None
    reporter_email: Optional[str] = None
    detection_method: str = ""
    root_cause: Optional[str] = None
    containment_actions: Optional[str] = None
    eradication_actions: Optional[str] = None
    recovery_actions: Optional[str] = None
    lessons_learned: Optional[str] = None
    resolved_at: Optional[datetime] = None
    tags: list[str] = []
    comments_count: int = 0
    created_at: datetime
    updated_at: datetime


class IncidentListResponse(BaseModel):
    incidents: list[IncidentResponse]
    total: int
    page: int
    page_size: int


class IncidentStatsResponse(BaseModel):
    total: int
    by_type: dict[str, int]
    by_severity: dict[str, int]
    by_status: dict[str, int]
    avg_resolution_hours: float
    open_count: int
