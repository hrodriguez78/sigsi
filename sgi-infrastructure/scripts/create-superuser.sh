#!/bin/bash

set -e

echo "👤 Creando superusuario de Django..."

docker-compose exec django-admin python manage.py createsuperuser

echo "✅ Superusuario creado."