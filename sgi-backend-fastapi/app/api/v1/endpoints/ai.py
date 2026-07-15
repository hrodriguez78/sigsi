import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import get_database
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
    PolicyGenerationRequest,
    PolicyGenerationResponse,
    GapAnalysisRequest,
    GapAnalysisResponse,
    GapAnalysisItem,
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.ai_service import (
    chat_with_ai,
    generate_policy_from_request,
    ISO_CONTROLS,
)
from app.repositories.ai_repo import AIRepository
from app.repositories.user_repo import UserRepository
from app.repositories.control_repo import ControlRepository
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["Inteligencia Artificial"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    ai_repo = AIRepository(db)
    user_id = str(current_user["_id"])

    if data.session_id:
        session = await ai_repo.get_session(data.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Sesión no encontrada")
        history = session.get("messages", [])
        session_id = data.session_id
    else:
        title = data.message[:50] + ("..." if len(data.message) > 50 else "")
        session = await ai_repo.create_session(user_id, title)
        session_id = str(session["_id"])
        history = []

    await ai_repo.add_message(session_id, "user", data.message)

    response_text = await chat_with_ai(data.message, history, data.context)

    await ai_repo.add_message(session_id, "assistant", response_text)

    return ChatResponse(session_id=session_id, message=response_text)


@router.get("/sessions")
async def list_sessions(current_user: dict = Depends(get_current_user)):
    db = await get_database()
    ai_repo = AIRepository(db)
    sessions = await ai_repo.list_sessions(str(current_user["_id"]))
    return [{"id": str(s["_id"]), "title": s["title"], "updated_at": s["updated_at"]} for s in sessions]


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    ai_repo = AIRepository(db)
    session = await ai_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return session


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    ai_repo = AIRepository(db)
    await ai_repo.delete_session(session_id)


@router.post("/generate-policy", response_model=PolicyGenerationResponse)
async def generate_policy(
    data: PolicyGenerationRequest,
    current_user: dict = Depends(get_current_user),
):
    result = await generate_policy_from_request(
        data.policy_type, data.title, data.scope, data.iso_references
    )
    return PolicyGenerationResponse(**result)


@router.post("/gap-analysis", response_model=GapAnalysisResponse)
async def gap_analysis(
    data: GapAnalysisRequest,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()
    control_repo = ControlRepository(db)
    org_id = current_user.get("organization_id")

    controls, total = await control_repo.list_controls(org_id=org_id, page=1, page_size=200)

    implemented = sum(1 for c in controls if c.get("implementation_status") in ("implementado", "efectivo"))

    gaps = []
    for ctrl in controls:
        status_val = ctrl.get("implementation_status", "no_iniciado")
        if status_val != "efectivo":
            gaps.append(GapAnalysisItem(
                control_id=ctrl.get("control_id", ""),
                control_name=ctrl.get("name", ""),
                category=ctrl.get("category", ""),
                status=status_val,
                gap_description=f"Control {ctrl.get('control_id', '')} en estado '{status_val}'",
                recommendation=f"Implementar medidas para alcanzar estado 'efectivo'",
                priority="alto" if status_val == "no_iniciado" else "medio",
            ))

    score = round((implemented / total * 100) if total > 0 else 0, 1)

    return GapAnalysisResponse(
        standard=data.standard,
        total_controls=total,
        implemented=implemented,
        gaps=gaps,
        compliance_score=score,
        summary=f"Se evaluaron {total} controles. {implemented} implementados ({score}%). {len(gaps)} brechas identificadas.",
    )


@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    data: RecommendationRequest,
    current_user: dict = Depends(get_current_user),
):
    recommendations = []
    priority_actions = []
    related_controls = []

    if data.module == "risks":
        recommendations = [
            "Identificar y documentar todos los activos de información",
            "Realizar análisis de amenazas periódico",
            "Definir criterios de aceptación de riesgos",
            "Monitorear tratamientos de riesgo activos",
        ]
        priority_actions = [
            "Completar matriz de riesgos para activos críticos",
            "Asignar propietarios a todos los riesgos identificados",
        ]
        related_controls = ["A.5.7", "A.8.8", "A.5.9"]

    elif data.module == "controls":
        recommendations = [
            "Priorizar implementación de controles de alto impacto",
            "Documentar evidencias de cada control",
            "Revisar efectividad trimestralmente",
        ]
        priority_actions = [
            "Completar Declaración de Aplicabilidad (SoA)",
            "Implementar controles críticos identificados en gap analysis",
        ]
        related_controls = ["A.5.36", "A.5.35"]

    elif data.module == "assets":
        recommendations = [
            "Mantener inventario actualizado de todos los activos",
            "Clasificar activos según criticidad y valor",
            "Definir propietarios y custodios para cada activo",
        ]
        priority_actions = [
            "Completar inventario de activos críticos",
            "Asignar clasificación CIA a activos de información",
        ]
        related_controls = ["A.5.9", "A.5.10", "A.5.12"]

    elif data.module == "documents":
        recommendations = [
            "Implementar control de versiones para documentos clave",
            "Establecer workflow de aprobación",
            "Mantener registro de distribución",
        ]
        priority_actions = [
            "Crear política de gestión documental",
            "Implementar sistema de aprobación electrónica",
        ]
        related_controls = ["A.5.37", "A.8.10"]

    elif data.module == "incidents":
        recommendations = [
            "Definir procedimiento de respuesta a incidentes",
            "Establecer equipo de respuesta (CSIRT)",
            "Implementar registro y seguimiento de incidentes",
        ]
        priority_actions = [
            "Crear procedimiento de clasificación de incidentes",
            "Establecer métricas de tiempo de respuesta",
        ]
        related_controls = ["A.5.24", "A.5.25", "A.5.26", "A.5.27"]

    return RecommendationResponse(
        recommendations=recommendations,
        priority_actions=priority_actions,
        related_controls=related_controls,
    )
