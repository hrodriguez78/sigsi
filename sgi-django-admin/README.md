# SGI Django Admin

Panel de administración y autenticación para la plataforma SGI.

## Tecnologías

- Python 3.11
- Django 4.2
- PostgreSQL 15
- Docker

## Desarrollo

### Requisitos
- Python 3.11+
- PostgreSQL 15+
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

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor de desarrollo
python manage.py runserver
```

### Con Docker

```bash
docker build -t sgi-django-admin .
docker run -p 8001:8001 sgi-django-admin
```

## Admin

El panel de administración está disponible en:
- http://localhost:8001/admin/