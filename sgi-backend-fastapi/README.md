# SGI Backend FastAPI

Backend API para la plataforma SGI - Sistema de Gestión de Seguridad de la Información.

## Tecnologías

- Python 3.11
- FastAPI 0.109+
- MongoDB (Motor async)
- PostgreSQL (adicional)
- Docker

## Desarrollo

### Requisitos
- Python 3.11+
- Docker y Docker Compose

### Instalación Local

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar variables de entorno
cp .env.example .env

# Ejecutar servidor de desarrollo
uvicorn app.main:app --reload
```

### Con Docker

```bash
docker build -t sgi-backend .
docker run -p 8000:8000 sgi-backend
```

## API

La documentación Swagger está disponible en:
- http://localhost:8000/api/v1/docs

La documentación ReDoc está disponible en:
- http://localhost:8000/api/v1/redoc