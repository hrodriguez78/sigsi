# SGI Platform

Sistema de Gestión de Seguridad de la Información - Plataforma para implementar y administrar ISO 27001:2022.

[![CI](https://github.com/tu-usuario/sgi-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/tu-usuario/sgi-platform/actions/workflows/ci.yml)
[![License: Propietaria](https://img.shields.io/badge/License-Propietaria-red.svg)](./LICENSE)

## Descripción

SGI Platform es una plataforma empresarial tipo GRC (Governance, Risk & Compliance) diseñada para implementar, administrar y mantener un Sistema de Gestión de Seguridad de la Información (SGSI) completo según ISO 27001:2022.

### Características Principales

- **Multi-norma**: Soporte para ISO 27001, ISO 9001, ISO 20000, ISO 22301, y muchas más
- **Modular**: Arquitectura basada en microservicios
- **Escalable**: Docker + Kubernetes para despliegue en la nube
- **Seguro**: Zero Trust, MFA, RBAC, ABAC
- **IA Integrada**: Asistente ISO, generación automática de documentos
- **Multi-idioma**: Soporte para español, inglés y más

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                       │
└───────┬───────────────────┬───────────────────┬─────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Frontend    │  │  FastAPI API  │  │ Django Admin  │
│   Angular 17  │  │   Python 3.11 │  │  Python 3.11  │
└───────────────┘  └───────┬───────┘  └───────┬───────┘
                           │                   │
                           ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BASES DE DATOS                             │
├────────────────────────┬────────────────┬───────────────────────┤
│      MongoDB 7         │  PostgreSQL 15 │       Redis 7         │
│   (NoSQL Principal)    │ (Relacional)   │      (Cache)          │
└────────────────────────┴────────────────┴───────────────────────┘
```

## Repositorios

| Repositorio | Descripción | Tecnología |
|-------------|-------------|------------|
| [sgi-backend-fastapi](./sgi-backend-fastapi) | API REST principal | Python 3.11, FastAPI 0.109+ |
| [sgi-django-admin](./sgi-django-admin) | Panel de administración | Python 3.11, Django 4.2 |
| [sgi-frontend-angular](./sgi-frontend-angular) | Frontend SPA | Angular 17, TypeScript |
| [sgi-infrastructure](./sgi-infrastructure) | Infraestructura Docker | Docker, Nginx |

## Inicio Rápido

### Prerrequisitos

- Docker 24+
- Docker Compose 2.20+
- Git

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/sgi-platform.git
cd sgi-platform

# Verificar prerrequisitos
./scripts/check-prerequisites.sh

# Copiar variables de entorno
cp .env.example .env

# Iniciar plataforma
cd sgi-infrastructure
./scripts/start.sh
```

### Servicios Disponibles

Una vez iniciado, tendrás acceso a:

- **Frontend**: http://localhost:4200
- **FastAPI Docs**: http://localhost:8000/docs
- **Django Admin**: http://localhost:8001/admin
- **Nginx**: http://localhost:80

## Desarrollo

### Estructura del Proyecto

```
sgi-platform/
├── sgi-backend-fastapi/     # API REST (FastAPI)
├── sgi-django-admin/        # Admin panel (Django)
├── sgi-frontend-angular/    # Frontend SPA (Angular)
├── sgi-infrastructure/      # Docker e infraestructura
├── scripts/                 # Scripts de utilidad
├── plan.md                  # Especificación funcional
├── plan de trabajo.md       # Plan de implementación
├── README.md                # Este archivo
├── CONTRIBUTING.md          # Guía de contribución
├── CHANGELOG.md             # Historial de cambios
├── LICENSE                  # Licencia Propietaria SaaS
└── .github/                 # GitHub Actions, templates
```

### Backend FastAPI

```bash
cd sgi-backend-fastapi
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Django Admin

```bash
cd sgi-django-admin
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Angular

```bash
cd sgi-frontend-angular
npm install
npm start
```

## Comandos Docker

```bash
# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir
docker-compose up -d --build

# Acceder a MongoDB
docker-compose exec mongodb mongosh -u admin -p admin

# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d sgi_db
```

## Normas Soportadas

### ISO
- ISO 27001:2022
- ISO 27002
- ISO 27005
- ISO 31000
- ISO 9001
- ISO 20000
- ISO 22301
- ISO 42001
- ISO 27701
- ISO 14001
- ISO 45001
- ISO 37301

### Otras
- NIST CSF
- NIST 800-53
- CIS Controls
- COBIT
- ITIL
- OWASP ASVS
- OWASP SAMM
- MITRE ATT&CK
- DORA
- PCI DSS
- HIPAA
- GDPR
- Ley 1581 de Colombia
- Decreto 1377
- Ley 1266
- Ley 1273

## Documentación

- [Guía de Inicio Rápido](./INICIO_RAPIDO.md)
- [Estructura del Proyecto](./ESTRUCTURA.md)
- [Arquitectura Técnica](./ARQUITECTURA.md)
- [Guía de Desarrollo](./DESARROLLO.md)
- [Guía de Despliegue](./DESPLIEGUE.md)
- [Comandos Útiles](./COMANDOS.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## Contribuir

¡Contribuciones bienvenidas! Por favor lee nuestra [guía de contribución](./CONTRIBUTING.md) antes de enviar un Pull Request.

## Licencia

Este proyecto utiliza una **Licencia Propietaria con modelo SaaS** (pago por usuarios). Consulte el archivo [LICENSE](./LICENSE) para los terminos completos.

- **Uso:** Solo con suscripcion activa (mensual/anual por usuario)
- **Titular:** H Javier Rodriguez Guzman
- **Contacto:** hjavierrodriguezg@gmail.com | +573014777334

## Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/sgi-platform/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/sgi-platform/wiki)
- **Email**: soporte@sgi-platform.com

## Agradecimientos

- Equipo de desarrollo
- Comunidad open source
- Todos los contribuidores