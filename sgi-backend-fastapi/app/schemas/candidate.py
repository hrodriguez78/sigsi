from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class CandidateStatus(str, Enum):
    NEW = "nuevo"
    IN_REVIEW = "en_revision"
    APPROVED = "aprobado"
    REJECTED = "rechazado"
    HIRED = "contratado"
    WITHDRAWN = "retirado"


class DocumentType(str, Enum):
    CV = "hoja_de_vida"
    CEDULA = "cedula"
    DIPLOMA = "diploma"
    CERTIFICATE = "certificado"
    MEDICAL = "certificado_medico"
    PHOTO = "foto"
    REFERENCE = "referencia"
    OTHER = "otro"


class TestType(str, Enum):
    PSYCHOMETRIC = "psicometrico"
    IQ = "coeficiente_intelectual"
    TECHNICAL = "tecnico"
    PERSONALITY = "personalidad"
    ENGLISH = "ingles"
    OTHER = "otro"


class CandidateCreate(BaseModel):
    organization_id: str
    process_id: str
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: Optional[str] = ""
    position_applied: str = Field(..., min_length=1, max_length=200)
    cover_letter: Optional[str] = ""
    source: Optional[str] = ""  # linkedin, portal, referral, etc.


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    position_applied: Optional[str] = None
    cover_letter: Optional[str] = None
    status: Optional[CandidateStatus] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    score: Optional[float] = None


class CandidateResponse(BaseModel):
    id: str
    organization_id: str
    process_id: str
    full_name: str
    email: str
    phone: str = ""
    position_applied: str
    cover_letter: str = ""
    source: str = ""
    status: str = "nuevo"
    notes: str = ""
    score: float = 0.0
    documents_count: int = 0
    tests_completed: int = 0
    created_at: datetime
    updated_at: datetime


class CandidateListResponse(BaseModel):
    candidates: list[CandidateResponse]
    total: int
    page: int
    page_size: int


class CandidateDocumentCreate(BaseModel):
    document_type: DocumentType
    file_name: str
    file_url: str = ""
    file_size: int = 0
    notes: Optional[str] = ""


class CandidateDocumentResponse(BaseModel):
    id: str
    candidate_id: str
    document_type: str
    file_name: str
    file_url: str = ""
    file_size: int = 0
    notes: str = ""
    verified: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime


class CandidateTestCreate(BaseModel):
    test_type: TestType
    test_name: str = Field(..., min_length=1, max_length=200)
    max_score: float = 100.0
    instructions: Optional[str] = ""
    duration_minutes: int = 60
    questions: list[dict] = []


class CandidateTestResponse(BaseModel):
    id: str
    candidate_id: str
    test_type: str
    test_name: str
    max_score: float = 100.0
    score: Optional[float] = None
    status: str = "pendiente"
    instructions: str = ""
    duration_minutes: int = 60
    questions: list[dict] = []
    answers: list[dict] = []
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class CandidateTestUpdate(BaseModel):
    score: Optional[float] = None
    status: Optional[str] = None
    answers: Optional[list[dict]] = None


class CandidateActivityCreate(BaseModel):
    activity_type: str  # nota, llamada, email, entrevista, documento, estado
    description: str
    performed_by: Optional[str] = ""


class CandidateActivityResponse(BaseModel):
    id: str
    candidate_id: str
    activity_type: str
    description: str
    performed_by: str = ""
    created_at: datetime


class PipelineStats(BaseModel):
    total: int = 0
    new: int = 0
    in_review: int = 0
    approved: int = 0
    rejected: int = 0
    hired: int = 0
    withdrawn: int = 0
    avg_score: float = 0.0
