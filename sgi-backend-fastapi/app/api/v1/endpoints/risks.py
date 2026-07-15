from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.risk import (
    RiskCreate,
    RiskUpdate,
    RiskResponse,
    RiskListResponse,
    RiskMatrixResponse,
    RiskStatsResponse,
    TreatmentCreate,
    TreatmentResponse,
)
from app.repositories.risk_repo import RiskRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/risks", tags=["Riesgos"])


def _risk_response(risk: dict) -> RiskResponse:
    return RiskResponse(
        id=str(risk["_id"]),
        organization_id=risk["organization_id"],
        name=risk["name"],
        code=risk["code"],
        description=risk.get("description", ""),
        category=risk.get("category", "operativo"),
        asset_id=risk.get("asset_id"),
        process_id=risk.get("process_id"),
        source=risk.get("source", ""),
        consequence=risk.get("consequence", ""),
        probability=risk.get("probability", 1),
        impact=risk.get("impact", 1),
        risk_level=risk.get("risk_level", "bajo"),
        risk_score=risk.get("risk_score", 1),
        treatment=risk.get("treatment"),
        treatment_plan=risk.get("treatment_plan", ""),
        owner_id=risk.get("owner_id"),
        status=risk.get("status", "identificado"),
        tags=risk.get("tags", []),
        created_at=risk["created_at"],
        updated_at=risk["updated_at"],
    )


def _treatment_response(t: dict) -> TreatmentResponse:
    return TreatmentResponse(
        id=str(t["_id"]),
        risk_id=t["risk_id"],
        treatment_type=t["treatment_type"],
        plan=t["plan"],
        responsible_id=t.get("responsible_id"),
        deadline=t.get("deadline"),
        budget=t.get("budget"),
        status=t.get("status", "pendiente"),
        created_at=t["created_at"],
        updated_at=t["updated_at"],
    )


@router.post("", response_model=RiskResponse, status_code=status.HTTP_201_CREATED)
async def create_risk(
    data: RiskCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)

    existing = await repo.get_by_code(data.organization_id, data.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un riesgo con código '{data.code}'",
        )

    risk = await repo.create(data.model_dump())
    return _risk_response(risk)


@router.get("", response_model=RiskListResponse)
async def list_risks(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    category: str = Query(""),
    risk_level: str = Query(""),
    status_filter: str = Query("", alias="status"),
    asset_id: str = Query(""),
    process_id: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)
    risks, total = await repo.list_by_organization(
        org_id=organization_id,
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        risk_level=risk_level,
        status=status_filter,
        asset_id=asset_id,
        process_id=process_id,
    )
    return RiskListResponse(
        risks=[_risk_response(r) for r in risks],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/matrix", response_model=RiskMatrixResponse)
async def get_risk_matrix(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)
    matrix = await repo.get_matrix(organization_id)
    return RiskMatrixResponse(**matrix)


@router.get("/stats", response_model=RiskStatsResponse)
async def get_risk_stats(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)
    stats = await repo.get_stats(organization_id)
    return RiskStatsResponse(**stats)


@router.get("/{risk_id}", response_model=RiskResponse)
async def get_risk(
    risk_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)
    risk = await repo.get_by_id(risk_id)
    if risk is None:
        raise HTTPException(status_code=404, detail="Riesgo no encontrado")
    return _risk_response(risk)


@router.put("/{risk_id}", response_model=RiskResponse)
async def update_risk(
    risk_id: str,
    data: RiskUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)
    risk = await repo.get_by_id(risk_id)
    if risk is None:
        raise HTTPException(status_code=404, detail="Riesgo no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos")

    if "probability" in update_data and not 1 <= update_data["probability"] <= 5:
        raise HTTPException(status_code=400, detail="Probabilidad debe ser 1-5")
    if "impact" in update_data and not 1 <= update_data["impact"] <= 5:
        raise HTTPException(status_code=400, detail="Impacto debe ser 1-5")

    updated = await repo.update(risk_id, update_data)
    return _risk_response(updated)


@router.delete("/{risk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_risk(
    risk_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)
    risk = await repo.get_by_id(risk_id)
    if risk is None:
        raise HTTPException(status_code=404, detail="Riesgo no encontrado")
    await repo.delete(risk_id)


@router.post("/{risk_id}/treatments", response_model=TreatmentResponse, status_code=201)
async def create_treatment(
    risk_id: str,
    data: TreatmentCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)
    risk = await repo.get_by_id(risk_id)
    if risk is None:
        raise HTTPException(status_code=404, detail="Riesgo no encontrado")

    treatment_data = data.model_dump()
    treatment_data["risk_id"] = risk_id
    treatment = await repo.create_treatment(treatment_data)
    return _treatment_response(treatment)


@router.get("/{risk_id}/treatments", response_model=list[TreatmentResponse])
async def list_treatments(
    risk_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = RiskRepository(db)
    risk = await repo.get_by_id(risk_id)
    if risk is None:
        raise HTTPException(status_code=404, detail="Riesgo no encontrado")

    treatments = await repo.get_treatments(risk_id)
    return [_treatment_response(t) for t in treatments]
