from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.control import (
    ControlCreate,
    ControlUpdate,
    ControlResponse,
    ControlListResponse,
    ControlStatsResponse,
    EvidenceCreate,
    EvidenceResponse,
    SoAResponse,
)
from app.repositories.control_repo import ControlRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/controls", tags=["Controles ISO 27001"])


def _control_response(ctrl: dict, evidence_count: int = 0) -> ControlResponse:
    return ControlResponse(
        id=str(ctrl["_id"]),
        organization_id=ctrl["organization_id"],
        control_id=ctrl["control_id"],
        name=ctrl["name"],
        description=ctrl.get("description", ""),
        category=ctrl.get("category", "organizativo"),
        annex_a=ctrl.get("annex_a"),
        iso_clause=ctrl.get("iso_clause"),
        implementation_status=ctrl.get("implementation_status", "no_iniciado"),
        compliance_level=ctrl.get("compliance_level", "no_evaluado"),
        responsible_id=ctrl.get("responsible_id"),
        evidence_description=ctrl.get("evidence_description", ""),
        notes=ctrl.get("notes", ""),
        tags=ctrl.get("tags", []),
        evidence_count=evidence_count,
        created_at=ctrl["created_at"],
        updated_at=ctrl["updated_at"],
    )


def _evidence_response(ev: dict) -> EvidenceResponse:
    return EvidenceResponse(
        id=str(ev["_id"]),
        control_id=ev["control_id"],
        title=ev["title"],
        description=ev.get("description", ""),
        file_url=ev.get("file_url"),
        evidence_type=ev.get("evidence_type", "documento"),
        uploaded_by=ev.get("uploaded_by"),
        created_at=ev["created_at"],
    )


@router.post("", response_model=ControlResponse, status_code=status.HTTP_201_CREATED)
async def create_control(
    data: ControlCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)

    existing = await repo.get_by_control_id(data.organization_id, data.control_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe el control '{data.control_id}' en esta organización",
        )

    ctrl = await repo.create(data.model_dump())
    return _control_response(ctrl)


@router.get("", response_model=ControlListResponse)
async def list_controls(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    category: str = Query(""),
    implementation_status: str = Query(""),
    compliance_level: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)
    controls, total = await repo.list_by_organization(
        org_id=organization_id,
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        implementation_status=implementation_status,
        compliance_level=compliance_level,
    )
    return ControlListResponse(
        controls=[_control_response(c) for c in controls],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=ControlStatsResponse)
async def get_control_stats(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)
    stats = await repo.get_stats(organization_id)
    return ControlStatsResponse(**stats)


@router.get("/soa", response_model=SoAResponse)
async def get_soa(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)
    soa = await repo.get_soa(organization_id)
    return SoAResponse(
        organization_id=soa["organization_id"],
        total_controls=soa["total_controls"],
        applicable_controls=soa["applicable_controls"],
        implemented=soa["implemented"],
        effective=soa["effective"],
        partial=soa["partial"],
        not_implemented=soa["not_implemented"],
        compliance_pct=soa["compliance_pct"],
        controls=[_control_response(c) for c in soa["controls"]],
    )


@router.get("/{ctrl_id}", response_model=ControlResponse)
async def get_control(
    ctrl_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)
    ctrl = await repo.get_by_id(ctrl_id)
    if ctrl is None:
        raise HTTPException(status_code=404, detail="Control no encontrado")

    evidence = await repo.get_evidence(ctrl_id)
    return _control_response(ctrl, evidence_count=len(evidence))


@router.put("/{ctrl_id}", response_model=ControlResponse)
async def update_control(
    ctrl_id: str,
    data: ControlUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)
    ctrl = await repo.get_by_id(ctrl_id)
    if ctrl is None:
        raise HTTPException(status_code=404, detail="Control no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos")

    updated = await repo.update(ctrl_id, update_data)
    return _control_response(updated)


@router.delete("/{ctrl_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_control(
    ctrl_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)
    ctrl = await repo.get_by_id(ctrl_id)
    if ctrl is None:
        raise HTTPException(status_code=404, detail="Control no encontrado")
    await repo.delete(ctrl_id)


@router.post("/{ctrl_id}/evidence", response_model=EvidenceResponse, status_code=201)
async def add_evidence(
    ctrl_id: str,
    data: EvidenceCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)
    ctrl = await repo.get_by_id(ctrl_id)
    if ctrl is None:
        raise HTTPException(status_code=404, detail="Control no encontrado")

    ev_data = data.model_dump()
    ev_data["control_id"] = ctrl_id
    ev_data["uploaded_by"] = current_user.get("email", "")
    evidence = await repo.add_evidence(ev_data)
    return _evidence_response(evidence)


@router.get("/{ctrl_id}/evidence", response_model=list[EvidenceResponse])
async def list_evidence(
    ctrl_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = ControlRepository(db)
    evidence = await repo.get_evidence(ctrl_id)
    return [_evidence_response(e) for e in evidence]
