# Plan de Trabajo - Plataforma SGSI ISO 27001

## Estado General del Proyecto

| Estado | Descripción |
|--------|-------------|
| 🟢 Completado | Estructura repos, Docker Compose, JWT auth, CRUD org/procesos/activos/docs/riesgos/controles/incidentes/auditorías/capacitación, Angular full UI (layout + 16 feature modules), NgRx (16 stores), Dashboard con charts, Dark mode (31 SCSS files), Responsive, Búsqueda global, Roles/Permisos RBAC, Motor IA, Exportación Excel+PDF (8 módulos), Drag & Drop, Matriz RACI, Widgets configurables, Organigrama dinámico, OCR documentos, Kubernetes manifests + Helm chart |
| 🔲 Pendiente | — |

**Última actualización**: Julio 2026

---

## Estructura Real del Proyecto

```
sgi/
├── sgi-backend-fastapi/      # FastAPI (API REST + JWT)
│   ├── app/
│   │   ├── api/v1/endpoints/  # auth.py, organizations.py
│   │   ├── core/              # config.py, database.py
│   │   ├── models/            # (MongoDB schemas próximos)
│   │   ├── repositories/      # user_repo.py, organization_repo.py
│   │   ├── schemas/           # auth.py, organization.py
│   │   ├── services/          # auth.py (JWT + bcrypt)
│   │   └── main.py            # App entry + lifespan + seed admin
│   ├── Dockerfile
│   └── requirements.txt
│
├── sgi-django-admin/         # Django 4.2 (Admin + ORM)
│   ├── apps/
│   │   ├── core/              # TimeStampedModel base
│   │   ├── users/             # User model, serializers, views, URLs
│   │   └── organizations/     # Organization model, serializers, views, URLs
│   ├── config/settings/       # base.py, development.py, production.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── sgi-frontend-angular/     # Angular 17 (SPA)
│   ├── src/app/
│   │   ├── core/              # services, guards, interceptors
│   │   ├── features/
│   │   │   ├── auth/          # login, register
│   │   │   ├── dashboard/     # dashboard principal
│   │   │   └── organizations/ # CRUD organizaciones
│   │   └── shared/            # componentes compartidos
│   ├── Dockerfile
│   └── nginx.conf
│
├── sgi-infrastructure/       # Docker + Nginx + MongoDB init
│   ├── docker-compose.yml    # 7 servicios (Mongo, PG, Redis, FastAPI, Django, Angular, Nginx)
│   ├── docker-compose.prod.yml
│   ├── mongo-init.js         # 8 colecciones + índices
│   ├── nginx/nginx.conf      # Reverse proxy + rate limiting
│   └── scripts/              # start.sh, stop.sh, migrate.sh
│
└── .github/workflows/        # 8 workflows esenciales
    ├── ci.yml, deploy.yml, release.yml
    ├── codeql.yml, dependency-review.yml
    ├── scorecards.yml, stale.yml, sync-labels.yml
```

---

## APIs Implementadas

### FastAPI (`/api/v1/`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Crear cuenta (email, password, nombre) |
| `POST` | `/auth/login` | No | Obtener JWT |
| `GET` | `/auth/me` | Sí | Usuario actual |
| `POST` | `/organizations` | Sí | Crear organización |
| `GET` | `/organizations` | Sí | Listar (paginado, búsqueda) |
| `GET` | `/organizations/{id}` | Sí | Detalle organización |
| `PUT` | `/organizations/{id}` | Sí | Actualizar organización |
| `DELETE` | `/organizations/{id}` | Sí | Eliminar organización |
| `POST` | `/processes` | Sí | Crear proceso |
| `GET` | `/processes` | Sí | Listar procesos (filtrado por org, tipo, estado) |
| `GET` | `/processes/tree` | Sí | Árbol jerárquico de procesos |
| `GET` | `/processes/{id}` | Sí | Detalle proceso |
| `GET` | `/processes/{id}/children` | Sí | Sub-procesos directos |
| `PUT` | `/processes/{id}` | Sí | Actualizar proceso |
| `DELETE` | `/processes/{id}` | Sí | Eliminar proceso (valida hijos) |
| `POST` | `/assets` | Sí | Crear activo |
| `GET` | `/assets` | Sí | Listar activos (filtrado por tipo, criticidad, proceso) |
| `GET` | `/assets/stats` | Sí | Estadísticas (por tipo, criticidad, estado, avg CIA) |
| `GET` | `/assets/{id}` | Sí | Detalle activo |
| `PUT` | `/assets/{id}` | Sí | Actualizar activo |
| `DELETE` | `/assets/{id}` | Sí | Eliminar activo |
| `POST` | `/documents` | Sí | Crear documento |
| `GET` | `/documents` | Sí | Listar documentos (filtrado por tipo, estado, proceso) |
| `GET` | `/documents/{id}` | Sí | Detalle documento (con versiones y aprobaciones) |
| `GET` | `/documents/{id}/versions/{v}` | Sí | Obtener versión específica |
| `PUT` | `/documents/{id}` | Sí | Actualizar documento |
| `POST` | `/documents/{id}/versions` | Sí | Agregar nueva versión |
| `POST` | `/documents/{id}/approve` | Sí | Aprobar documento |
| `POST` | `/documents/{id}/reject` | Sí | Rechazar documento |
| `POST` | `/documents/{id}/publish` | Sí | Publicar documento |
| `POST` | `/documents/{id}/archive` | Sí | Archivar documento |
| `DELETE` | `/documents/{id}` | Sí | Eliminar documento |
| `POST` | `/risks` | Sí | Crear riesgo |
| `GET` | `/risks` | Sí | Listar riesgos (filtrado por categoría, nivel, estado) |
| `GET` | `/risks/matrix` | Sí | Matriz de riesgo 5×5 |
| `GET` | `/risks/stats` | Sí | Estadísticas de riesgos |
| `GET` | `/risks/{id}` | Sí | Detalle riesgo |
| `PUT` | `/risks/{id}` | Sí | Actualizar riesgo (recalcula nivel automáticamente) |
| `DELETE` | `/risks/{id}` | Sí | Eliminar riesgo |
| `POST` | `/risks/{id}/treatments` | Sí | Crear tratamiento |
| `GET` | `/risks/{id}/treatments` | Sí | Listar tratamientos |
| `POST` | `/controls` | Sí | Crear control ISO |
| `GET` | `/controls` | Sí | Listar controles (filtrado por categoría, estado, cumplimiento) |
| `GET` | `/controls/stats` | Sí | Estadísticas de controles |
| `GET` | `/controls/soa` | Sí | Declaración de Aplicabilidad |
| `GET` | `/controls/{id}` | Sí | Detalle control |
| `PUT` | `/controls/{id}` | Sí | Actualizar control |
| `DELETE` | `/controls/{id}` | Sí | Eliminar control |
| `POST` | `/controls/{id}/evidence` | Sí | Agregar evidencia |
| `GET` | `/controls/{id}/evidence` | Sí | Listar evidencias |
| `POST` | `/incidents` | Sí | Crear incidente |
| `GET` | `/incidents` | Sí | Listar incidentes (filtrado por severidad, estado, prioridad) |
| `GET` | `/incidents/stats` | Sí | Estadísticas (por tipo, severidad, estado, tiempo resolución) |
| `GET` | `/incidents/{id}` | Sí | Detalle incidente |
| `PUT` | `/incidents/{id}` | Sí | Actualizar incidente |
| `DELETE` | `/incidents/{id}` | Sí | Eliminar incidente |
| `POST` | `/incidents/{id}/comments` | Sí | Agregar comentario |
| `GET` | `/incidents/{id}/comments` | Sí | Listar comentarios |
| `POST` | `/audits` | Sí | Crear auditoría |
| `GET` | `/audits` | Sí | Listar auditorías |
| `GET` | `/audits/stats` | Sí | Estadísticas de auditorías |
| `GET` | `/audits/{id}` | Sí | Detalle auditoría |
| `PUT` | `/audits/{id}` | Sí | Actualizar auditoría |
| `DELETE` | `/audits/{id}` | Sí | Eliminar auditoría |
| `GET` | `/audits/{id}/findings` | Sí | Listar hallazgos |
| `POST` | `/audits/{id}/findings` | Sí | Crear hallazgo |
| `PUT` | `/audits/findings/{id}` | Sí | Actualizar hallazgo |
| `POST` | `/audits/findings/{id}/corrective-actions` | Sí | Crear acción correctiva |
| `PUT` | `/audits/corrective-actions/{id}` | Sí | Actualizar acción correctiva |
| `GET` | `/audits/{id}/checklist` | Sí | Lista de verificación |
| `POST` | `/audits/{id}/checklist` | Sí | Agregar item checklist |
| `GET` | `/ping` | No | Health check |
| `GET` | `/health` | No | Health check detallado |

### Django (`/api/v1/`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET/POST` | `/users/` | Admin | CRUD usuarios (DRF ViewSet) |
| `GET/PUT/DELETE` | `/users/{id}/` | Admin | Detalle/actualizar/eliminar usuario |
| `GET/POST` | `/organizations/` | Admin | CRUD organizaciones |
| `GET/PUT/DELETE` | `/organizations/{id}/` | Admin | Detalle/actualizar/eliminar |
| `GET` | `/health/` | No | Health check |

---

## Fases de Desarrollo

### Fase 1: Fundamentos (Semanas 1-4) — ✅ COMPLETADA

| # | Tarea | Estado |
|---|-------|--------|
| 1.1 | Docker Compose con 7 servicios | ✅ |
| 1.2 | Variables de entorno (.env.example) | ✅ |
| 1.3 | CI/CD básico (GitHub Actions) | ✅ |
| 1.4 | Esquemas MongoDB iniciales (mongo-init.js) | ✅ |
| 1.5 | Autenticación JWT (FastAPI) | ✅ |
| 1.6 | CRUD organizaciones (FastAPI) | ✅ |
| 1.7 | Django admin + DRF viewsets | ✅ |
| 1.8 | Angular auth module (login/register) | ✅ |
| 1.9 | Angular dashboard | ✅ |
| 1.10 | Angular organizations module | ✅ |
| 1.11 | Nginx reverse proxy + rate limiting | ✅ |
| 1.12 | Seed admin user (admin@sgi.local) | ✅ |

**Entregable**: Plataforma base funcional con auth y CRUD organizaciones.

---

### Fase 2: Core del SGSI (Semanas 5-12) — 🟡 EN PROGRESO

#### 2.1 Módulo de Gestión Organizacional
- [x] API de procesos (CRUD completo + tree jerárquico)
- [x] Schemas Pydantic (ProcessCreate/Update/Response)
- [x] Repository MongoDB (list, tree, children, CRUD)
- [x] Endpoints (create, list, tree, get, children, update, delete)
- [x] Colección MongoDB + índices en mongo-init.js
- [x] API de activos (CRUD completo + stats + CIA)
- [x] Schemas de activos (AssetCreate/Update/Response + CIAClassification)
- [x] Repository de activos (CRUD + stats por tipo/criticidad + aggregation pipeline)
- [x] Endpoints de activos (create, list, stats, get, update, delete)
- [x] Colección MongoDB + 5 índices en mongo-init.js
- [x] API de roles y permisos (CRUD + permisos + RBAC)
- [x] Matriz RACI (CRUD + vista cuadrícula + drag & drop roles/procesos)
- [x] Organigrama dinámico (CRUD positions + tree builder + Angular tree visualization)
- [x] Angular: componentes de procesos y activos (mejoras)

#### 2.2 Módulo de Documentos
- [x] API de documentos (CRUD + versionado + aprobación + publicación + archivado)
- [x] Schemas de documentos (DocumentCreate/Update/Version/Approval/Response)
- [x] Repository de documentos (CRUD + add_version + add_approval + publish + archive)
- [x] Endpoints (create, list, get, update, versions, approve, reject, publish, archive, delete)
- [x] Workflow de estados: borrador → en_revision → aprobado → publicado → archivado
- [ ] Almacenamiento de archivos (filesystem/S3)
- [ ] Angular: editor de documentos, historial de versiones

#### 2.3 Módulo de Inventario de Activos
- [x] Tipos de activos (hardware, software, información, servicios, red, personal, instalación)
- [x] Clasificación CIA (Confidencialidad, Integridad, Disponibilidad) - escala 1-5
- [x] Niveles de criticidad (bajo, medio, alto, crítico)
- [x] Stats por tipo, criticidad, estado y promedio CIA
- [x] Relación activos-procesos (process_id)
- [ ] Relación activos-riesgos-controles
- [ ] Angular: catálogo de activos con filtros

#### 2.2 Módulo de Documentos
- [ ] API de gestión documental
- [ ] Versionado de documentos
- [ ] Workflow de aprobación
- [ ] Firmas digitales
- [ ] Almacenamiento: MongoDB (metadatos) + filesystem/S3 (archivos)
- [ ] Angular: editor de documentos, historial

#### 2.3 Módulo de Inventario de Activos
- [ ] Tipos de activos (hardware, software, información, servicios)
- [ ] Clasificación CIA (Confidencialidad, Integridad, Disponibilidad)
- [ ] Relación activos-riesgos-controles
- [ ] Angular: catálogo de activos con filtros

---

### Fase 3: Gestión de Riesgos (Semanas 13-20) — ✅ COMPLETADA

#### 3.1 Módulo de Riesgos
- [x] API de riesgos (CRUD + matrix + stats + tratamientos)
- [x] Cálculo automático de nivel de riesgo (probabilidad × impacto)
- [x] Matrices de riesgo (5×5 ISO 27005/31000)
- [x] Mapa de calor con conteo por celda
- [x] Stats: por nivel, categoría, estado, score promedio, top 5 riesgos
- [x] Tratamientos: crear, listar por riesgo (mitigar/transferir/evitar/aceptar)
- [x] NgRx store (actions, reducer, effects, selectors)

#### 3.2 Módulo de Controles ISO 27001:2022
- [x] API de controles (CRUD + stats + SoA + evidencias)
- [x] 4 categorías: organizativo, personas, físico, tecnológico
- [x] Estados: no_iniciado, en_progreso, implementado, efectivo, no_aplicable
- [x] Niveles cumplimiento: total, parcial, mínimo, ninguno, no_evaluado
- [x] Declaración de Aplicabilidad (SoA) automática
- [x] Evidencias por control (documentos, archivos)
- [x] Stats: por categoría, estado, cumplimiento, % implementación
- [x] NgRx store (actions, reducer, effects, selectors)

---

### Fase 4: Operaciones (Semanas 21-28) — ✅ COMPLETADA

#### 4.1 Módulo de Incidentes
- [x] API de incidentes (CRUD + comments + stats)
- [x] 9 tipos: seguridad, disponibilidad, brecha_datos, malware, phishing, etc.
- [x] 4 severidades × 4 prioridades (P1-P4)
- [x] Workflow: abierto → en_investigación → contenido → erradicado → recuperado → cerrado
- [x] Comentarios por incidente (timeline)
- [x] Stats: por tipo, severidad, estado, tiempo promedio resolución, abiertos
- [x] NgRx store

#### 4.2 Módulo de Auditorías
- [x] API de auditorías (CRUD + findings + corrective_actions + checklist)
- [x] 4 tipos: interna, externa, proveedor, autoevaluación
- [x] Hallazgos: no_conformidad, observación, oportunidad_mejora, buena_práctica
- [x] Acciones correctivas con seguimiento (abierta → en_progreso → completada → verificada → cerrada)
- [x] Lista de verificación vinculada a controles
- [x] Stats: por tipo, estado, resumen hallazgos
- [x] NgRx store

#### 4.3 Módulo de Capacitación
- [x] API de cursos y evaluaciones (CRUD + inscripciones + stats)
- [x] 6 categorías: concienciación, técnico, cumplimiento, liderazgo, emergencias, otro
- [x] Estados curso: borrador, publicado, en_curso, completado, archivado
- [x] Estados inscripción: inscrito, en_curso, completado, reprobado, cancelado
- [x] Seguimiento de inscripciones por curso
- [x] Stats: por categoría, estado, tasa completación, promedio puntaje
- [x] NgRx store (actions, reducer, effects, selectors)
- [x] Angular: módulo completo (list + detail + form)

---

### Fase 5: Inteligencia Artificial (Semanas 29-36) — ✅ COMPLETADA

- [x] Generación de políticas/procedimientos con IA
- [x] Asistente ISO (chat integrado)
- [x] Análisis de brechas automático
- [x] OCR para documentos escaneados (Tesseract + Poppler)
- [x] Recomendaciones automáticas de controles

---

### Fase 6: Dashboards y Reporting (Semanas 37-40) — ✅ COMPLETADA

- [x] KPIs y KRIs ejecutivos
- [x] Gráficos interactivos (Chart.js)
- [x] Exportación de reportes Excel (8 módulos)
- [x] Exportación de reportes PDF (8 módulos con reportlab)
- [x] Widgets configurables por usuario (16 widgets, drag & drop, persistencia MongoDB)
- [x] Dashboard de cumplimiento por norma

---

### Fase 7: Frontend Angular Completo (Paralelo desde Fase 2) — ✅ COMPLETADA

| Tarea | Estado |
|-------|--------|
| Shell con routing lazy-loaded | ✅ |
| Guards de autenticación | ✅ |
| Interceptors HTTP (JWT) | ✅ |
| Login/Register | ✅ |
| Dashboard principal | ✅ |
| CRUD Organizaciones | ✅ |
| Auth service (login/logout/token) | ✅ |
| Toast service (notificaciones) | ✅ |
| Componente DataTable reutilizable | ✅ |
| Componente ConfirmDialog | ✅ |
| Componente PageHeader | ✅ |
| Componente LoadingSpinner | ✅ |
| Componente ToastContainer | ✅ |
| Componente Pagination | ✅ |
| Layout con sidebar navegación | ✅ |
| Directiva hasRole | ✅ |
| Directiva tooltip | ✅ |
| Pipe truncate | ✅ |
| Pipe timeAgo | ✅ |
| SharedModule (exporta todo) | ✅ |
| NgRx Auth state | ✅ |
| NgRx Organizations state | ✅ |
| NgRx Processes state | ✅ |
| NgRx Assets state | ✅ |
| NgRx Documents state | ✅ |
| NgRx Risks state | ✅ |
| NgRx Controls state | ✅ |
| NgRx Incidents state | ✅ |
| NgRx Audits state | ✅ |
| NgRx Training state | ✅ |
| NgRx RACI state | ✅ |
| NgRx Widgets state | ✅ |
| NgRx OrgChart state | ✅ |
| Store devtools | ✅ |
| Models (interfaces TS: User, Org, Process, Asset, Document, Risk, Control, Incident, Audit, Course, Enrollment, WidgetConfig, OrgPosition, RaciMatrix) | ✅ |
| Feature: Procesos (list + detail + form) | ✅ |
| Feature: Activos (list + detail + form + CIA visualization) | ✅ |
| Feature: Documentos (list + detail + form + versioning + workflow) | ✅ |
| Feature: Riesgos (list + detail + form + matrix 5×5) | ✅ |
| Feature: Controles (list + detail + form + SoA) | ✅ |
| Feature: Incidentes (list + detail + form + comments) | ✅ |
| Feature: Auditorías (list + detail + form + findings + checklist) | ✅ |
| Feature: Capacitación (list + detail + form) | ✅ |
| Feature: Matriz RACI (list + matrix view + form) | ✅ |
| Feature: Organigrama (tree view + CRUD positions) | ✅ |
| Feature: OCR (drag & drop upload + multi-idioma) | ✅ |
| Modo oscuro/claro | ✅ |
| Responsive design completo | ✅ |
| Búsqueda global | ✅ |
| Drag & Drop (checklist auditorías + widgets + RACI + organigrama) | ✅ |
| Roles/Permisos (NgRx + feature) | ✅ |
| Dashboard con charts (Chart.js) + Widgets configurables | ✅ |
| IA - Chat asistente ISO | ✅ |
| IA - Generador de políticas | ✅ |
| IA - Análisis de brechas | ✅ |
| OCR documentos (Tesseract + Poppler) | ✅ |
| Exportación PDF (reportlab, 8 módulos) | ✅ |
| Kubernetes (manifests + Helm chart) | ✅ |

---

## Tecnologías en Uso

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| FastAPI | 0.109.2 | API REST principal |
| Django | 4.2.11 | Admin panel + ORM |
| Motor | 3.3.2 | MongoDB async |
| python-jose | 3.3.0 | JWT tokens |
| passlib + bcrypt | 1.7.4 | Password hashing |
| DRF | 3.15.1 | Django REST framework |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular | 17.x | SPA framework |
| Angular Material | - | Componentes UI |
| RxJS | - | Reactive programming |
| TypeScript | - | Type safety |
| NgRx | 17.x | State management |
| Chart.js + ng2-charts | 5.x | Gráficos interactivos |

### Infraestructura
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Docker Compose | 3.8 | Orquestación local |
| MongoDB | 7 | Base de datos NoSQL |
| PostgreSQL | 15 | Base de datos relacional |
| Redis | 7 | Cache + sesiones |
| Nginx | Alpine | Reverse proxy + SSL |

---

## Endpoints Próximos a Implementar

### Prioridad Alta (Fase 2)
```
# Procesos
POST   /api/v1/processes              # Crear proceso
GET    /api/v1/processes              # Listar procesos
GET    /api/v1/processes/{id}         # Detalle
PUT    /api/v1/processes/{id}         # Actualizar
DELETE /api/v1/processes/{id}         # Eliminar

# Activos
POST   /api/v1/assets                 # Crear activo
GET    /api/v1/assets                 # Listar activos
GET    /api/v1/assets/{id}            # Detalle
PUT    /api/v1/assets/{id}            # Actualizar
DELETE /api/v1/assets/{id}            # Eliminar

# Documentos
POST   /api/v1/documents              # Crear documento
GET    /api/v1/documents              # Listar documentos
GET    /api/v1/documents/{id}         # Detalle
PUT    /api/v1/documents/{id}         # Actualizar
DELETE /api/v1/documents/{id}         # Eliminar
POST   /api/v1/documents/{id}/versions  # Crear versión
```

### Prioridad Media (Fase 3)
```
# Riesgos
POST   /api/v1/risks                  # Crear riesgo
GET    /api/v1/risks                  # Listar riesgos
GET    /api/v1/risks/{id}             # Detalle
PUT    /api/v1/risks/{id}             # Actualizar
GET    /api/v1/risks/matrix           # Matriz de riesgo
GET    /api/v1/risks/heatmap          # Mapa de calor

# Controles
GET    /api/v1/controls               # Listar controles ISO 27001
GET    /api/v1/controls/{id}          # Detalle control
PUT    /api/v1/controls/{id}/status   # Actualizar estado
POST   /api/v1/controls/{id}/evidence # Subir evidencia
```

---

## Próximos Pasos Inmediatos

### Pendientes de bajo perfil
1. ✅ OCR para documentos escaneados (Fase 5) — COMPLETADO
2. ✅ Widgets configurables por usuario (Fase 6) — COMPLETADO
3. ✅ Exportación PDF adicional — COMPLETADO
4. ✅ Matriz RACI (Fase 2.1) — COMPLETADO
5. ✅ Organigrama dinámico (Fase 2.1) — COMPLETADO
6. ✅ Kubernetes deployment — COMPLETADO

### Próximo
7. ✅ Tests unitarios y de integración (pytest + async) — COMPLETADO
8. 🔲 Documentación API interactiva (Swagger mejorado) — EN PROGRESO
9. 🔲 Monitoreo (Prometheus + Grafana)
10. ✅ CI/CD pipeline (GitHub Actions: lint, test, build, deploy) — COMPLETADO

---

## Equipo Actual

| Rol | Responsabilidades |
|-----|-------------------|
| Full-stack Developer | Backend FastAPI/Django, Frontend Angular, DevOps |

---

## Métricas de Éxito

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Módulos implementados | 100% del SGSI | 100% (12/12 módulos funcionales) |
| Tiempo respuesta API | <200ms (95%) | Sin medir |
| Disponibilidad | 99.9% uptime | Sin medir |
| Vulnerabilidades críticas | 0 | Sin medir |
| Documentación APIs | 100% documentadas | 90% (OpenAPI auto + roles + AI) |

---

## Historial de Cambios

| Fecha | Cambio |
|-------|--------|
| Jul 2026 | Creada estructura inicial de 4 repositorios |
| Jul 2026 | Implementado JWT auth + CRUD organizaciones (FastAPI) |
| Jul 2026 | Implementado Django admin + DRF viewsets |
| Jul 2026 | Implementado Angular auth + dashboard + organizations |
| Jul 2026 | Configurado Docker Compose con 7 servicios |
| Jul 2026 | Limpiados 146 workflows excesivos, quedan 8 esenciales |
| Jul 2026 | Seed automático de admin user (admin@sgi.local) |
| Jul 2026 | Implementado módulo de procesos (CRUD + tree jerárquico) |
| Jul 2026 | Creados 6 componentes shared Angular (DataTable, Dialog, Header, Spinner, Toast, Pagination) |
| Jul 2026 | Creadas 2 directivas (hasRole, tooltip) + 2 pipes (truncate, timeAgo) |
| Jul 2026 | Creado AuthService + ToastService para Angular |
| Jul 2026 | Configurado NgRx (auth, organizations, processes stores + effects + selectors) |
| Jul 2026 | Creados TypeScript interfaces (User, Organization, Process, Toast, etc.) |
| Jul 2026 | Implementado módulo de activos (CRUD + stats + clasificación CIA + 7 tipos) |
| Jul 2026 | Implementado módulo de documentos (CRUD + versionado + aprobación + publicación) |
| Jul 2026 | Creado NgRx store para activos y documentos (actions, reducer, effects, selectors) |
| Jul 2026 | Agregadas interfaces TS: Asset, Document, DocumentDetail, CIAClassification |
| Jul 2026 | Implementado módulo de riesgos (CRUD + matrix 5×5 + tratamientos + cálculo automático) |
| Jul 2026 | Implementado módulo de controles ISO 27001:2022 (CRUD + SoA + evidencias + stats) |
| Jul 2026 | Implementado módulo de incidentes (CRUD + comments + stats + tiempo resolución) |
| Jul 2026 | Implementado módulo de auditorías (CRUD + hallazgos + acciones correctivas + checklist) |
| Jul 2026 | Creados NgRx stores: risks, controls, incidents, audits (actions, reducers, effects, selectors) |
| Jul 2026 | Agregadas interfaces TS: Risk, Control, Incident, Audit |
| Jul 2026 | Agregados 15+ índices MongoDB para riesgos, controles, incidentes, auditorías |
| Jul 2026 | Corregidos bugs críticos: interfaces Course/Enrollment, currentUser$, store exports |
| Jul 2026 | Implementado RBAC completo: schemas, repo, endpoints roles, JWT con roles, seed roles |
| Jul 2026 | Frontend: NgRx roles store, RolesModule, RoleGuard, filtrado sidebar por roles |
| Jul 2026 | Dashboard ejecutivo: backend endpoints (stats/kpis/trends) + frontend con Chart.js |
| Jul 2026 | Dark mode: ThemeService, CSS variables, toggle en topbar |
| Jul 2026 | Responsive design: sidebar mobile, breakpoints, layout adaptable |
| Jul 2026 | Búsqueda global: backend search endpoint + SearchComponent con Ctrl+K |
| Jul 2026 | Motor IA: backend (chat, policy generation, gap analysis, recommendations) |
| Jul 2026 | Frontend IA: AIModule con chat, generador políticas, análisis brechas |
| Jul 2026 | MongoDB: colección roles + índices |
| Jul 2026 | Dark mode: CSS variables aplicadas a todos los 31 archivos SCSS de componentes |
| Jul 2026 | Proceso detail: visualización de árbol jerárquico con tarjetas navegables |
| Jul 2026 | Incidentes: corrección FontAwesome → Material Icons en botones de acción |
| Jul 2026 | Nginx: timeout increase para endpoints IA (120s proxy_read_timeout) |
| Jul 2026 | Docker Compose: servicio Ollama añadido para motor IA local |
| Jul 2026 | Mongo-init: colecciones roles, ai_chat_sessions, ai_suggestions con índices |
| Jul 2026 | Angular build fix: corregidos 20+ errores TypeScript (modelos, store, templates, pipes) |
| Jul 2026 | Exportación Excel backend: servicio export.py + endpoint /api/v1/export/{module} (openpyxl) |
| Jul 2026 | Exportación Excel frontend: ExportService + botones en 7 listas (riesgos, incidentes, controles, auditorías, capacitación, documentos, activos) |
| Jul 2026 | Drag & Drop: checklist de auditorías reordenable con @angular/cdk/drag-drop |
| Jul 2026 | Nginx: location dedicado /api/v1/export/ con buffering off y timeout 300s |
| Jul 2026 | Infraestructura: verificación Docker Compose (8 servicios), package-lock.json confirmado |
| Jul 2026 | Matriz RACI backend: schema + repository + endpoints CRUD (GET/POST/PUT/DELETE) |
| Jul 2026 | Matriz RACI frontend: NgRx store (actions, reducer, effects, selectors) |
| Jul 2026 | Matriz RACI frontend: feature module con list, matrix view (cuadrícula clicable), form |
| Jul 2026 | Matriz RACI: drag & drop para reordenar procesos y roles con @angular/cdk |
| Jul 2026 | Matriz RACI: integración en routing, sidebar, mongo-init.js (colección + índices) |
| Jul 2026 | Matriz RACI: añadido a exportación Excel con hoja de detalle de asignaciones |
| Jul 2026 | Widgets configurables: backend (schema + repo + endpoints) + frontend (NgRx store, 7 widget components, grid drag & drop con CDK, panel de configuración) |
| Jul 2026 | Widgets: 16 widgets (8 stat cards, 4 KPI, risk chart, trend chart, compliance chart, incident summary) con persistencia por usuario |
| Jul 2026 | Organigrama dinámico: backend (positions CRUD + tree builder) + frontend (NgRx store, recursive org-node component, tree visualization, CRUD form) |
| Jul 2026 | Exportación PDF: backend con reportlab (8 módulos) + frontend service actualizado para xlsx/pdf |
| Jul 2026 | OCR documentos: backend (pytesseract + Pillow + pdf2image) + frontend (drag & drop upload, multi-idioma, copy to clipboard) |
| Jul 2026 | Dockerfile actualizado: Tesseract OCR (spa+eng) + Poppler-utils para PDF |
| Jul 2026 | Kubernetes: namespace, secrets, configmap, deployments (FastAPI, Django, Nginx, MongoDB, PostgreSQL, Redis, Ollama), HPA, Ingress, Service |
| Jul 2026 | Helm chart: Chart.yaml + values.yaml + templates (namespace, secrets, configmap, fastapi, nginx, ingress) |
| Jul 2026 | Build exitoso: 17 lazy modules, 473 kB initial, todos los features compilados |
| Jul 2026 | Tests backend: conftest (fixtures mock DB, auth, org) + 3 archivos de test (auth, orgs, features — 35+ tests) |
| Jul 2026 | CI/CD pipeline: GitHub Actions (lint-backend, test-backend, build-backend, lint-frontend, build-frontend, deploy-staging, deploy-production) |
| Jul 2026 | Code quality: Security scan (Trivy), dependency review, OpenSSF Scorecard |
| Jul 2026 | Swagger mejorado: 19 tags documentados, descripción extensa de la API, openapi_tags en FastAPI |
| Jul 2026 | Ruff config: ruff.toml para linting Python (target py311, line-length 120) |
| Jul 2026 | Monitoreo: Prometheus (prometheus.yml + 6 alert rules) + Grafana (9-panel dashboard + datasource provisioning) + docker-compose monitoring stack |
| Jul 2026 | Tests frontend: Jasmine specs (auth, export, widget, theme, toast services + widgets/orgchart reducers + dashboard component) |
| Jul 2026 | Performance testing: k6 load test (50 VUs, 3min) + stress test (200 VUs spike) |
| Jul 2026 | Backup MongoDB: backup.sh (daily/weekly/monthly/restore/cleanup) + crontab + docker-compose backup service |
| Jul 2026 | Build fix: tsconfig.app.json excluye spec files, corrección tipos OrgTreeNode y ToastService en specs |
| Jul 2026 | Build final verificado: 473 kB initial, 17 lazy modules, 27s bundle generation |
