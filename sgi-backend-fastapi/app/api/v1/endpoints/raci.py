from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.raci import (
    RaciMatrixCreate,
    RaciMatrixUpdate,
    RaciMatrixResponse,
    RaciMatrixListResponse,
)
from app.repositories.raci_repo import RaciRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/raci", tags=["Matriz RACI"])


def _raci_response(m: dict) -> RaciMatrixResponse:
    return RaciMatrixResponse(
        id=str(m["_id"]),
        organization_id=m["organization_id"],
        name=m["name"],
        description=m.get("description", ""),
        process_ids=m.get("process_ids", []),
        role_names=m.get("role_names", []),
        assignments=m.get("assignments", {}),
        created_at=m["created_at"],
        updated_at=m["updated_at"],
    )


@router.post("", response_model=RaciMatrixResponse, status_code=status.HTTP_201_CREATED)
async def create_raci_matrix(
    data: RaciMatrixCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RaciRepository(db)

    assignments = data.assignments or {}
    for pid in data.process_ids:
        if pid not in assignments:
            assignments[pid] = {}

    matrix = await repo.create(data.model_dump())
    return _raci_response(matrix)


@router.get("", response_model=RaciMatrixListResponse)
async def list_raci_matrices(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RaciRepository(db)
    matrices, total = await repo.list_by_organization(
        org_id=organization_id,
        page=page,
        page_size=page_size,
        search=search,
    )
    return RaciMatrixListResponse(
        matrices=[_raci_response(m) for m in matrices],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{matrix_id}", response_model=RaciMatrixResponse)
async def get_raci_matrix(
    matrix_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RaciRepository(db)
    matrix = await repo.get_by_id(matrix_id)
    if matrix is None:
        raise HTTPException(status_code=404, detail="Matriz RACI no encontrada")
    return _raci_response(matrix)


@router.put("/{matrix_id}", response_model=RaciMatrixResponse)
async def update_raci_matrix(
    matrix_id: str,
    data: RaciMatrixUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RaciRepository(db)
    matrix = await repo.get_by_id(matrix_id)
    if matrix is None:
        raise HTTPException(status_code=404, detail="Matriz RACI no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=400, detail="No se enviaron campos para actualizar"
        )

    updated = await repo.update(matrix_id, update_data)
    return _raci_response(updated)


@router.delete("/{matrix_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_raci_matrix(
    matrix_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RaciRepository(db)
    matrix = await repo.get_by_id(matrix_id)
    if matrix is None:
        raise HTTPException(status_code=404, detail="Matriz RACI no encontrada")

    await repo.delete(matrix_id)
