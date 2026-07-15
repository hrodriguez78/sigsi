from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class RACILevel(str, Enum):
    RESPONSIBLE = "R"
    ACCOUNTABLE = "A"
    CONSULTED = "C"
    INFORMED = "I"


class RaciMatrixCreate(BaseModel):
    organization_id: str
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = ""
    process_ids: list[str] = []
    role_names: list[str] = Field(..., min_length=1, description="Lista de roles/posiciones")
    assignments: dict[str, dict[str, str]] = Field(
        default_factory=dict,
        description="Mapa de {process_id: {role_name: 'R'|'A'|'C'|'I'}}",
    )


class RaciMatrixUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    process_ids: Optional[list[str]] = None
    role_names: Optional[list[str]] = None
    assignments: Optional[dict[str, dict[str, str]]] = None


class RaciMatrixResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    description: str = ""
    process_ids: list[str] = []
    role_names: list[str] = []
    assignments: dict[str, dict[str, str]] = {}
    created_at: datetime
    updated_at: datetime


class RaciMatrixListResponse(BaseModel):
    matrices: list[RaciMatrixResponse]
    total: int
    page: int
    page_size: int
