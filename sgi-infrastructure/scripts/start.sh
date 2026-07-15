#!/bin/bash

set -e

echo "🚀 Iniciando SGI Platform..."

# Copiar variables de entorno
if [ ! -f .env ]; then
    echo "📋 Copiando .env.example a .env..."
    cp .env.example .env
fi

# Construir e iniciar servicios
echo "🐳 Construyendo e iniciando contenedores..."
docker-compose up -d --build

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado
echo "✅ Verificando estado de los servicios..."
docker-compose ps

echo ""
echo "🎉 ¡SGI Platform está corriendo!"
echo ""
echo "📌 Servicios disponibles:"
echo "   - Frontend: http://localhost:4200"
echo "   - FastAPI: http://localhost:8000/docs"
echo "   - Django Admin: http://localhost:8001/admin"
echo "   - Nginx: http://localhost:80"
echo ""
echo "📌 Para ver logs: docker-compose logs -f"
echo "📌 Para detener: docker-compose down"