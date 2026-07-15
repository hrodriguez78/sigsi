# Demo: Procesos de Contratación — Empresa de Servicios de Mantenimiento y Aseo

## 1. Contexto del Escenario

Se emula una **empresa de servicios de mantenimiento y servicios generales de aseo** llamada **Servicios Totales S.A.S** que presta servicios a tres empresas clientes.

### 1.1 Organizaciones

| Organización | NIT | Tipo | Descripción |
|---|---|---|---|
| Servicios Totales S.A.S | 900123456-7 | Proveedor | Empresa de mantenimiento y aseo |
| Inversiones Alpha S.A | 900987654-3 | Cliente 1 | Empresa de Tecnología |
| Distribuciones Beta Ltda | 900555123-4 | Cliente 2 | Logística y Distribución |
| Corporación Gamma | 900333789-0 | Cliente 3 | Sector Financiero |

### 1.2 Usuarios Creados (Seed Automático)

| Email | Contraseña | Nombre | Organización | Rol |
|---|---|---|---|---|
| admin@sgi.local | Admin123! | Administrador | Global | admin |
| coordinador@serviciostotales.com | Coord123! | Carlos Coordinador | Servicios Totales | coordinador |
| usuario1@alpha.com | User123! | Juan Perez | Alpha | cliente_contacto |
| usuario1@beta.com | User123! | Maria Rodriguez | Beta | cliente_contacto |

> **Nota:** El seed se ejecuta automáticamente al iniciar el backend FastAPI. Los 7 operarios se crean mediante la API o el módulo de usuarios en el frontend.

---

## 2. Roles del Sistema

### 2.1 Roles Base (Predefinidos)

| Rol | Descripción | Permisos Principales |
|---|---|---|
| `admin` | Acceso total al sistema | Todos los permisos (40) |
| `auditor` | Auditor con acceso de lectura | Lectura + aprobación documentos + auditorías |
| `manager` | Gestión de módulos | Lectura + escritura en módulos operativos |
| `user` | Acceso básico | Solo lectura + incidentes |

### 2.2 Roles Específicos de la Demo

| Rol | Descripción | Permisos |
|---|---|---|
| `coordinador` | Coordinador de operaciones de mantenimiento y aseo | Procesos, activos, documentos, incidentes, capacitación, candidatos, lectura usuarios, **work_orders CRUD, daily_reports (leer/escribir/aprobar), inspections CRUD** |
| `operario` | Operario de servicios generales y aseo | Procesos (lectura), activos (lectura), incidentes (escritura), capacitación (lectura), **work_orders (leer/escribir), daily_reports (leer/escribir), inspections (lectura)** |
| `cliente_contacto` | Punto de contacto en empresa cliente | Organizaciones (lectura), procesos (lectura), documentos (lectura), incidentes (escritura), candidatos (lectura), **work_orders (leer/escribir), daily_reports (lectura), inspections (lectura)** |
| `cliente_observador` | Observador con acceso de solo lectura | Organizaciones (lectura), procesos (lectura), documentos (lectura), dashboard (lectura), candidatos (lectura), **work_orders (lectura), daily_reports (lectura), inspections (lectura)** |

---

## 3. Procesos de Contratación

### 3.1 Flujo del Pipeline de Selección

```
┌──────────┐    ┌──────────────┐    ┌───────────┐    ┌────────────┐    ┌───────────┐    ┌──────────┐
│  Nuevo   │ →  │ En Revisión  │ →  │ Aprobado  │ →  │Contratado  │    │ Rechazado │    │ Retirado │
│          │    │              │    │           │    │            │    │           │    │          │
└──────────┘    └──────────────┘    └───────────┘    └────────────┘    └───────────┘    └──────────┘
```

### 3.2 Estados del Candidato

| Estado | Descripción | Transiciones |
|---|---|---|
| `nuevo` | Candidato recién registrado | → en_revision, rechazado |
| `en_revision` | En proceso de evaluación | → aprobado, rechazado |
| `aprobado` | Aprobado para contratación | → contratado, rechazado |
| `rechazado` | No aprobado | Terminal |
| `contratado` | Contratado exitosamente | Terminal |
| `retirado` | Se retiró del proceso | Terminal |

### 3.3 Tipos de Documentos del Candidato

- `hoja_de_vida` — CV / Hoja de vida
- `cedula` — Cédula de ciudadanía
- `diploma` — Título o diploma
- `certificado` — Certificado profesional
- `certificado_medico` — Examen médico
- `foto` — Foto reciente
- `referencia` — Referencia laboral
- `otro` — Otros documentos

### 3.4 Tipos de Pruebas

- `psicometrico` — Prueba psicométrica
- `coeficiente_intelectual` — Test de IQ
- `tecnico` — Prueba técnica
- `personalidad` — Test de personalidad
- `ingles` — Prueba de inglés
- `otro` — Otra prueba

---

## 4. Procesos Organizacionales (Jerarquía)

### 4.1 Estructura Propuesta para Servicios Totales

```
Servicios Totales S.A.S (Org)
├── Gestión Estratégica
│   ├── Planeación
│   ├── Control Gestión
│   └── Mejora Continua
├── Gestión Operativa
│   ├── Servicios de Aseo
│   │   ├── Aseo Interior
│   │   ├── Aseo Exterior
│   │   └── Aseo Industrial
│   ├── Servicios de Mantenimiento
│   │   ├── Mantenimiento Preventivo
│   │   ├── Mantenimiento Correctivo
│   │   └── Mantenimiento Predictivo
│   └── Gestión de Calidad
├── Gestión de Talento Humano
│   ├── Procesos de Contratación
│   ├── Inducción y Capacitación
│   └── Evaluación de Desempeño
└── Gestión de Soporte
    ├── Logística
    ├── Compras
    └── TI
```

### 4.2 Procesos por Cliente

Cada cliente tiene sus propios procesos asociados a los servicios contratados:
- **Alpha (Tecnología):** Aseo diario, Mantenimiento de equipos
- **Beta (Logística):** Aseo industrial, Mantenimiento preventivo
- **Gamma (Financiero):** Aseo integral, Seguridad física

---

## 5. Flujo Completo de Contratación

### Paso 1: Crear Proceso de Contratación
```bash
POST /api/v1/processes
{
  "organization_id": "<svc_org_id>",
  "name": "Proceso de Contratación Operarios Aseo",
  "code": "CTR-ASEO-001",
  "process_type": "operativo",
  "description": "Selección de personal para servicios de aseo",
  "status": "activo"
}
```

### Paso 2: Registrar Candidato
```bash
POST /api/v1/candidates
{
  "organization_id": "<svc_org_id>",
  "process_id": "<process_id>",
  "full_name": "Pedro Operario",
  "email": "pedro@email.com",
  "phone": "310-1234567",
  "position_applied": "Operario de Aseo",
  "source": "referral"
}
```

### Paso 3: Agregar Documentos
```bash
POST /api/v1/candidates/<candidate_id>/documents
{
  "document_type": "hoja_de_vida",
  "file_name": "cv_pedro.pdf",
  "file_url": "/uploads/cv_pedro.pdf"
}
```

### Paso 4: Asignar Prueba
```bash
POST /api/v1/candidates/<candidate_id>/tests
{
  "test_type": "tecnico",
  "test_name": "Prueba Técnica de Aseo",
  "max_score": 100,
  "duration_minutes": 30
}
```

### Paso 5: Registrar Actividad de Seguimiento
```bash
POST /api/v1/candidates/<candidate_id>/activities
{
  "activity_type": "entrevista",
  "description": "Entrevista presencial con coordinador",
  "performed_by": "Carlos Coordinador"
}
```

### Paso 6: Actualizar Estado
```bash
PUT /api/v1/candidates/<candidate_id>
{
  "status": "aprobado",
  "notes": "Cumple todos los requisitos",
  "score": 85.0
}
```

### Paso 7: Contratar
```bash
PUT /api/v1/candidates/<candidate_id>
{
  "status": "contratado"
}
```

---

## 6. Credenciales de Acceso

### 6.1 Backend API
- **URL:** http://localhost:8000/docs
- **Health:** http://localhost:8000/health

### 6.2 Frontend
- **URL:** http://localhost:4200

### 6.3 Credenciales por Rol

| Rol | Email | Contraseña |
|---|---|---|
| Admin Global | admin@sgi.local | Admin123! |
| Coordinador | coordinador@serviciostotales.com | Coord123! |
| Cliente Alpha | usuario1@alpha.com | User123! |
| Cliente Beta | usuario1@beta.com | User123! |

### 6.4 Operarios (Crear vía API)

| # | Email Sugerido | Nombre |
|---|---|---|
| 1 | operario1@serviciostotales.com | Operario 1 |
| 2 | operario2@serviciostotales.com | Operario 2 |
| 3 | operario3@serviciostotales.com | Operario 3 |
| 4 | operario4@serviciostotales.com | Operario 4 |
| 5 | operario5@serviciostotales.com | Operario 5 |
| 6 | operario6@serviciostotales.com | Operario 6 |
| 7 | operario7@serviciostotales.com | Operario 7 |

---

## 7. Pruebas de Validación

### 7.1 Login y Obtener Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinador@serviciostotales.com","password":"Coord123!"}'
```

### 7.2 Listar Roles
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/roles
```

### 7.3 Listar Usuarios
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/users
```

### 7.4 Crear Candidato
```bash
curl -X POST http://localhost:8000/api/v1/candidates \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "<org_id>",
    "process_id": "<process_id>",
    "full_name": "Ana Limpieza",
    "email": "ana@email.com",
    "position_applied": "Operaria de Aseo",
    "source": "portal"
  }'
```

### 7.5 Ver Pipeline Stats
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/v1/candidates/pipeline-stats?organization_id=<org_id>"
```

---

## 8. Estructura Frontend

### 8.1 Módulos Implementados

| Módulo | Ruta | Descripción |
|---|---|---|
| Dashboard | `/dashboard` | Panel ejecutivo con KPIs |
| Órdenes de Trabajo | `/work-orders` | Gestión de OTs de mantenimiento y aseo |
| Reportes Diarios | `/daily-reports` | Bitácoras y reportes de servicio |
| Inspecciones | `/inspections` | Inspecciones de calidad y seguridad |
| Gestión Humana | `/gestion-humana` | Hub de gestión del talento |
| Candidatos | `/candidates` | Pipeline de selección completo |
| Usuarios | `/users` | CRUD de usuarios con roles |
| Capacitación | `/training` | Cursos y evaluaciones |
| Organigrama | `/orgchart` | Estructura jerárquica |
| Procesos | `/processes` | Árbol jerárquico de procesos |
| Incidentes | `/incidents` | Gestión de incidentes |

### 8.2 Roles por Navegación

- **Todos los usuarios:** Dashboard, Procesos, Incidentes
- **admin:** Todos los módulos incluyendo Usuarios y Roles
- **coordinador:** Candidatos, Capacitación, Gestión Humana
- **cliente_contacto:** Candidatos (lectura), Incidentes
- **cliente_observador:** Solo lectura

---

## 9. Procesos Operativos: Órdenes de Trabajo, Reportes Diarios e Inspecciones

### 9.1 Ciclo de Vida de una Orden de Trabajo

```
pendiente → programada → en_progreso → completada → verificada
                ↓              ↓              ↓
             en_espera      en_espera      cancelada
```

### 9.2 Estados de Órdenes de Trabajo

| Estado | Descripción | Transiciones |
|---|---|---|
| `pendiente` | OT creada sin programar | → programada, cancelada |
| `programada` | Asignada con fecha/hora | → en_progreso, en_espera, cancelada |
| `en_progreso` | Trabajo en ejecución | → completada, en_espera, cancelada |
| `en_espera` | Pausada por impedimento | → en_progreso, cancelada |
| `completada` | Trabajo finalizado | → verificada, en_progreso |
| `cancelada` | OT cancelada | Terminal |
| `verificada` | Verificada por coordinador | Terminal |

### 9.3 Tipos de Órdenes de Trabajo

| Tipo | Código | Descripción |
|---|---|---|
| Mantenimiento Preventivo | `mantenimiento_preventivo` | Revisiones programadas |
| Mantenimiento Correctivo | `mantenimiento_correctivo` | Reparación de fallas |
| Aseo Interior | `aseo_interior` | Limpieza de oficinas |
| Aseo Exterior | `aseo_exterior` | Limpieza de áreas exteriores |
| Aseo Industrial | `aseo_industrial` | Limpieza industrial |
| Emergencia | `emergencia` | Atención inmediata |
| Instalación | `instalacion` | Instalación de equipos |

### 9.4 Reportes Diarios (Bitácoras)

Los reportes diarios documentan las actividades realizadas en cada jornada laboral.

**Tipos de Reporte:**
- `bitacora_diaria` — Registro diario de actividades rutinarias
- `reporte_servicio` — Reporte específico de servicio prestado
- `reporte_mantenimiento` — Reporte de intervención de mantenimiento
- `reporte_calidad` — Reporte de control de calidad
- `reporte_incidente` — Reporte de incidente ocurrido

**Estados:**
- `borrador` → `enviado` → `revisado` → `aprobado` / `rechazado`

### 9.5 Inspecciones

Las inspecciones verifican el cumplimiento de estándares de calidad y seguridad.

**Tipos de Inspección:**
- `calidad` — Control de calidad del servicio
- `seguridad` — Seguridad física y lógica
- `ambiental` — Cumplimiento ambiental
- `operacional` — Verificación operativa
- `cumplimiento` — Cumplimiento normativo
- `seguridad_industrial` — Seguridad industrial

**Checklist:** Cada inspección tiene un checklist con ítems evaluados:
- `cumple` — Cumple con el estándar
- `no_cumple` — No cumple
- `no_aplicable` — No aplica
- `pendiente` — Sin evaluar

**Resultado:** `aprobado`, `no_aprobado`, `parcial`

---

## 10. Endpoints API — Procesos Operativos

### 10.1 Órdenes de Trabajo

```bash
# Listar OTs
GET /api/v1/work-orders?organization_id=<id>&page=1&page_size=20&status=&priority=&order_type=

# Crear OT
POST /api/v1/work-orders
{
  "organization_id": "<svc_id>",
  "client_organization_id": "<client_id>",
  "title": "Aseo integral oficinas piso 3",
  "description": "Limpieza completa",
  "order_type": "aseo_interior",
  "priority": "media",
  "assigned_to": "<operario_id>",
  "scheduled_date": "2025-07-15T08:00:00",
  "due_date": "2025-07-15T16:00:00",
  "location": "Torre Alpha, Piso 3"
}

# Actualizar OT
PUT /api/v1/work-orders/<id>
{ "status": "en_progreso" }

# Agregar comentario
POST /api/v1/work-orders/<id>/comments
{ "text": "Inicio de labores" }

# Estadísticas
GET /api/v1/work-orders/stats?organization_id=<id>
```

### 10.2 Reportes Diarios

```bash
# Listar reportes
GET /api/v1/daily-reports?organization_id=<id>&page=1&page_size=20&report_type=&status=

# Crear reporte
POST /api/v1/daily-reports
{
  "organization_id": "<svc_id>",
  "client_organization_id": "<client_id>",
  "report_type": "bitacora_diaria",
  "report_date": "2025-07-14",
  "reported_by": "Operario Uno",
  "title": "Bitácora diaria aseo piso 3",
  "activities_performed": ["Aspirado", "Fregado", "Aseo baños"],
  "hours_worked": 6.0,
  "materials_used": [{"name": "Limpiador", "quantity": "1 litro"}],
  "issues_found": ["Fuga en baño 2"]
}

# Estadísticas
GET /api/v1/daily-reports/stats?organization_id=<id>
```

### 10.3 Inspecciones

```bash
# Listar inspecciones
GET /api/v1/inspections?organization_id=<id>&page=1&page_size=20&inspection_type=&status=&result=

# Crear inspección
POST /api/v1/inspections
{
  "organization_id": "<svc_id>",
  "client_organization_id": "<client_id>",
  "inspection_type": "calidad",
  "title": "Inspección calidad aseo",
  "scheduled_date": "2025-07-16",
  "inspector_name": "Carlos Coordinador",
  "location": "Torre Alpha, Piso 3",
  "checklist": [
    {"description": "Pisos limpios", "status": "pendiente"},
    {"description": "Baños desinfectados", "status": "pendiente"}
  ]
}

# Actualizar resultado
PUT /api/v1/inspections/<id>
{
  "status": "completada",
  "result": "aprobado",
  "score": 92.5,
  "findings": ["Todo en orden"],
  "corrective_actions": []
}

# Estadísticas
GET /api/v1/inspections/stats?organization_id=<id>
```

---

## 11. Datos Demo Creados (Seed Operacional)

Se ejecuta con: `python3 scripts/seed_demo_operaciones.py`

### 11.1 Órdenes de Trabajo (7)

| OT | Tipo | Prioridad | Cliente | Estado |
|---|---|---|---|---|
| Aseo integral oficinas piso 3 | Aseo Interior | Media | Alpha | Programada |
| Mantenimiento preventivo A/C | Mant. Preventivo | Alta | Beta | En Progreso |
| Emergencia derrame servidor | Emergencia | Crítica | Gamma | Completada |
| Aseo exterior parqueadero | Aseo Exterior | Baja | Alpha | Pendiente |
| Mant. correctivo bomba agua | Mant. Correctivo | Alta | Beta | Verificada |
| Aseo industrial zona producción | Aseo Industrial | Media | Gamma | Programada |
| Instalación sistema filtración | Instalación | Media | Alpha | Pendiente |

### 11.2 Reportes Diarios (3)

| Reporte | Tipo | Estado |
|---|---|---|
| Emergencia derrame Gamma | Reporte Servicio | Aprobado |
| Mantenimiento bomba agua | Reporte Mantenimiento | Enviado |
| Bitácora aseo piso 3 | Bitácora Diaria | Borrador |

### 11.3 Inspecciones (3)

| Inspección | Tipo | Resultado | Estado |
|---|---|---|---|
| Calidad aseo piso 3 | Calidad | Pendiente | Programada |
| Mantenimiento A/C | Operacional | Parcial (78.5) | Completada |
| Seguridad sala servidores | Seg. Industrial | Aprobada (85.0) | Completada |

---

## 12. Checklist Pre-Producción

### Backend
- [x] Roles y permisos RBAC configurados
- [x] Usuarios demo creados (seed automático)
- [x] Endpoints CRUD funcionales
- [x] Autenticación JWT operativa
- [x] Pipeline de candidatos funcional
- [x] Documentos y pruebas de candidatos operativas
- [x] Actividades de seguimiento funcionales
- [x] Órdenes de trabajo CRUD + comentarios + estadísticas
- [x] Reportes diarios CRUD + estadísticas
- [x] Inspecciones CRUD + checklist + estadísticas

### Frontend
- [x] Módulo de Usuarios funcional
- [x] Módulo de Gestión Humana funcional
- [x] Pipeline de Candidatos funcional
- [x] Roles por navegación configurados
- [x] Dark mode y responsive
- [x] Login NgRx conectado
- [x] Módulo Órdenes de Trabajo (lista + detalle + comentarios)
- [x] Módulo Reportes Diarios (lista + detalle)
- [x] Módulo Inspecciones (lista + detalle + checklist)

### Infraestructura
- [x] Docker Compose funcional
- [x] MongoDB y PostgreSQL inicializados
- [x] Redis configurado
- [x] Nginx reverse proxy configurado
- [x] Health checks activos

### Documentación
- [x] Procesos documentados (este archivo)
- [x] API docs (Swagger en /docs)
- [x] Seed datos demo contratación (`scripts/seed_demo_contratacion.py`)
- [x] Seed datos demo operacionales (`scripts/seed_demo_operaciones.py`)
- [ ] Guía de usuario
- [ ] Guía de administración
