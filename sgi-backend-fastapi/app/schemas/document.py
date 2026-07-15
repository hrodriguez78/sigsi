from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    POLICY = "politica"
    PROCEDURE = "procedimiento"
    GUIDELINE = "lineamiento"
    MANUAL = "manual"
    FORM = "formato"
    RECORD = "registro"
    PLAN = "plan"
    REPORT = "reporte"
    OTHER = "otro"


class DocumentStatus(str, Enum):
    DRAFT = "borrador"
    UNDER_REVIEW = "en_revision"
    APPROVED = "aprobado"
    PUBLISHED = "publicado"
    ARCHIVED = "archivado"
    OBSOLETE = "obsoleto"


class ApprovalStatus(str, Enum):
    PENDING = "pendiente"
    APPROVED = "aprobado"
    REJECTED = "rechazado"


class DocumentCreate(BaseModel):
    organization_id: str
    title: str = Field(..., min_length=2, max_length=300)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = ""
    document_type: DocumentType = DocumentType.OTHER
    process_id: Optional[str] = None
    content: Optional[str] = ""
    tags: list[str] = []


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    document_type: Optional[DocumentType] = None
    process_id: Optional[str] = None
    content: Optional[str] = None
    status: Optional[DocumentStatus] = None
    tags: Optional[list[str]] = None


class DocumentVersionCreate(BaseModel):
    content: str = Field(..., min_length=1)
    change_notes: str = Field("", max_length=500)
    created_by: Optional[str] = None


class DocumentVersionResponse(BaseModel):
    version: int
    content: str
    change_notes: str = ""
    created_by: Optional[str] = None
    created_at: datetime


class DocumentApprovalCreate(BaseModel):
    reviewer_id: str
    comments: Optional[str] = ""


class DocumentApprovalResponse(BaseModel):
    reviewer_id: str
    status: str
    comments: str = ""
    reviewed_at: datetime


class DocumentResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    code: str
    description: str = ""
    document_type: str
    process_id: Optional[str] = None
    current_version: int = 1
    status: str = "borrador"
    tags: list[str] = []
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None


class DocumentDetailResponse(DocumentResponse):
    content: str = ""
    versions: list[DocumentVersionResponse] = []
    approvals: list[DocumentApprovalResponse] = []


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
    page: int
    page_size: int
