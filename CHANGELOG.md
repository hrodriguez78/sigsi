# Changelog - SGI Platform

## [1.0.0] - 2026-07-12

### Added
- Estructura completa del proyecto con 4 repositorios separados
- **sgi-backend-fastapi**: API REST con FastAPI 0.109+ y Python 3.11
  - Configuración de FastAPI con routers versionados
  - Conexión a MongoDB con Motor (async)
  - Configuración de entorno con pydantic-settings
  - Dockerfile optimizado
  - Tests básicos
  - Documentación README

- **sgi-django-admin**: Panel de administración con Django 4.2
  - Modelo de Usuario personalizado
  - Modelo de Organización
  - Settings por ambiente (base, development, production)
  - Admin personalizado
  - Dockerfile optimizado
  - Documentación README

- **sgi-frontend-angular**: Frontend SPA con Angular 17
  - Módulo de autenticación (Login/Register)
  - Módulo de Dashboard con estadísticas
  - Módulo de Organizaciones (CRUD)
  - Servicios core (API, Auth)
  - Guards e interceptors de autenticación
  - Estilos globales SCSS
  - Dockerfile multi-stage con Nginx
  - Documentación README

- **sgi-infrastructure**: Infraestructura Docker
  - docker-compose.yml con 7 servicios
  - MongoDB 7 con inicialización automática
  - PostgreSQL 15
  - Redis 7
  - Nginx reverse proxy
  - Scripts de utilidad (start, stop, migrate, create-superuser)
  - Variables de entorno configurables
  - Documentación README

- Documentación del proyecto
  - README.md principal
  - ESTRUCTURA.md: Estructura detallada
  - ARQUITECTURA.md: Arquitectura técnica
  - COMANDOS.md: Comandos útiles
  - VERIFICACION.md: Verificación de servicios
  - INICIO_RAPIDO.md: Guía de inicio rápido
  - TAREAS.md: Lista de tareas pendientes
  - DESARROLLO.md: Guía de desarrollo
  - DESPLIEGUE.md: Guía de despliegue
  - TROUBLESHOOTING.md: Solución de problemas
  - CHANGELOG.md: Este archivo

- Scripts de utilidad
  - check-prerequisites.sh: Verificar prerrequisitos
  - start.sh: Iniciar plataforma
  - stop.sh: Detener plataforma
  - migrate.sh: Ejecutar migraciones Django
  - create-superuser.sh: Crear superusuario Django

### Changed
- N/A (versión inicial)

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- Configuración de variables de entorno para secretos
- Dockerfile sin usuario root
- Configuración de CORS
- Rate limiting en Nginx

## [1.1.0] - 2026-07-13

### Added
- Login completo conectado a NgRx (frontend Angular)
- .env para sgi-infrastructure con variables de entorno
- Docker Compose funcional (MongoDB, PostgreSQL, Redis, Backend FastAPI)
- Seed automático de admin user (admin@sgi.local) en FastAPI

### Fixed
- `IncidentPriority.P3_MEDIO` corregido a `IncidentPriority.P3` (enum inexistente)
- Imports rotos en `widgets.py` y `orgchart.py`: `from app.core.database import db` → `get_database()`
- Import roto en `ocr.py`: `from app.services.auth` → `from app.api.v1.endpoints.auth`
- Compatibilidad `passlib==1.7.4` con `bcrypt`: fijado `bcrypt==4.0.1` (bcrypt 5.x incompatible)
- `UserLogin` schema: `EmailStr` → `str` (rechazaba dominios `.local`)

### Security
- Password hashing con bcrypt 4.0.1 (fijado para compatibilidad con passlib)
- Admin seed credentials documentadas: admin@sgi.local / Admin123! (solo desarrollo)

## [Unreleased]

### Planned
- Implementación de autenticación JWT completa
- Esquemas MongoDB completos para el SGSI
- Módulos del SGSI (Documentos, Inventario, Riesgos, etc.)
- Integración de IA
- Dashboards ejecutivos
- CI/CD con GitHub Actions
- Despliegue con Kubernetes
- Monitoreo con Prometheus/Grafana

---

## Convención de Versiones

Esta plataforma sigue [Semantic Versioning](https://semver.org/).

- **MAJOR**: Cambios incompatibles con la API
- **MINOR**: Agregar funcionalidad de manera compatible
- **PATCH**: Correcciones de bugs compatibles