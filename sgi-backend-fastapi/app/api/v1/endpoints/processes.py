from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.process import (
    ProcessCreate,
    ProcessUpdate,
    ProcessResponse,
    ProcessListResponse,
)
from app.repositories.process_repo import ProcessRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/processes", tags=["Procesos"])


def _serialize_tree(proc: dict) -> dict:
    return {
        "id": str(proc["_id"]),
        "organization_id": proc["organization_id"],
        "name": proc["name"],
        "code": proc["code"],
        "description": proc.get("description", ""),
        "process_type": proc.get("process_type", "operativo"),
        "parent_id": proc.get("parent_id"),
        "owner_id": proc.get("owner_id"),
        "objective": proc.get("objective", ""),
        "scope": proc.get("scope", ""),
        "status": proc.get("status", "borrador"),
        "risk_level": proc.get("risk_level", "bajo"),
        "tags": proc.get("tags", []),
        "created_at": proc["created_at"].isoformat() if proc.get("created_at") else "",
        "updated_at": proc["updated_at"].isoformat() if proc.get("updated_at") else "",
        "children": [_serialize_tree(c) for c in proc.get("children", [])],
    }


def _process_response(proc: dict) -> ProcessResponse:
    return ProcessResponse(
        id=str(proc["_id"]),
        organization_id=proc["organization_id"],
        name=proc["name"],
        code=proc["code"],
        description=proc.get("description", ""),
        process_type=proc.get("process_type", "operativo"),
        parent_id=proc.get("parent_id"),
        owner_id=proc.get("owner_id"),
        objective=proc.get("objective", ""),
        scope=proc.get("scope", ""),
        status=proc.get("status", "borrador"),
        risk_level=proc.get("risk_level", "bajo"),
        tags=proc.get("tags", []),
        created_at=proc["created_at"],
        updated_at=proc["updated_at"],
    )


@router.post("", response_model=ProcessResponse, status_code=status.HTTP_201_CREATED)
async def create_process(
    data: ProcessCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ProcessRepository(db)

    existing = await repo.get_by_code(data.organization_id, data.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un proceso con código '{data.code}' en esta organización",
        )

    if data.parent_id:
        parent = await repo.get_by_id(data.parent_id)
        if parent is None:
            raise HTTPException(status_code=404, detail="Proceso padre no encontrado")
        if parent["organization_id"] != data.organization_id:
            raise HTTPException(
                status_code=400,
                detail="El proceso padre pertenece a otra organización",
            )

    process = await repo.create(data.model_dump())
    return _process_response(process)


@router.get("", response_model=ProcessListResponse)
async def list_processes(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    process_type: str = Query(""),
    status_filter: str = Query("", alias="status"),
    parent_id: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ProcessRepository(db)
    processes, total = await repo.list_by_organization(
        org_id=organization_id,
        page=page,
        page_size=page_size,
        search=search,
        process_type=process_type,
        status=status_filter,
        parent_id=parent_id,
    )
    return ProcessListResponse(
        processes=[_process_response(p) for p in processes],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/tree")
async def get_process_tree(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ProcessRepository(db)
    tree = await repo.get_tree(organization_id)
    return {"tree": [_serialize_tree(p) for p in tree]}


@router.get("/{process_id}", response_model=ProcessResponse)
async def get_process(
    process_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ProcessRepository(db)
    process = await repo.get_by_id(process_id)
    if process is None:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    return _process_response(process)


@router.get("/{process_id}/children")
async def get_process_children(
    process_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ProcessRepository(db)
    process = await repo.get_by_id(process_id)
    if process is None:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    children = await repo.get_children(process_id)
    return {"children": [_process_response(c) for c in children]}


@router.put("/{process_id}", response_model=ProcessResponse)
async def update_process(
    process_id: str,
    data: ProcessUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ProcessRepository(db)
    process = await repo.get_by_id(process_id)
    if process is None:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=400, detail="No se enviaron campos para actualizar"
        )

    if "code" in update_data:
        existing = await repo.get_by_code(process["organization_id"], update_data["code"])
        if existing and str(existing["_id"]) != process_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un proceso con código '{update_data['code']}'",
            )

    if "parent_id" in update_data and update_data["parent_id"]:
        if update_data["parent_id"] == process_id:
            raise HTTPException(
                status_code=400, detail="Un proceso no puede ser su propio padre"
            )
        parent = await repo.get_by_id(update_data["parent_id"])
        if parent is None:
            raise HTTPException(status_code=404, detail="Proceso padre no encontrado")

    updated = await repo.update(process_id, update_data)
    return _process_response(updated)


@router.delete("/{process_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_process(
    process_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ProcessRepository(db)
    process = await repo.get_by_id(process_id)
    if process is None:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")

    children = await repo.get_children(process_id)
    if children:
        raise HTTPException(
            status_code=400,
            detail=f"El proceso tiene {len(children)} sub-procesos. Elimínelos primero.",
        )

    await repo.delete(process_id)
