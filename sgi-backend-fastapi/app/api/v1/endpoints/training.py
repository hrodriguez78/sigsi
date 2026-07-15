from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.training import (
    CourseCreate, CourseUpdate, CourseResponse, CourseListResponse, TrainingStatsResponse,
    EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse, EnrollmentListResponse,
)
from app.repositories.training_repo import TrainingRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/training", tags=["Capacitación"])


def _course_response(c: dict) -> CourseResponse:
    return CourseResponse(
        id=str(c["_id"]),
        organization_id=c["organization_id"],
        title=c["title"],
        description=c.get("description", ""),
        code=c["code"],
        category=c.get("category", "concienciacion"),
        status=c.get("status", "borrador"),
        duration_hours=c.get("duration_hours", 1.0),
        instructor=c.get("instructor", ""),
        max_participants=c.get("max_participants"),
        mandatory=c.get("mandatory", False),
        validity_months=c.get("validity_months"),
        content_outline=c.get("content_outline", ""),
        tags=c.get("tags", []),
        enrolled_count=c.get("enrolled_count", 0),
        completed_count=c.get("completed_count", 0),
        created_at=c["created_at"],
        updated_at=c["updated_at"],
    )


def _enrollment_response(e: dict) -> EnrollmentResponse:
    return EnrollmentResponse(
        id=str(e["_id"]),
        course_id=e["course_id"],
        user_id=e["user_id"],
        status=e.get("status", "inscrito"),
        enrolled_at=e["enrolled_at"],
        started_at=e.get("started_at"),
        completed_at=e.get("completed_at"),
        score=e.get("score"),
        passed=e.get("passed"),
        notes=e.get("notes", ""),
        certificate_number=e.get("certificate_number"),
        certificate_date=e.get("certificate_date"),
    )


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course: CourseCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    data = course.model_dump()
    result = await repo.create_course(data)
    return _course_response(result)


@router.get("", response_model=CourseListResponse)
async def list_courses(
    organization_id: str = Query(...),
    category: str = Query(None),
    course_status: str = Query(None, alias="status"),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    result = await repo.list_courses(
        organization_id, category, course_status, search, page, page_size
    )
    courses = [_course_response(c) for c in result["courses"]]
    return CourseListResponse(
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"],
        courses=courses,
    )


@router.get("/stats", response_model=TrainingStatsResponse)
async def get_training_stats(
    organization_id: str = Query(...),
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    return await repo.get_course_stats(organization_id)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    course = await repo.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return _course_response(course)


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course: CourseUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    existing = await repo.get_course(course_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    update_data = course.model_dump(exclude_unset=True)
    if update_data.get("category"):
        update_data["category"] = update_data["category"].value
    if update_data.get("status"):
        update_data["status"] = update_data["status"].value
    result = await repo.update_course(course_id, update_data)
    return _course_response(result)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    deleted = await repo.delete_course(course_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Curso no encontrado")


@router.post("/{course_id}/enroll", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def enroll_user(
    course_id: str,
    enrollment: EnrollmentCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    course = await repo.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    data = enrollment.model_dump()
    result = await repo.enroll_user(course_id, data)
    return _enrollment_response(result)


@router.get("/{course_id}/enrollments", response_model=EnrollmentListResponse)
async def list_enrollments(
    course_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    enrollments = await repo.get_enrollments(course_id)
    return EnrollmentListResponse(
        total=len(enrollments),
        enrollments=[_enrollment_response(e) for e in enrollments],
    )


@router.put("/enrollments/{enrollment_id}", response_model=EnrollmentResponse)
async def update_enrollment(
    enrollment_id: str,
    enrollment: EnrollmentUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    repo = TrainingRepository(db)
    update_data = enrollment.model_dump(exclude_unset=True)
    if update_data.get("status"):
        update_data["status"] = update_data["status"].value
    result = await repo.update_enrollment(enrollment_id, update_data)
    if not result:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    return _enrollment_response(result)
