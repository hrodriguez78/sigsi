from pydantic import BaseModel, Field
from typing import Optional, List


class OrgPosition(BaseModel):
    id: Optional[str] = None
    organization_id: str
    name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    holder_name: Optional[str] = None
    holder_email: Optional[str] = None
    level: int = Field(0, description="Hierarchy level (0 = top)")
    order: int = Field(0, description="Sibling order")
    department: Optional[str] = None
    responsibilities: Optional[List[str]] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class OrgPositionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    holder_name: Optional[str] = None
    holder_email: Optional[str] = None
    department: Optional[str] = None
    responsibilities: Optional[List[str]] = Field(default_factory=list)


class OrgPositionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None
    holder_name: Optional[str] = None
    holder_email: Optional[str] = None
    department: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    order: Optional[int] = None


class OrgPositionResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    holder_name: Optional[str] = None
    holder_email: Optional[str] = None
    level: int = 0
    order: int = 0
    department: Optional[str] = None
    responsibilities: List[str] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class OrgTreeNode(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    holder_name: Optional[str] = None
    holder_email: Optional[str] = None
    department: Optional[str] = None
    responsibilities: List[str] = Field(default_factory=list)
    level: int = 0
    children: List['OrgTreeNode'] = Field(default_factory=list)


class OrgChartResponse(BaseModel):
    organization_id: str
    tree: Optional[OrgTreeNode] = None
    positions: List[OrgPositionResponse] = []
