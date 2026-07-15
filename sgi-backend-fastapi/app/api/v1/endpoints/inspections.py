from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.database import get_database
from app.schemas.inspection import (
    InspectionCreate, InspectionUpdate, InspectionResponse, InspectionListResponse,
    InspectionStatsResponse,
)
from app.repositories.inspection_repo import InspectionRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/inspections", tags=["Inspecciones"])


def _insp_response(i: dict) -> InspectionResponse:
    return InspectionResponse(
        id=str(i["_id"]),
        organization_id=i["organization_id"],
        client_organization_id=i["client_organization_id"],
        work_order_id=i.get("work_order_id"),
        inspection_number=i.get("inspection_number", ""),
        inspection_type=i["inspection_type"],
        title=i["title"],
        description=i.get("description", ""),
        status=i["status"],
        result=i["result"],
        scheduled_date=str(i.get("scheduled_date", "")) if i.get("scheduled_date") else None,
        completed_date=str(i.get("completed_date", "")) if i.get("completed_date") else None,
        inspector_name=i.get("inspector_name", ""),
        inspector_id=i.get("inspector_id"),
        location=i.get("location", ""),
        checklist=i.get("checklist", []),
        findings=i.get("findings", []),
        corrective_actions=i.get("corrective_actions", []),
        score=i.get("score"),
        notes=i.get("notes", ""),
        created_at=i["created_at"],
        updated_at=i["updated_at"],
    )


@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    data: InspectionCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = InspectionRepository(db)
    insp_data = data.model_dump()
    if not insp_data.get("inspector_name"):
        insp_data["inspector_name"] = current_user.get("full_name", current_user["id"])
    insp = await repo.create(insp_data)
    return _insp_response(insp)


@router.get("", response_model=InspectionListResponse)
async def list_inspections(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    status_filter: str = Query("", alias="status"),
    inspection_type: str = Query(""),
    result: str = Query(""),
    client_org_id: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = InspectionRepository(db)
    items, total = await repo.list_by_organization(
        org_id=organization_id, page=page, page_size=page_size,
        search=search, status=status_filter, inspection_type=inspection_type,
        result=result, client_org_id=client_org_id,
    )
    return InspectionListResponse(
        inspections=[_insp_response(i) for i in items],
        total=total, page=page, page_size=page_size,
    )


@router.get("/stats", response_model=InspectionStatsResponse)
async def get_inspection_stats(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = InspectionRepository(db)
    stats = await repo.get_stats(organization_id)
    return InspectionStatsResponse(**stats)


@router.get("/{insp_id}", response_model=InspectionResponse)
async def get_inspection(
    insp_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = InspectionRepository(db)
    insp = await repo.get_by_id(insp_id)
    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    return _insp_response(insp)


@router.put("/{insp_id}", response_model=InspectionResponse)
async def update_inspection(
    insp_id: str,
    data: InspectionUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = InspectionRepository(db)
    insp = await repo.get_by_id(insp_id)
    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")
    updated = await repo.update(insp_id, update_data)
    return _insp_response(updated)


@router.delete("/{insp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inspection(
    insp_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = InspectionRepository(db)
    insp = await repo.get_by_id(insp_id)
    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada")
    await repo.delete(insp_id)
