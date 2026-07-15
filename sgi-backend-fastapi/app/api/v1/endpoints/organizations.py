from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationListResponse,
)
from app.repositories.organization_repo import OrganizationRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/organizations", tags=["Organizaciones"])


def _org_response(org: dict) -> OrganizationResponse:
    return OrganizationResponse(
        id=str(org["_id"]),
        name=org["name"],
        nit=org["nit"],
        description=org.get("description", ""),
        address=org.get("address", ""),
        phone=org.get("phone", ""),
        email=org.get("email"),
        website=org.get("website"),
        created_at=org["created_at"],
        updated_at=org["updated_at"],
    )


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: OrganizationCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    org_repo = OrganizationRepository(db)

    existing = await org_repo.get_by_nit(data.nit)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una organización con este NIT",
        )

    org = await org_repo.create(data.model_dump())
    return _org_response(org)


@router.get("", response_model=OrganizationListResponse)
async def list_organizations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    org_repo = OrganizationRepository(db)
    orgs, total = await org_repo.list_all(page=page, page_size=page_size, search=search)
    return OrganizationListResponse(
        organizations=[_org_response(o) for o in orgs],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    org_repo = OrganizationRepository(db)
    org = await org_repo.get_by_id(org_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organización no encontrada")
    return _org_response(org)


@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: str,
    data: OrganizationUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    org_repo = OrganizationRepository(db)
    org = await org_repo.get_by_id(org_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organización no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")

    updated = await org_repo.update(org_id, update_data)
    return _org_response(updated)


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    org_repo = OrganizationRepository(db)
    org = await org_repo.get_by_id(org_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organización no encontrada")
    await org_repo.delete(org_id)
