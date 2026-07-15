from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CourseCategory(str, Enum):
    AWARENESS = "concienciacion"
    TECHNICAL = "tecnico"
    COMPLIANCE = "cumplimiento"
    LEADERSHIP = "liderazgo"
    EMERGENCY = "emergencias"
    OTHER = "otro"


class CourseStatus(str, Enum):
    DRAFT = "borrador"
    PUBLISHED = "publicado"
    IN_PROGRESS = "en_curso"
    COMPLETED = "completado"
    ARCHIVED = "archivado"


class EnrollmentStatus(str, Enum):
    ENROLLED = "inscrito"
    IN_PROGRESS = "en_curso"
    COMPLETED = "completado"
    FAILED = "reprobado"
    CANCELLED = "cancelado"


class CourseCreate(BaseModel):
    organization_id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    code: str = Field(..., min_length=1, max_length=50)
    category: CourseCategory = CourseCategory.AWARENESS
    status: CourseStatus = CourseStatus.DRAFT
    duration_hours: float = Field(default=1.0, ge=0.5)
    instructor: str = ""
    max_participants: Optional[int] = None
    mandatory: bool = False
    validity_months: Optional[int] = None
    content_outline: str = ""
    tags: List[str] = []


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    category: Optional[CourseCategory] = None
    status: Optional[CourseStatus] = None
    duration_hours: Optional[float] = None
    instructor: Optional[str] = None
    max_participants: Optional[int] = None
    mandatory: Optional[bool] = None
    validity_months: Optional[int] = None
    content_outline: Optional[str] = None
    tags: Optional[List[str]] = None


class CourseResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    description: str
    code: str
    category: str
    status: str
    duration_hours: float
    instructor: str
    max_participants: Optional[int]
    mandatory: bool
    validity_months: Optional[int]
    content_outline: str
    tags: List[str]
    enrolled_count: int
    completed_count: int
    created_at: datetime
    updated_at: datetime


class CourseListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    courses: List[CourseResponse]


class EnrollmentCreate(BaseModel):
    user_id: str
    notes: str = ""


class EnrollmentUpdate(BaseModel):
    status: Optional[EnrollmentStatus] = None
    score: Optional[float] = None
    passed: Optional[bool] = None
    notes: Optional[str] = None
    certificate_number: Optional[str] = None


class EnrollmentResponse(BaseModel):
    id: str
    course_id: str
    user_id: str
    status: str
    enrolled_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    score: Optional[float]
    passed: Optional[bool]
    notes: str
    certificate_number: Optional[str]
    certificate_date: Optional[datetime]


class EnrollmentListResponse(BaseModel):
    total: int
    enrollments: List[EnrollmentResponse]


class TrainingStatsResponse(BaseModel):
    total_courses: int
    total_enrollments: int
    completed_enrollments: int
    by_category: dict
    by_status: dict
    completion_rate: float
    average_score: Optional[float]
