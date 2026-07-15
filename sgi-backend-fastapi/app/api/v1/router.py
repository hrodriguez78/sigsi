from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.organizations import router as organizations_router
from app.api.v1.endpoints.processes import router as processes_router
from app.api.v1.endpoints.assets import router as assets_router
from app.api.v1.endpoints.documents import router as documents_router
from app.api.v1.endpoints.risks import router as risks_router
from app.api.v1.endpoints.controls import router as controls_router
from app.api.v1.endpoints.incidents import router as incidents_router
from app.api.v1.endpoints.audits import router as audits_router
from app.api.v1.endpoints.training import router as training_router
from app.api.v1.endpoints.roles import router as roles_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.search import router as search_router
from app.api.v1.endpoints.ai import router as ai_router
from app.api.v1.endpoints.export import router as export_router
from app.api.v1.endpoints.raci import router as raci_router
from app.api.v1.endpoints.widgets import router as widgets_router
from app.api.v1.endpoints.orgchart import router as orgchart_router
from app.api.v1.endpoints.ocr import router as ocr_router
from app.api.v1.endpoints.candidates import router as candidates_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.work_orders import router as work_orders_router
from app.api.v1.endpoints.daily_reports import router as daily_reports_router
from app.api.v1.endpoints.inspections import router as inspections_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(organizations_router)
api_router.include_router(processes_router)
api_router.include_router(assets_router)
api_router.include_router(documents_router)
api_router.include_router(risks_router)
api_router.include_router(controls_router)
api_router.include_router(incidents_router)
api_router.include_router(audits_router)
api_router.include_router(training_router)
api_router.include_router(roles_router)
api_router.include_router(dashboard_router)
api_router.include_router(search_router)
api_router.include_router(ai_router)
api_router.include_router(export_router)
api_router.include_router(raci_router)
api_router.include_router(widgets_router)
api_router.include_router(orgchart_router)
api_router.include_router(ocr_router)
api_router.include_router(candidates_router)
api_router.include_router(users_router)
api_router.include_router(work_orders_router)
api_router.include_router(daily_reports_router)
api_router.include_router(inspections_router)


@api_router.get("/ping", tags=["Health"])
def ping():
    return {"message": "pong"}
