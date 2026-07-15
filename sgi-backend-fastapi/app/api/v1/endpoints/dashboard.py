from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from app.core.database import get_database
from app.schemas.dashboard import (
    DashboardStats,
    ModuleStats,
    KPISummary,
    RiskDistribution,
    ControlCompliance,
    IncidentSummary,
    DashboardTrends,
    TrendPoint,
)
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


async def _count(db, collection: str, org_id: str = None) -> int:
    query = {"organization_id": org_id} if org_id else {}
    return await db[collection].count_documents(query)


async def _trend(db, collection: str, org_id: str = None, months: int = 6) -> list[TrendPoint]:
    now = datetime.now(timezone.utc)
    result = []
    for i in range(months - 1, -1, -1):
        start = (now - timedelta(days=30 * (i + 1))).replace(tzinfo=None)
        end = (now - timedelta(days=30 * i)).replace(tzinfo=None)
        query = {"created_at": {"$gte": start, "$lt": end}}
        if org_id:
            query["organization_id"] = org_id
        count = await db[collection].count_documents(query)
        result.append(TrendPoint(month=start.strftime("%b"), value=count))
    return result


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = await get_database()
    org_id = current_user.get("organization_id")

    stats = DashboardStats(
        organizations=ModuleStats(count=await _count(db, "organizations"), trend=0),
        processes=ModuleStats(count=await _count(db, "processes", org_id), trend=0),
        assets=ModuleStats(count=await _count(db, "assets", org_id), trend=0),
        documents=ModuleStats(count=await _count(db, "documents", org_id), trend=0),
        risks=ModuleStats(count=await _count(db, "risks", org_id), trend=0),
        controls=ModuleStats(count=await _count(db, "controls", org_id), trend=0),
        incidents=ModuleStats(count=await _count(db, "incidents", org_id), trend=0),
        audits=ModuleStats(count=await _count(db, "audits", org_id), trend=0),
        courses=ModuleStats(count=await _count(db, "courses", org_id), trend=0),
    )
    return stats


@router.get("/kpis", response_model=KPISummary)
async def get_kpis(current_user: dict = Depends(get_current_user)):
    db = await get_database()
    org_id = current_user.get("organization_id")
    query = {"organization_id": org_id} if org_id else {}

    risk_dist = RiskDistribution()
    async for r in db.risks.find(query, {"risk_level": 1}):
        level = r.get("risk_level", "")
        if level == "bajo":
            risk_dist.bajo += 1
        elif level == "medio":
            risk_dist.medio += 1
        elif level == "alto":
            risk_dist.alto += 1
        elif level == "critico":
            risk_dist.critico += 1

    control_comp = ControlCompliance()
    control_comp.total = await db.controls.count_documents(query)
    control_comp.implemented = await db.controls.count_documents(
        {**query, "implementation_status": {"$in": ["implementado", "efectivo"]}}
    )
    control_comp.effective = await db.controls.count_documents(
        {**query, "implementation_status": "efectivo"}
    )
    if control_comp.total > 0:
        control_comp.percentage = round(control_comp.implemented / control_comp.total * 100, 1)

    inc_summary = IncidentSummary()
    inc_summary.open = await db.incidents.count_documents({**query, "status": "abierto"})
    inc_summary.in_progress = await db.incidents.count_documents(
        {**query, "status": {"$in": ["en_investigacion", "contenido", "erradicado"]}}
    )
    inc_summary.closed = await db.incidents.count_documents({**query, "status": "cerrado"})

    pending = 0
    pending += await db.audits.count_documents(
        {**query, "status": {"$in": ["planificada", "en_curso"]}}
    )
    pending += await db.incidents.count_documents({**query, "status": "abierto"})

    compliance_pct = control_comp.percentage
    maturity = round(compliance_pct / 20, 1) if compliance_pct else 0

    return KPISummary(
        risk_distribution=risk_dist,
        control_compliance=control_comp,
        incident_summary=inc_summary,
        compliance_percentage=round(compliance_pct, 1),
        maturity_level=maturity,
        pending_actions=pending,
    )


@router.get("/trends", response_model=DashboardTrends)
async def get_trends(current_user: dict = Depends(get_current_user)):
    db = await get_database()
    org_id = current_user.get("organization_id")

    return DashboardTrends(
        risks=await _trend(db, "risks", org_id, 6),
        incidents=await _trend(db, "incidents", org_id, 6),
        documents=await _trend(db, "documents", org_id, 6),
        audits=await _trend(db, "audits", org_id, 6),
    )
