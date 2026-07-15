#!/bin/bash

set -e

echo "🔄 Ejecutando migraciones de Django..."

docker-compose exec django-admin python manage.py makemigrations
docker-compose exec django-admin python manage.py migrate

echo "✅ Migraciones completadas."