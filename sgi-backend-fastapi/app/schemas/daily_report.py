from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


class ReportType(str, Enum):
    DAILY_LOG = "bitacora_diaria"
    SERVICE_REPORT = "reporte_servicio"
    MAINTENANCE_REPORT = "reporte_mantenimiento"
    INCIDENT_REPORT = "reporte_incidente"
    QUALITY_REPORT = "reporte_calidad"
    OTHER = "otro"


class DailyReportStatus(str, Enum):
    DRAFT = "borrador"
    SUBMITTED = "enviado"
    REVIEWED = "revisado"
    APPROVED = "aprobado"
    REJECTED = "rechazado"


class DailyReportCreate(BaseModel):
    organization_id: str
    client_organization_id: str
    work_order_id: Optional[str] = None
    report_type: ReportType = ReportType.DAILY_LOG
    report_date: date
    reported_by: str = ""
    title: str = Field(..., min_length=3, max_length=200)
    description: str = ""
    activities_performed: list[str] = []
    hours_worked: float = Field(0.0, ge=0)
    materials_used: list[dict] = []
    issues_found: list[str] = []
    recommendations: str = ""
    photos_urls: list[str] = []


class DailyReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DailyReportStatus] = None
    activities_performed: Optional[list[str]] = None
    hours_worked: Optional[float] = None
    materials_used: Optional[list[dict]] = None
    issues_found: Optional[list[str]] = None
    recommendations: Optional[str] = None
    reviewer_comments: Optional[str] = None
    photos_urls: Optional[list[str]] = None


class DailyReportResponse(BaseModel):
    id: str
    organization_id: str
    client_organization_id: str
    work_order_id: Optional[str] = None
    report_type: str
    report_date: str
    reported_by: str
    title: str
    description: str
    activities_performed: list[str]
    hours_worked: float
    materials_used: list[dict]
    issues_found: list[str]
    recommendations: str
    photos_urls: list[str]
    status: str
    reviewer_comments: str = ""
    reviewed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DailyReportListResponse(BaseModel):
    reports: list[DailyReportResponse]
    total: int
    page: int
    page_size: int


class DailyReportStatsResponse(BaseModel):
    total: int = 0
    draft: int = 0
    submitted: int = 0
    reviewed: int = 0
    approved: int = 0
    rejected: int = 0
    total_hours: float = 0.0
    avg_hours_per_report: float = 0.0
