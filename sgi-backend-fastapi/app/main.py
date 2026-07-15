from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import connect_db, close_db, get_database
from app.api.v1.router import api_router
from app.repositories.user_repo import UserRepository
from app.repositories.role_repo import RoleRepository
from app.repositories.organization_repo import OrganizationRepository
from app.services.auth import hash_password


DEFAULT_ROLES = [
    {
        "name": "admin",
        "description": "Administrador del sistema con acceso total",
        "permissions": [
            "organizations.read", "organizations.write", "organizations.delete",
            "processes.read", "processes.write", "processes.delete",
            "assets.read", "assets.write", "assets.delete",
            "documents.read", "documents.write", "documents.delete", "documents.approve",
            "risks.read", "risks.write", "risks.delete",
            "controls.read", "controls.write", "controls.delete",
            "incidents.read", "incidents.write", "incidents.delete",
            "audits.read", "audits.write", "audits.delete",
            "training.read", "training.write", "training.delete",
            "dashboard.read",
            "users.read", "users.write", "users.delete",
            "roles.read", "roles.write", "roles.delete",
            "ai.read", "ai.write",
            "work_orders.read", "work_orders.write", "work_orders.delete",
            "daily_reports.read", "daily_reports.write", "daily_reports.delete", "daily_reports.approve",
            "inspections.read", "inspections.write", "inspections.delete",
        ],
    },
    {
        "name": "auditor",
        "description": "Auditor con acceso de lectura y generación de reportes",
        "permissions": [
            "organizations.read", "processes.read", "assets.read",
            "documents.read", "documents.approve",
            "risks.read", "controls.read",
            "incidents.read", "audits.read", "audits.write",
            "training.read", "dashboard.read", "users.read",
            "work_orders.read", "daily_reports.read", "inspections.read",
        ],
    },
    {
        "name": "manager",
        "description": "Gerente con acceso de gestión a sus módulos",
        "permissions": [
            "organizations.read", "processes.read", "processes.write",
            "assets.read", "assets.write",
            "documents.read", "documents.write",
            "risks.read", "risks.write",
            "controls.read", "controls.write",
            "incidents.read", "incidents.write",
            "audits.read", "training.read", "training.write",
            "dashboard.read", "users.read",
            "work_orders.read", "work_orders.write",
            "daily_reports.read", "daily_reports.write", "daily_reports.approve",
            "inspections.read", "inspections.write",
        ],
    },
    {
        "name": "user",
        "description": "Usuario estándar con acceso básico de lectura",
        "permissions": [
            "organizations.read", "processes.read", "assets.read",
            "documents.read", "risks.read", "controls.read",
            "incidents.read", "incidents.write",
            "training.read", "dashboard.read",
        ],
    },
    {
        "name": "coordinador",
        "description": "Coordinador de operaciones de mantenimiento y aseo",
        "permissions": [
            "organizations.read", "processes.read", "processes.write",
            "assets.read", "assets.write", "documents.read", "documents.write",
            "incidents.read", "incidents.write", "training.read", "training.write",
            "dashboard.read", "users.read",
            "candidates.read", "candidates.write",
            "work_orders.read", "work_orders.write", "work_orders.delete",
            "daily_reports.read", "daily_reports.write", "daily_reports.approve",
            "inspections.read", "inspections.write", "inspections.delete",
        ],
    },
    {
        "name": "operario",
        "description": "Operario de servicios generales y aseo",
        "permissions": [
            "organizations.read", "processes.read", "assets.read",
            "documents.read", "incidents.read", "incidents.write",
            "training.read", "dashboard.read",
            "work_orders.read", "work_orders.write",
            "daily_reports.read", "daily_reports.write",
            "inspections.read",
        ],
    },
    {
        "name": "cliente_contacto",
        "description": "Punto de contacto en la empresa cliente",
        "permissions": [
            "organizations.read", "processes.read", "documents.read",
            "incidents.read", "incidents.write", "dashboard.read",
            "candidates.read",
            "work_orders.read", "work_orders.write",
            "daily_reports.read",
            "inspections.read",
        ],
    },
    {
        "name": "cliente_observador",
        "description": "Observador con acceso de solo lectura en empresa cliente",
        "permissions": [
            "organizations.read", "processes.read", "documents.read",
            "dashboard.read", "candidates.read",
            "work_orders.read",
            "daily_reports.read",
            "inspections.read",
        ],
    },
]

OPENAPI_TAGS = [
    {"name": "Health", "description": "Health checks del sistema"},
    {"name": "Auth", "description": "Autenticación JWT (login, registro, perfil)"},
    {"name": "Organizations", "description": "CRUD de organizaciones"},
    {"name": "Processes", "description": "CRUD de procesos con árbol jerárquico"},
    {"name": "Assets", "description": "Inventario de activos con clasificación CIA"},
    {"name": "Documents", "description": "Gestión documental con versionado y workflow"},
    {"name": "Risks", "description": "Gestión de riesgos con matriz 5×5 y tratamientos"},
    {"name": "Controls", "description": "Controles ISO 27001:2022 con SoA y evidencias"},
    {"name": "Incidents", "description": "Gestión de incidentes con timeline de comentarios"},
    {"name": "Audits", "description": "Auditorías con hallazgos, acciones correctivas y checklist"},
    {"name": "Training", "description": "Capacitación con cursos, inscripciones y evaluaciones"},
    {"name": "Roles", "description": "RBAC - roles, permisos y control de acceso"},
    {"name": "Dashboard", "description": "Estadísticas, KPIs y tendencias ejecutivas"},
    {"name": "Search", "description": "Búsqueda global multi-módulo"},
    {"name": "AI", "description": "Asistente IA: chat ISO, generación de políticas, análisis de brechas"},
    {"name": "Export", "description": "Exportación de reportes Excel y PDF"},
    {"name": "Widget Layouts", "description": "Dashboard configurable por usuario"},
    {"name": "Org Chart", "description": "Organigrama dinámico con estructura jerárquica"},
    {"name": "RACI", "description": "Matriz de responsabilidades RACI"},
    {"name": "OCR", "description": "Extracción de texto de imágenes y PDFs"},
    {"name": "Órdenes de Trabajo", "description": "Gestión de órdenes de trabajo para servicios de mantenimiento y aseo"},
    {"name": "Bitácoras y Reportes Diarios", "description": "Reportes diarios de actividades y bitácoras de servicio"},
    {"name": "Inspecciones", "description": "Inspecciones de calidad, seguridad y cumplimiento"},
]


def create_app() -> FastAPI:
    application = FastAPI(
        title="SGI Platform API",
        description=(
            "API REST del **Sistema de Gestión Integral ISO 27001**.\n\n"
            "Plataforma empresarial para la gestión de seguridad de la información "
            "conformada por módulos de:\n"
            "- **Gestión organizacional**: procesos, activos, organigrama, RACI\n"
            "- **Documentos**: control documental con versionado y workflow\n"
            "- **Riesgos**: identificación, evaluación 5×5 y tratamientos\n"
            "- **Controles**: ISO 27001:2022 con declaración de aplicabilidad\n"
            "- **Incidentes**: registro, clasificación y timeline de seguimiento\n"
            "- **Auditorías**: planificación, hallazgos y acciones correctivas\n"
            "- **Capacitación**: cursos, inscripciones y evaluaciones\n"
            "- **IA**: asistente ISO, generación de políticas, análisis de brechas\n"
            "- **Reportes**: exportación Excel/PDF, widgets configurables\n\n"
            "Autenticación: JWT Bearer token\n"
            "RBAC: 4 roles predefinidos (admin, auditor, manager, user)"
        ),
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url=f"{settings.API_V1_PREFIX}/docs",
        redoc_url=f"{settings.API_V1_PREFIX}/redoc",
        openapi_tags=OPENAPI_TAGS,
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @application.get("/health", tags=["Health"], summary="Health check")
    def health_check():
        """Verifica que la API esté funcionando correctamente."""
        return {"status": "healthy", "version": settings.VERSION}

    return application


from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()

    db = await get_database()

    role_repo = RoleRepository(db)
    for role_data in DEFAULT_ROLES:
        existing = await role_repo.get_by_name(role_data["name"])
        if not existing:
            await role_repo.create(role_data)

    user_repo = UserRepository(db)
    admin = await user_repo.get_by_email("admin@sgi.local")
    if not admin:
        await user_repo.create({
            "email": "admin@sgi.local",
            "full_name": "Administrador",
            "hashed_password": hash_password("Admin123!"),
            "organization_id": None,
            "roles": ["admin"],
            "is_active": True,
        })
    elif not admin.get("roles"):
        await user_repo.update(str(admin["_id"]), {"roles": ["admin"]})

    org_repo = OrganizationRepository(db)

    # Emulated Service Company
    svc_org = await org_repo.get_by_nit("900123456-7")
    if not svc_org:
        svc_org = await org_repo.create({
            "name": "Servicios Totales S.A.S",
            "nit": "900123456-7",
            "description": "Empresa de servicios de mantenimiento y aseo",
            "address": "Calle 50 # 30-10",
            "phone": "601-2345678",
            "email": "contacto@serviciostotales.com",
        })
    svc_org_id = str(svc_org["_id"])

    # Coordinator User
    coord_user = await user_repo.get_by_email("coordinador@serviciostotales.com")
    if not coord_user:
        await user_repo.create({
            "email": "coordinador@serviciostotales.com",
            "full_name": "Carlos Coordinador",
            "hashed_password": hash_password("Coord123!"),
            "organization_id": svc_org_id,
            "roles": ["coordinador"],
            "is_active": True,
        })

    # Client 1
    client1 = await org_repo.get_by_nit("900987654-3")
    if not client1:
        client1 = await org_repo.create({
            "name": "Inversiones Alpha S.A",
            "nit": "900987654-3",
            "description": "Empresa de Tecnología",
            "address": "Carrera 7 # 40-62",
            "phone": "601-8765432",
            "email": "admin@alpha.com",
        })
    client1_id = str(client1["_id"])

    # Client 2
    client2 = await org_repo.get_by_nit("900555123-4")
    if not client2:
        client2 = await org_repo.create({
            "name": "Distribuciones Beta Ltda",
            "nit": "900555123-4",
            "description": "Logística y Distribución",
            "address": "Autopista Norte Km 15",
            "phone": "601-5551234",
            "email": "admin@beta.com",
        })
    client2_id = str(client2["_id"])

    # Client 3
    client3 = await org_repo.get_by_nit("900333789-0")
    if not client3:
        client3 = await org_repo.create({
            "name": "Corporación Gamma",
            "nit": "900333789-0",
            "description": "Sector Financiero",
            "address": "Calle 100 # 8-50",
            "phone": "601-3337890",
            "email": "admin@gamma.com",
        })
    client3_id = str(client3["_id"])

    # Client 1 Users
    c1_user = await user_repo.get_by_email("usuario1@alpha.com")
    if not c1_user:
        await user_repo.create({
            "email": "usuario1@alpha.com",
            "full_name": "Juan Perez",
            "hashed_password": hash_password("User123!"),
            "organization_id": client1_id,
            "roles": ["cliente_contacto"],
            "is_active": True,
        })

    # Client 2 Users
    c2_user = await user_repo.get_by_email("usuario1@beta.com")
    if not c2_user:
        await user_repo.create({
            "email": "usuario1@beta.com",
            "full_name": "Maria Rodriguez",
            "hashed_password": hash_password("User123!"),
            "organization_id": client2_id,
            "roles": ["cliente_contacto"],
            "is_active": True,
        })

    yield
    await close_db()


app = create_app()
