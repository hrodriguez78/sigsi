#!/bin/bash

echo "🔍 Verificando prerrequisitos para SGI Platform..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "   Instalar: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    echo "   Instalar: https://docs.docker.com/compose/install/"
    exit 1
fi

# Verificar Git
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado"
    echo "   Instalar: https://git-scm.com/downloads"
    exit 1
fi

# Verificar versión de Docker
DOCKER_VERSION=$(docker --version | cut -d ' ' -f 3 | cut -d '.' -f 1)
if [ "$DOCKER_VERSION" -lt 24 ]; then
    echo "⚠️  Se recomienda Docker 24+ (versión actual: $DOCKER_VERSION)"
fi

echo ""
echo "✅ Todos los prerrequisitos están instalados"
echo ""
echo "📌 Próximos pasos:"
echo "   1. cd sgi-infrastructure"
echo "   2. cp .env.example .env"
echo "   3. ./scripts/start.sh"