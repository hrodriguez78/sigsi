from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.database import get_database
from app.schemas.daily_report import (
    DailyReportCreate, DailyReportUpdate, DailyReportResponse, DailyReportListResponse,
    DailyReportStatsResponse,
)
from app.repositories.daily_report_repo import DailyReportRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/daily-reports", tags=["Bitácoras y Reportes Diarios"])


def _report_response(r: dict) -> DailyReportResponse:
    return DailyReportResponse(
        id=str(r["_id"]),
        organization_id=r["organization_id"],
        client_organization_id=r["client_organization_id"],
        work_order_id=r.get("work_order_id"),
        report_type=r["report_type"],
        report_date=str(r.get("report_date", "")),
        reported_by=r.get("reported_by", ""),
        title=r["title"],
        description=r.get("description", ""),
        activities_performed=r.get("activities_performed", []),
        hours_worked=r.get("hours_worked", 0.0),
        materials_used=r.get("materials_used", []),
        issues_found=r.get("issues_found", []),
        recommendations=r.get("recommendations", ""),
        photos_urls=r.get("photos_urls", []),
        status=r["status"],
        reviewer_comments=r.get("reviewer_comments", ""),
        reviewed_by=r.get("reviewed_by"),
        created_at=r["created_at"],
        updated_at=r["updated_at"],
    )


@router.post("", response_model=DailyReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    data: DailyReportCreate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DailyReportRepository(db)
    report_data = data.model_dump()
    if not report_data.get("reported_by"):
        report_data["reported_by"] = current_user.get("full_name", current_user["id"])
    report = await repo.create(report_data)
    return _report_response(report)


@router.get("", response_model=DailyReportListResponse)
async def list_reports(
    organization_id: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(""),
    status_filter: str = Query("", alias="status"),
    report_type: str = Query(""),
    client_org_id: str = Query(""),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DailyReportRepository(db)
    items, total = await repo.list_by_organization(
        org_id=organization_id, page=page, page_size=page_size,
        search=search, status=status_filter, report_type=report_type,
        client_org_id=client_org_id,
    )
    return DailyReportListResponse(
        reports=[_report_response(r) for r in items],
        total=total, page=page, page_size=page_size,
    )


@router.get("/stats", response_model=DailyReportStatsResponse)
async def get_report_stats(
    organization_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DailyReportRepository(db)
    stats = await repo.get_stats(organization_id)
    return DailyReportStatsResponse(**stats)


@router.get("/{report_id}", response_model=DailyReportResponse)
async def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DailyReportRepository(db)
    report = await repo.get_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return _report_response(report)


@router.put("/{report_id}", response_model=DailyReportResponse)
async def update_report(
    report_id: str,
    data: DailyReportUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DailyReportRepository(db)
    report = await repo.get_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")
    updated = await repo.update(report_id, update_data)
    return _report_response(updated)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    repo = DailyReportRepository(db)
    report = await repo.get_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    await repo.delete(report_id)
