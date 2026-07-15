from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.schemas.audit import (
    AuditCreate, AuditUpdate, AuditResponse, AuditListResponse, AuditStatsResponse,
    FindingCreate, FindingUpdate, FindingResponse,
    CorrectiveActionCreate, CorrectiveActionUpdate, CorrectiveActionResponse,
    ChecklistItemCreate, ChecklistItemResponse,
)
from app.repositories.audit_repo import AuditRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/audits", tags=["Auditorías"])


def _audit_response(a: dict, findings_count: int = 0, nc_count: int = 0) -> AuditResponse:
    return AuditResponse(
        id=str(a["_id"]),
        organization_id=a["organization_id"],
        title=a["title"],
        audit_type=a.get("audit_type", "interna"),
        scope=a.get("scope", ""),
        criteria=a.get("criteria", ""),
        planned_date=a.get("planned_date"),
        start_date=a.get("start_date"),
        end_date=a.get("end_date"),
        status=a.get("status", "planificada"),
        auditor_name=a.get("auditor_name"),
        auditor_email=a.get("auditor_email"),
        team_members=a.get("team_members", []),
        processes_to_audit=a.get("processes_to_audit", []),
        summary=a.get("summary"),
        notes=a.get("notes", ""),
        findings_count=findings_count,
        non_conformities_count=nc_count,
        created_at=a["created_at"],
        updated_at=a["updated_at"],
    )


def _finding_response(f: dict, ca_count: int = 0) -> FindingResponse:
    return FindingResponse(
        id=str(f["_id"]),
        audit_id=f["audit_id"],
        title=f["title"],
        description=f["description"],
        finding_type=f.get("finding_type", "no_conformidad"),
        severity=f.get("severity", "menor"),
        clause_reference=f.get("clause_reference"),
        evidence=f.get("evidence", ""),
        affected_process=f.get("affected_process"),
        affected_asset=f.get("affected_asset"),
        status=f.get("status", "abierta"),
        corrective_actions_count=ca_count,
        created_at=f["created_at"],
        updated_at=f["updated_at"],
    )


def _ca_response(ca: dict) -> CorrectiveActionResponse:
    return CorrectiveActionResponse(
        id=str(ca["_id"]),
        finding_id=ca["finding_id"],
        description=ca["description"],
        responsible_id=ca.get("responsible_id"),
        deadline=ca.get("deadline"),
        status=ca.get("status", "abierta"),
        evidence=ca.get("evidence"),
        verification_date=ca.get("verification_date"),
        verified_by=ca.get("verified_by"),
        created_at=ca["created_at"],
        updated_at=ca["updated_at"],
    )


def _checklist_response(item: dict) -> ChecklistItemResponse:
    return ChecklistItemResponse(
        id=str(item["_id"]),
        audit_id=item["audit_id"],
        control_id=item.get("control_id"),
        question=item["question"],
        expected_evidence=item.get("expected_evidence", ""),
        response=item.get("response"),
        compliant=item.get("compliant"),
        auditor_notes=item.get("auditor_notes"),
    )


@router.post("", response_model=AuditResponse, status_code=201)
async def create_audit(data: AuditCreate, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    audit = await repo.create_audit(data.model_dump())
    return _audit_response(audit)


@router.get("", response_model=AuditListResponse)
async def list_audits(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    audit_type: str = Query(""),
    status_filter: str = Query("", alias="status"),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = AuditRepository(db)
    audits, total = await repo.list_audits(
        org_id=organization_id, page=page, page_size=page_size,
        search=search, audit_type=audit_type, status=status_filter,
    )
    return AuditListResponse(
        audits=[_audit_response(a) for a in audits],
        total=total, page=page, page_size=page_size,
    )


@router.get("/stats", response_model=AuditStatsResponse)
async def get_audit_stats(organization_id: str = Query(...), current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    stats = await repo.get_audit_stats(organization_id)
    return AuditStatsResponse(**stats)


@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(audit_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    audit = await repo.get_audit(audit_id)
    if audit is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    findings = await repo.list_findings(audit_id)
    nc_count = sum(1 for f in findings if f.get("finding_type") == "no_conformidad")
    return _audit_response(audit, findings_count=len(findings), nc_count=nc_count)


@router.put("/{audit_id}", response_model=AuditResponse)
async def update_audit(audit_id: str, data: AuditUpdate, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    audit = await repo.get_audit(audit_id)
    if audit is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos")
    updated = await repo.update_audit(audit_id, update_data)
    return _audit_response(updated)


@router.delete("/{audit_id}", status_code=204)
async def delete_audit(audit_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    audit = await repo.get_audit(audit_id)
    if audit is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    await repo.delete_audit(audit_id)


@router.get("/{audit_id}/findings", response_model=list[FindingResponse])
async def list_findings(audit_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    findings = await repo.list_findings(audit_id)
    result = []
    for f in findings:
        cas = await repo.list_corrective_actions(str(f["_id"]))
        result.append(_finding_response(f, ca_count=len(cas)))
    return result


@router.post("/{audit_id}/findings", response_model=FindingResponse, status_code=201)
async def create_finding(audit_id: str, data: FindingCreate, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    audit = await repo.get_audit(audit_id)
    if audit is None:
        raise HTTPException(status_code=404, detail="Auditoría no encontrada")
    finding_data = data.model_dump()
    finding_data["audit_id"] = audit_id
    finding_data["organization_id"] = audit["organization_id"]
    finding = await repo.create_finding(finding_data)
    return _finding_response(finding)


@router.put("/findings/{finding_id}", response_model=FindingResponse)
async def update_finding(finding_id: str, data: FindingUpdate, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    finding = await repo.get_finding(finding_id)
    if finding is None:
        raise HTTPException(status_code=404, detail="Hallazgo no encontrado")
    update_data = data.model_dump(exclude_unset=True)
    updated = await repo.update_finding(finding_id, update_data)
    return _finding_response(updated)


@router.post("/findings/{finding_id}/corrective-actions", response_model=CorrectiveActionResponse, status_code=201)
async def create_corrective_action(
    finding_id: str, data: CorrectiveActionCreate, current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    repo = AuditRepository(db)
    finding = await repo.get_finding(finding_id)
    if finding is None:
        raise HTTPException(status_code=404, detail="Hallazgo no encontrado")
    ca_data = data.model_dump()
    ca_data["finding_id"] = finding_id
    ca = await repo.create_corrective_action(ca_data)
    return _ca_response(ca)


@router.put("/corrective-actions/{ca_id}", response_model=CorrectiveActionResponse)
async def update_corrective_action(
    ca_id: str, data: CorrectiveActionUpdate, current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    repo = AuditRepository(db)
    ca = await repo.get_corrective_action(ca_id)
    if ca is None:
        raise HTTPException(status_code=404, detail="Acción correctiva no encontrada")
    update_data = data.model_dump(exclude_unset=True)
    updated = await repo.update_corrective_action(ca_id, update_data)
    return _ca_response(updated)


@router.get("/{audit_id}/checklist", response_model=list[ChecklistItemResponse])
async def list_checklist(audit_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    repo = AuditRepository(db)
    items = await repo.list_checklist(audit_id)
    return [_checklist_response(i) for i in items]


@router.post("/{audit_id}/checklist", response_model=ChecklistItemResponse, status_code=201)
async def add_checklist_item(
    audit_id: str, data: ChecklistItemCreate, current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    repo = AuditRepository(db)
    item_data = data.model_dump()
    item_data["audit_id"] = audit_id
    item = await repo.add_checklist_item(item_data)
    return _checklist_response(item)
