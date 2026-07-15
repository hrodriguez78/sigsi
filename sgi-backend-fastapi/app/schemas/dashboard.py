from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime


class ModuleStats(BaseModel):
    count: int
    trend: Optional[int] = 0


class DashboardStats(BaseModel):
    organizations: ModuleStats
    processes: ModuleStats
    assets: ModuleStats
    documents: ModuleStats
    risks: ModuleStats
    controls: ModuleStats
    incidents: ModuleStats
    audits: ModuleStats
    courses: ModuleStats


class RiskDistribution(BaseModel):
    bajo: int = 0
    medio: int = 0
    alto: int = 0
    critico: int = 0


class ControlCompliance(BaseModel):
    total: int = 0
    implemented: int = 0
    effective: int = 0
    percentage: float = 0.0


class IncidentSummary(BaseModel):
    open: int = 0
    in_progress: int = 0
    closed: int = 0
    avg_resolution_hours: Optional[float] = None


class KPISummary(BaseModel):
    risk_distribution: RiskDistribution
    control_compliance: ControlCompliance
    incident_summary: IncidentSummary
    compliance_percentage: float = 0.0
    maturity_level: float = 0.0
    pending_actions: int = 0


class TrendPoint(BaseModel):
    month: str
    value: int


class DashboardTrends(BaseModel):
    risks: List[TrendPoint] = []
    incidents: List[TrendPoint] = []
    documents: List[TrendPoint] = []
    audits: List[TrendPoint] = []
