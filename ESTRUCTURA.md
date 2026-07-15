# Estructura del Proyecto SGI Platform

## Resumen

Se ha creado la estructura completa del proyecto con 4 repositorios separados:

### 1. sgi-backend-fastapi
**API REST principal con FastAPI**

```
sgi-backend-fastapi/
├── app/
│   ├── api/v1/           # Endpoints REST
│   ├── core/             # Config, database, security
│   ├── models/           # MongoDB models (Motor)
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── repositories/     # Database access
│   └── main.py           # FastAPI app
├── tests/
├── requirements.txt
├── Dockerfile
└── README.md
```

**Tecnologías:**
- Python 3.11
- FastAPI 0.109+
- Motor (async MongoDB)
- Pydantic

### 2. sgi-django-admin
**Panel de administración y autenticación**

```
sgi-django-admin/
├── config/
│   ├── settings/         # base, development, production
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── core/             # Base models, utilities
│   ├── users/            # Custom User model
│   └── organizations/    # Organization management
├── requirements.txt
├── Dockerfile
└── manage.py
```

**Tecnologías:**
- Python 3.11
- Django 4.2
- PostgreSQL 15
- Django REST Framework

### 3. sgi-frontend-angular
**Frontend SPA con Angular**

```
sgi-frontend-angular/
├── src/
│   ├── app/
│   │   ├── core/         # Guards, interceptors, services
│   │   ├── features/     # Auth, Dashboard, Organizations
│   │   └── shared/       # Components, directives, pipes
│   ├── assets/
│   └── environments/
├── angular.json
├── package.json
├── Dockerfile
└── nginx.conf
```

**Tecnologías:**
- Angular 17
- TypeScript 5.3
- SCSS
- RxJS

### 4. sgi-infrastructure
**Infraestructura Docker**

```
sgi-infrastructure/
├── docker-compose.yml    # Orquestación de servicios
├── nginx/                # Configuración Nginx
├── scripts/              # Scripts de utilidad
│   ├── start.sh
│   ├── stop.sh
│   ├── migrate.sh
│   └── create-superuser.sh
├── mongo-init.js         # Inicialización MongoDB
└── .env.example
```

**Servicios:**
- MongoDB 7
- PostgreSQL 15
- Redis 7
- FastAPI Backend
- Django Admin
- Angular Frontend
- Nginx Reverse Proxy

## Inicio Rápido

```bash
# Verificar prerrequisitos
./scripts/check-prerequisites.sh

# Iniciar plataforma
cd sgi-infrastructure
cp .env.example .env
./scripts/start.sh
```

## Servicios Disponibles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:4200 | Angular SPA |
| FastAPI | http://localhost:8000/docs | API Docs |
| Django | http://localhost:8001/admin | Admin Panel |
| Nginx | http://localhost:80 | Reverse Proxy |

## Dependencias

```
Frontend (Angular) → FastAPI (API) → MongoDB
                                    → PostgreSQL
Django (Admin) → PostgreSQL
```

## Próximos Pasos

1. ✅ Estructura base creada
2. 🔲 Implementar autenticación JWT
3. 🔲 Crear esquemas MongoDB completos
4. 🔲 Desarrollar módulos del SGSI
5. 🔲 Implementar IA integrada
6. 🔲 Configurar CI/CD
7. 🔲 Pruebas y documentación