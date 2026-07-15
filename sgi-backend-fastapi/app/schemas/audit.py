from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class AuditType(str, Enum):
    INTERNAL = "interna"
    EXTERNAL = "externa"
    SUPPLIER = "proveedor"
    SELF_ASSESSMENT = "autoevaluacion"


class AuditStatus(str, Enum):
    PLANNED = "planificada"
    IN_PROGRESS = "en_curso"
    COMPLETED = "completada"
    REPORTED = "reporte_cerrado"


class FindingType(str, Enum):
    NON_CONFORMITY = "no_conformidad"
    OBSERVATION = "observacion"
    OPPORTUNITY = "oportunidad_mejora"
    GOOD_PRACTICE = "buena_practica"


class FindingSeverity(str, Enum):
    MINOR = "menor"
    MAJOR = "mayor"
    CRITICAL = "critico"


class CorrectiveActionStatus(str, Enum):
    OPEN = "abierta"
    IN_PROGRESS = "en_progreso"
    COMPLETED = "completada"
    VERIFIED = "verificada"
    CLOSED = "cerrada"


class AuditCreate(BaseModel):
    organization_id: str
    title: str = Field(..., min_length=2, max_length=300)
    audit_type: AuditType = AuditType.INTERNAL
    scope: str = Field("", max_length=1000)
    criteria: Optional[str] = "ISO 27001:2022"
    planned_date: Optional[str] = None
    auditor_name: Optional[str] = None
    auditor_email: Optional[str] = None
    team_members: list[str] = []
    processes_to_audit: list[str] = []
    notes: Optional[str] = ""


class AuditUpdate(BaseModel):
    title: Optional[str] = None
    scope: Optional[str] = None
    criteria: Optional[str] = None
    planned_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[AuditStatus] = None
    auditor_name: Optional[str] = None
    auditor_email: Optional[str] = None
    team_members: Optional[list[str]] = None
    summary: Optional[str] = None
    notes: Optional[str] = None


class FindingCreate(BaseModel):
    audit_id: str
    title: str = Field(..., min_length=2, max_length=300)
    description: str = Field(..., min_length=10)
    finding_type: FindingType = FindingType.NON_CONFORMITY
    severity: FindingSeverity = FindingSeverity.MINOR
    clause_reference: Optional[str] = None
    evidence: Optional[str] = ""
    affected_process: Optional[str] = None
    affected_asset: Optional[str] = None


class FindingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    finding_type: Optional[FindingType] = None
    severity: Optional[FindingSeverity] = None
    clause_reference: Optional[str] = None
    evidence: Optional[str] = None
    status: Optional[str] = None


class CorrectiveActionCreate(BaseModel):
    finding_id: str
    description: str = Field(..., min_length=10)
    responsible_id: Optional[str] = None
    deadline: Optional[str] = None


class CorrectiveActionUpdate(BaseModel):
    description: Optional[str] = None
    responsible_id: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[CorrectiveActionStatus] = None
    evidence: Optional[str] = None
    verification_date: Optional[str] = None
    verified_by: Optional[str] = None


class ChecklistItemCreate(BaseModel):
    audit_id: str
    control_id: Optional[str] = None
    question: str = Field(..., min_length=5)
    expected_evidence: Optional[str] = ""


class ChecklistItemResponse(BaseModel):
    id: str
    audit_id: str
    control_id: Optional[str] = None
    question: str
    expected_evidence: str = ""
    response: Optional[str] = None
    compliant: Optional[bool] = None
    auditor_notes: Optional[str] = None


class FindingResponse(BaseModel):
    id: str
    audit_id: str
    title: str
    description: str
    finding_type: str
    severity: str
    clause_reference: Optional[str] = None
    evidence: str = ""
    affected_process: Optional[str] = None
    affected_asset: Optional[str] = None
    status: str = "abierta"
    corrective_actions_count: int = 0
    created_at: datetime
    updated_at: datetime


class CorrectiveActionResponse(BaseModel):
    id: str
    finding_id: str
    description: str
    responsible_id: Optional[str] = None
    deadline: Optional[str] = None
    status: str = "abierta"
    evidence: Optional[str] = None
    verification_date: Optional[str] = None
    verified_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AuditResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    audit_type: str
    scope: str = ""
    criteria: str = ""
    planned_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str = "planificada"
    auditor_name: Optional[str] = None
    auditor_email: Optional[str] = None
    team_members: list[str] = []
    processes_to_audit: list[str] = []
    summary: Optional[str] = None
    notes: str = ""
    findings_count: int = 0
    non_conformities_count: int = 0
    created_at: datetime
    updated_at: datetime


class AuditListResponse(BaseModel):
    audits: list[AuditResponse]
    total: int
    page: int
    page_size: int


class AuditStatsResponse(BaseModel):
    total: int
    by_type: dict[str, int]
    by_status: dict[str, int]
    findings_summary: dict[str, int]
