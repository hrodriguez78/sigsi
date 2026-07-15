from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.asset import (
    AssetCreate,
    AssetUpdate,
    AssetResponse,
    AssetListResponse,
    AssetStatsResponse,
)
from app.repositories.asset_repo import AssetRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/assets", tags=["Activos"])


def _asset_response(asset: dict) -> AssetResponse:
    return AssetResponse(
        id=str(asset["_id"]),
        organization_id=asset["organization_id"],
        name=asset["name"],
        code=asset["code"],
        description=asset.get("description", ""),
        asset_type=asset.get("asset_type", "hardware"),
        criticality=asset.get("criticality", "bajo"),
        cia=asset.get("cia", {"confidentiality": 1, "integrity": 1, "availability": 1}),
        process_id=asset.get("process_id"),
        owner_id=asset.get("owner_id"),
        location=asset.get("location", ""),
        brand=asset.get("brand", ""),
        model=asset.get("model", ""),
        serial_number=asset.get("serial_number", ""),
        ip_address=asset.get("ip_address", ""),
        operating_system=asset.get("operating_system", ""),
        responsible_user_id=asset.get("responsible_user_id"),
        acquisition_date=asset.get("acquisition_date"),
        warranty_until=asset.get("warranty_until"),
        cost=asset.get("cost"),
        status=asset.get("status", "activo"),
        tags=asset.get("tags", []),
        custom_fields=asset.get("custom_fields", {}),
        created_at=asset["created_at"],
        updated_at=asset["updated_at"],
    )


@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    data: AssetCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = AssetRepository(db)

    existing = await repo.get_by_code(data.organization_id, data.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un activo con código '{data.code}' en esta organización",
        )

    asset = await repo.create(data.model_dump())
    return _asset_response(asset)


@router.get("", response_model=AssetListResponse)
async def list_assets(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    asset_type: str = Query(""),
    criticality: str = Query(""),
    status_filter: str = Query("", alias="status"),
    process_id: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = AssetRepository(db)
    assets, total = await repo.list_by_organization(
        org_id=organization_id,
        page=page,
        page_size=page_size,
        search=search,
        asset_type=asset_type,
        criticality=criticality,
        status=status_filter,
        process_id=process_id,
    )
    return AssetListResponse(
        assets=[_asset_response(a) for a in assets],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=AssetStatsResponse)
async def get_asset_stats(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = AssetRepository(db)
    stats = await repo.get_stats(organization_id)
    return AssetStatsResponse(**stats)


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = AssetRepository(db)
    asset = await repo.get_by_id(asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return _asset_response(asset)


@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: str,
    data: AssetUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = AssetRepository(db)
    asset = await repo.get_by_id(asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=400, detail="No se enviaron campos para actualizar"
        )

    if "code" in update_data:
        existing = await repo.get_by_code(asset["organization_id"], update_data["code"])
        if existing and str(existing["_id"]) != asset_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un activo con código '{update_data['code']}'",
            )

    updated = await repo.update(asset_id, update_data)
    return _asset_response(updated)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = AssetRepository(db)
    asset = await repo.get_by_id(asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    await repo.delete(asset_id)
