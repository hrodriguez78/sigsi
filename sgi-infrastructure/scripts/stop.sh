#!/bin/bash

set -e

echo "🛑 Deteniendo SGI Platform..."

docker-compose down

echo "✅ SGI Platform detenida."