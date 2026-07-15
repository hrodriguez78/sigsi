from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.core.database import get_database
from app.api.v1.endpoints.auth import get_current_user
from app.repositories.orgchart_repo import OrgChartRepository
from app.schemas.orgchart import (
    OrgPositionCreate, OrgPositionUpdate, OrgPositionResponse, OrgChartResponse
)

router = APIRouter(prefix="/orgchart", tags=["Org Chart"])


async def get_repo() -> OrgChartRepository:
    db = await get_database()
    return OrgChartRepository(db)


@router.get("/positions", response_model=list[OrgPositionResponse])
async def list_positions(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    repo: OrgChartRepository = Depends(get_repo),
):
    return await repo.list_positions(organization_id)


@router.get("/tree", response_model=OrgChartResponse)
async def get_tree(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    repo: OrgChartRepository = Depends(get_repo),
):
    tree = await repo.build_tree(organization_id)
    positions = await repo.list_positions(organization_id)
    return OrgChartResponse(
        organization_id=organization_id,
        tree=tree,
        positions=positions,
    )


@router.post("/positions", response_model=OrgPositionResponse, status_code=201)
async def create_position(
    organization_id: str = Query(...),
    data: OrgPositionCreate = ...,
    current_user: dict = Depends(get_current_user),
    repo: OrgChartRepository = Depends(get_repo),
):
    doc = await repo.create_position(organization_id, data.model_dump())
    return OrgPositionResponse(**doc)


@router.get("/positions/{position_id}", response_model=OrgPositionResponse)
async def get_position(
    position_id: str,
    current_user: dict = Depends(get_current_user),
    repo: OrgChartRepository = Depends(get_repo),
):
    pos = await repo.get_position(position_id)
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")
    return OrgPositionResponse(**pos)


@router.put("/positions/{position_id}", response_model=OrgPositionResponse)
async def update_position(
    position_id: str,
    data: OrgPositionUpdate,
    current_user: dict = Depends(get_current_user),
    repo: OrgChartRepository = Depends(get_repo),
):
    pos = await repo.update_position(position_id, data.model_dump(exclude_unset=True))
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")
    return OrgPositionResponse(**pos)


@router.delete("/positions/{position_id}")
async def delete_position(
    position_id: str,
    current_user: dict = Depends(get_current_user),
    repo: OrgChartRepository = Depends(get_repo),
):
    deleted = await repo.delete_position(position_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Position not found")
    return {"message": "Position deleted"}
