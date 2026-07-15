.PHONY: help install dev test lint clean docker-up docker-down

help: ## Mostrar esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instalar dependencias
	cd sgi-backend-fastapi && pip install -r requirements.txt
	cd sgi-django-admin && pip install -r requirements.txt
	cd sgi-frontend-angular && npm install

dev: ## Iniciar entorno de desarrollo
	cd sgi-infrastructure && ./scripts/start.sh

test: ## Ejecutar todos los tests
	cd sgi-backend-fastapi && python -m pytest
	cd sgi-django-admin && python manage.py test
	cd sgi-frontend-angular && npm test

lint: ## Ejecutar linting
	cd sgi-backend-fastapi && ruff check app/
	cd sgi-django-admin && python -m flake8
	cd sgi-frontend-angular && npm run lint

format: ## Formatear código
	cd sgi-backend-fastapi && black app/ && isort app/
	cd sgi-frontend-angular && npm run format

clean: ## Limpiar archivos temporales
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name node_modules -exec rm -rf {} +
	find . -type d -name .angular -exec rm -rf {} +

docker-up: ## Iniciar con Docker
	cd sgi-infrastructure && docker compose up -d

docker-down: ## Detener Docker
	cd sgi-infrastructure && docker compose down

docker-build: ## Reconstruir contenedores
	cd sgi-infrastructure && docker compose up -d --build

docker-logs: ## Ver logs de Docker
	cd sgi-infrastructure && docker compose logs -f

migrate: ## Ejecutar migraciones Django
	cd sgi-infrastructure && ./scripts/migrate.sh

createsuperuser: ## Crear superusuario Django
	cd sgi-infrastructure && ./scripts/create-superuser.sh

check: ## Verificar prerrequisitos
	./scripts/check-prerequisites.sh

build: ## Construir proyecto
	cd sgi-frontend-angular && npm run build

start: ## Iniciar servidor de desarrollo
	cd sgi-backend-fastapi && uvicorn app.main:app --reload
	cd sgi-django-admin && python manage.py runserver
	cd sgi-frontend-angular && npm start