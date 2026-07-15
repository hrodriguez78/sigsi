from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse,
    IncidentListResponse,
    IncidentStatsResponse,
    IncidentCommentCreate,
    IncidentCommentResponse,
)
from app.repositories.incident_repo import IncidentRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incidentes"])


def _incident_response(inc: dict, comments_count: int = 0) -> IncidentResponse:
    return IncidentResponse(
        id=str(inc["_id"]),
        organization_id=inc["organization_id"],
        title=inc["title"],
        description=inc["description"],
        incident_type=inc.get("incident_type", "otro"),
        severity=inc.get("severity", "medio"),
        priority=inc.get("priority", "p3_medio"),
        status=inc.get("status", "abierto"),
        assigned_to=inc.get("assigned_to"),
        affected_assets=inc.get("affected_assets", []),
        affected_processes=inc.get("affected_processes", []),
        reported_by=inc.get("reported_by"),
        reporter_email=inc.get("reporter_email"),
        detection_method=inc.get("detection_method", ""),
        root_cause=inc.get("root_cause"),
        containment_actions=inc.get("containment_actions"),
        eradication_actions=inc.get("eradication_actions"),
        recovery_actions=inc.get("recovery_actions"),
        lessons_learned=inc.get("lessons_learned"),
        resolved_at=inc.get("resolved_at"),
        tags=inc.get("tags", []),
        comments_count=comments_count,
        created_at=inc["created_at"],
        updated_at=inc["updated_at"],
    )


def _comment_response(c: dict) -> IncidentCommentResponse:
    return IncidentCommentResponse(
        id=str(c["_id"]),
        incident_id=c["incident_id"],
        content=c["content"],
        author=c.get("author", ""),
        created_at=c["created_at"],
    )


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    data: IncidentCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = IncidentRepository(db)

    inc_data = data.model_dump()
    inc_data["reported_by"] = current_user.get("email", "")
    incident = await repo.create(inc_data)
    return _incident_response(incident)


@router.get("", response_model=IncidentListResponse)
async def list_incidents(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    incident_type: str = Query(""),
    severity: str = Query(""),
    status_filter: str = Query("", alias="status"),
    priority: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = IncidentRepository(db)
    incidents, total = await repo.list_by_organization(
        org_id=organization_id,
        page=page,
        page_size=page_size,
        search=search,
        incident_type=incident_type,
        severity=severity,
        status=status_filter,
        priority=priority,
    )
    return IncidentListResponse(
        incidents=[_incident_response(i) for i in incidents],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=IncidentStatsResponse)
async def get_incident_stats(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = IncidentRepository(db)
    stats = await repo.get_stats(organization_id)
    return IncidentStatsResponse(**stats)


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = IncidentRepository(db)
    inc = await repo.get_by_id(incident_id)
    if inc is None:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    comments = await repo.get_comments(incident_id)
    return _incident_response(inc, comments_count=len(comments))


@router.put("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    data: IncidentUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = IncidentRepository(db)
    inc = await repo.get_by_id(incident_id)
    if inc is None:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos")

    updated = await repo.update(incident_id, update_data)
    return _incident_response(updated)


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = IncidentRepository(db)
    inc = await repo.get_by_id(incident_id)
    if inc is None:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")
    await repo.delete(incident_id)


@router.post("/{incident_id}/comments", response_model=IncidentCommentResponse, status_code=201)
async def add_comment(
    incident_id: str,
    data: IncidentCommentCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = IncidentRepository(db)
    inc = await repo.get_by_id(incident_id)
    if inc is None:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    comment_data = data.model_dump()
    comment_data["incident_id"] = incident_id
    comment_data["author"] = current_user.get("email", "")
    comment = await repo.add_comment(comment_data)
    return _comment_response(comment)


@router.get("/{incident_id}/comments", response_model=list[IncidentCommentResponse])
async def list_comments(
    incident_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = IncidentRepository(db)
    comments = await repo.get_comments(incident_id)
    return [_comment_response(c) for c in comments]
