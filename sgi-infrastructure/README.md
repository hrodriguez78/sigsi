# SGI Infrastructure

Infraestructura Docker para la plataforma SGI.

## Servicios

- **MongoDB**: Base de datos NoSQL principal
- **PostgreSQL**: Base de datos relacional para Django
- **Redis**: Cache y colas de mensajes
- **FastAPI Backend**: API REST principal
- **Django Admin**: Panel de administración
- **Angular Frontend**: SPA del frontend
- **Nginx**: Reverse proxy

## Inicio Rápido

```bash
# Copiar variables de entorno
cp .env.example .env

# Iniciar servicios
./scripts/start.sh

# O manualmente
docker-compose up -d --build
```

## Servicios Disponibles

- Frontend: http://localhost:4200
- FastAPI Docs: http://localhost:8000/docs
- Django Admin: http://localhost:8001/admin
- Nginx: http://localhost:80

## Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Detener servicios
./scripts/stop.sh

# Ejecutar migraciones
./scripts/migrate.sh

# Crear superusuario
./scripts/create-superuser.sh

# Acceder a MongoDB
docker-compose exec mongodb mongosh -u admin -p admin

# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d sgi_db
```

## Desarrollo

Los volúmenes están configurados para desarrollo local. Los cambios en el código se reflejarán automáticamente en los contenedores.