from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class WorkOrderType(str, Enum):
    MAINTENANCE_PREVENTIVE = "mantenimiento_preventivo"
    MAINTENANCE_CORRECTIVE = "mantenimiento_correctivo"
    CLEANING_INTERIOR = "aseo_interior"
    CLEANING_EXTERIOR = "aseo_exterior"
    CLEANING_INDUSTRIAL = "aseo_industrial"
    EMERGENCY = "emergencia"
    INSTALLATION = "instalacion"
    OTHER = "otro"


class WorkOrderPriority(str, Enum):
    CRITICAL = "critica"
    HIGH = "alta"
    MEDIUM = "media"
    LOW = "baja"


class WorkOrderStatus(str, Enum):
    PENDING = "pendiente"
    SCHEDULED = "programada"
    IN_PROGRESS = "en_progreso"
    ON_HOLD = "en_espera"
    COMPLETED = "completada"
    CANCELLED = "cancelada"
    VERIFIED = "verificada"


class WorkOrderCreate(BaseModel):
    organization_id: str
    client_organization_id: str
    process_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=200)
    description: str = ""
    order_type: WorkOrderType
    priority: WorkOrderPriority = WorkOrderPriority.MEDIUM
    assigned_to: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    location: str = ""
    assets_involved: list[str] = []
    notes: str = ""


class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_type: Optional[WorkOrderType] = None
    priority: Optional[WorkOrderPriority] = None
    status: Optional[WorkOrderStatus] = None
    assigned_to: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    location: Optional[str] = None
    assets_involved: Optional[list[str]] = None
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None


class WorkOrderCommentCreate(BaseModel):
    text: str = Field(..., min_length=1)
    author: str = ""


class WorkOrderCommentResponse(BaseModel):
    id: str
    work_order_id: str
    text: str
    author: str
    created_at: datetime


class WorkOrderResponse(BaseModel):
    id: str
    organization_id: str
    client_organization_id: str
    process_id: Optional[str] = None
    order_number: str
    title: str
    description: str
    order_type: str
    priority: str
    status: str
    assigned_to: Optional[str] = None
    assigned_to_name: str = ""
    scheduled_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    location: str
    assets_involved: list[str] = []
    notes: str
    resolution_notes: str = ""
    comments_count: int = 0
    created_at: datetime
    updated_at: datetime


class WorkOrderListResponse(BaseModel):
    work_orders: list[WorkOrderResponse]
    total: int
    page: int
    page_size: int


class WorkOrderStatsResponse(BaseModel):
    total: int = 0
    pending: int = 0
    scheduled: int = 0
    in_progress: int = 0
    on_hold: int = 0
    completed: int = 0
    cancelled: int = 0
    verified: int = 0
    avg_completion_hours: float = 0.0
    overdue: int = 0
