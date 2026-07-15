# Comandos Útiles - SGI Platform

## Docker Compose

```bash
# Iniciar todos los servicios
docker compose up -d

# Iniciar y reconstruir
docker compose up -d --build

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend-fastapi

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v

# Ver estado de servicios
docker compose ps

# Acceder a un contenedor
docker compose exec backend-fastapi bash
docker compose exec django-admin bash
docker compose exec mongodb mongosh
docker compose exec postgres psql -U postgres -d sgi_db
```

## Login Admin (Desarrollo)

```bash
# Credenciales del admin seed (automático al iniciar FastAPI)
# Email: admin@sgi.local
# Password: Admin123!

# Probar login con curl
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sgi.local","password":"Admin123!"}'
```

## Desarrollo Local

### Backend FastAPI
```bash
cd sgi-backend-fastapi
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Django Admin
```bash
cd sgi-django-admin
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8001
```

### Frontend Angular
```bash
cd sgi-frontend-angular
npm install
npm start
```

## Scripts de Utilidad

```bash
# Verificar prerrequisitos
./scripts/check-prerequisites.sh

# Iniciar plataforma
cd sgi-infrastructure
./scripts/start.sh

# Detener plataforma
./scripts/stop.sh

# Ejecutar migraciones Django
./scripts/migrate.sh

# Crear superusuario Django
./scripts/create-superuser.sh
```

## Base de Datos

### MongoDB
```bash
# Conectar a MongoDB
docker compose exec mongodb mongosh -u admin -p admin

# Ver bases de datos
show dbs

# Usar base de datos
use sgi_db

# Ver colecciones
show collections
```

### PostgreSQL
```bash
# Conectar a PostgreSQL
docker compose exec postgres psql -U postgres -d sgi_db

# Ver tablas
\dt

# Ver estructura de tabla
\d users
```

## Producción

```bash
# Usar docker compose de producción
docker compose -f docker-compose.prod.yml up -d

# O con override
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```