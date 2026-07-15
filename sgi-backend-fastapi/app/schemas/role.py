from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


PERMISSIONS = [
    "organizations.read", "organizations.write", "organizations.delete",
    "processes.read", "processes.write", "processes.delete",
    "assets.read", "assets.write", "assets.delete",
    "documents.read", "documents.write", "documents.delete", "documents.approve",
    "risks.read", "risks.write", "risks.delete",
    "controls.read", "controls.write", "controls.delete",
    "incidents.read", "incidents.write", "incidents.delete",
    "audits.read", "audits.write", "audits.delete",
    "training.read", "training.write", "training.delete",
    "dashboard.read",
    "users.read", "users.write", "users.delete",
    "roles.read", "roles.write", "roles.delete",
    "ai.read", "ai.write",
    "work_orders.read", "work_orders.write", "work_orders.delete",
    "daily_reports.read", "daily_reports.write", "daily_reports.delete", "daily_reports.approve",
    "inspections.read", "inspections.write", "inspections.delete",
]


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-z_]+$")
    description: str = Field(..., min_length=2, max_length=200)
    permissions: List[str] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    description: Optional[str] = None
    permissions: Optional[List[str]] = None


class RoleResponse(BaseModel):
    id: str
    name: str
    description: str
    permissions: List[str]
    created_at: datetime
    updated_at: datetime


class UserRoleAssign(BaseModel):
    role_names: List[str]


class UserRoleResponse(BaseModel):
    user_id: str
    roles: List[str]
