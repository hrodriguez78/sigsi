from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class WidgetConfig(BaseModel):
    id: str = Field(..., description="Widget unique ID")
    type: str = Field(..., description="Widget type: stat_card, risk_chart, trend_chart, compliance_chart, compliance_gauge, recent_activity, incident_summary, kpi_card")
    title: str = Field(..., description="Widget display title")
    icon: Optional[str] = Field(None, description="Material icon name")
    color: Optional[str] = Field(None, description="Accent color")
    size: str = Field("medium", description="Widget size: small, medium, large")
    enabled: bool = Field(True, description="Whether widget is visible")
    order: int = Field(0, description="Display order")
    config: Optional[dict] = Field(None, description="Widget-specific configuration")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class WidgetLayout(BaseModel):
    id: Optional[str] = None
    user_id: str
    organization_id: Optional[str] = None
    widgets: List[WidgetConfig] = []
    columns: int = Field(4, description="Grid columns: 2, 3, or 4")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class WidgetLayoutResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    organization_id: Optional[str] = None
    widgets: List[WidgetConfig] = []
    columns: int = 4


class WidgetLayoutUpdate(BaseModel):
    widgets: Optional[List[WidgetConfig]] = None
    columns: Optional[int] = None


DEFAULT_WIDGETS = [
    {
        "id": "stat-processes",
        "type": "stat_card",
        "title": "Procesos",
        "icon": "account_tree",
        "color": "#3B82F6",
        "size": "small",
        "enabled": True,
        "order": 0,
        "config": {"entity": "processes"}
    },
    {
        "id": "stat-assets",
        "type": "stat_card",
        "title": "Activos",
        "icon": "inventory_2",
        "color": "#8B5CF6",
        "size": "small",
        "enabled": True,
        "order": 1,
        "config": {"entity": "assets"}
    },
    {
        "id": "stat-documents",
        "type": "stat_card",
        "title": "Documentos",
        "icon": "description",
        "color": "#06B6D4",
        "size": "small",
        "enabled": True,
        "order": 2,
        "config": {"entity": "documents"}
    },
    {
        "id": "stat-risks",
        "type": "stat_card",
        "title": "Riesgos",
        "icon": "gpp_maybe",
        "color": "#EF4444",
        "size": "small",
        "enabled": True,
        "order": 3,
        "config": {"entity": "risks"}
    },
    {
        "id": "stat-controls",
        "type": "stat_card",
        "title": "Controles",
        "icon": "security",
        "color": "#10B981",
        "size": "small",
        "enabled": True,
        "order": 4,
        "config": {"entity": "controls"}
    },
    {
        "id": "stat-incidents",
        "type": "stat_card",
        "title": "Incidentes",
        "icon": "warning",
        "color": "#F59E0B",
        "size": "small",
        "enabled": True,
        "order": 5,
        "config": {"entity": "incidents"}
    },
    {
        "id": "stat-audits",
        "type": "stat_card",
        "title": "Auditorías",
        "icon": "fact_check",
        "color": "#EC4899",
        "size": "small",
        "enabled": True,
        "order": 6,
        "config": {"entity": "audits"}
    },
    {
        "id": "stat-training",
        "type": "stat_card",
        "title": "Cursos",
        "icon": "school",
        "color": "#14B8A6",
        "size": "small",
        "enabled": True,
        "order": 7,
        "config": {"entity": "courses"}
    },
    {
        "id": "kpi-compliance",
        "type": "kpi_card",
        "title": "Cumplimiento ISO",
        "icon": "verified",
        "color": "#3B82F6",
        "size": "medium",
        "enabled": True,
        "order": 8,
        "config": {"metric": "compliance_pct"}
    },
    {
        "id": "kpi-maturity",
        "type": "kpi_card",
        "title": "Nivel Madurez",
        "icon": "trending_up",
        "color": "#8B5CF6",
        "size": "medium",
        "enabled": True,
        "order": 9,
        "config": {"metric": "maturity_level"}
    },
    {
        "id": "kpi-pending",
        "type": "kpi_card",
        "title": "Acciones Pendientes",
        "icon": "pending_actions",
        "color": "#F59E0B",
        "size": "medium",
        "enabled": True,
        "order": 10,
        "config": {"metric": "pending_actions"}
    },
    {
        "id": "kpi-incidents-open",
        "type": "kpi_card",
        "title": "Incidentes Abiertos",
        "icon": "error",
        "color": "#EF4444",
        "size": "medium",
        "enabled": True,
        "order": 11,
        "config": {"metric": "open_incidents"}
    },
    {
        "id": "chart-risk",
        "type": "risk_chart",
        "title": "Distribución de Riesgos",
        "icon": "pie_chart",
        "color": "#EF4444",
        "size": "medium",
        "enabled": True,
        "order": 12,
        "config": {"chartType": "doughnut"}
    },
    {
        "id": "chart-trends",
        "type": "trend_chart",
        "title": "Tendencias (6 meses)",
        "icon": "show_chart",
        "color": "#3B82F6",
        "size": "large",
        "enabled": True,
        "order": 13,
        "config": {"datasets": ["risks", "incidents", "documents"]}
    },
    {
        "id": "chart-compliance",
        "type": "compliance_chart",
        "title": "Cumplimiento de Controles",
        "icon": "bar_chart",
        "color": "#10B981",
        "size": "medium",
        "enabled": True,
        "order": 14,
        "config": {"chartType": "bar"}
    },
    {
        "id": "incident-summary",
        "type": "incident_summary",
        "title": "Resumen Incidentes",
        "icon": "assessment",
        "color": "#F59E0B",
        "size": "large",
        "enabled": True,
        "order": 15,
        "config": {}
    },
]
