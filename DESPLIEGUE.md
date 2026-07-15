# Guía de Despliegue - SGI Platform

## Desarrollo Local

### Prerrequisitos
- Docker 24+
- Docker Compose 2.20+
- Git

### Pasos
```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/sgi-platform.git
cd sgi-platform

# 2. Configurar variables de entorno
cd sgi-infrastructure
cp .env.example .env

# 3. Iniciar servicios
./scripts/start.sh

# 4. Verificar
docker-compose ps
```

## Despliegue en Servidor

### Preparación del Servidor

#### Ubuntu 22.04 LTS
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

#### Configurar Firewall
```bash
# Abrir puertos necesarios
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Habilitar firewall
sudo ufw enable
```

### Despliegue

#### 1. Clonar Repositorio
```bash
cd /opt
git clone https://github.com/tu-usuario/sgi-platform.git
cd sgi-platform/sgi-infrastructure
```

#### 2. Configurar Variables de Entorno
```bash
# Crear archivo .env con valores de producción
cp .env.example .env
nano .env
```

Variables importantes para producción:
```bash
# Seguridad
DJANGO_SECRET_KEY=<secreto-largo-aleatorio>
SECRET_KEY=<secreto-largo-aleatorio>

# Base de datos
MONGO_ROOT_PASSWORD=<contraseña-fuerte>
POSTGRES_PASSWORD=<contraseña-fuerte>

# Dominio
ALLOWED_HOSTS=tu-dominio.com
CORS_ORIGINS=https://tu-dominio.com
```

#### 3. Configurar SSL/TLS
```bash
# Crear directorio SSL
mkdir -p nginx/ssl

# Generar certificado autofirmado (desarrollo)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/server.key \
  -out nginx/ssl/server.crt

# O usar Let's Encrypt (producción)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

#### 4. Iniciar en Modo Producción
```bash
# Usar docker-compose de producción
docker compose -f docker-compose.prod.yml up -d

# O usar override
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### 5. Configurar Inicio Automático
```bash
# Crear servicio systemd
sudo nano /etc/systemd/system/sgi-platform.service
```

Contenido del servicio:
```ini
[Unit]
Description=SGI Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/sgi-platform/sgi-infrastructure
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down

[Install]
WantedBy=multi-user.target
```

Habilitar servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable sgi-platform
sudo systemctl start sgi-platform
```

## Despliegue con Kubernetes

### Estructura
```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── backend-fastapi.yaml
├── django-admin.yaml
├── frontend-angular.yaml
├── mongodb.yaml
├── postgresql.yaml
├── redis.yaml
└── ingress.yaml
```

### Pasos
```bash
# Crear namespace
kubectl apply -f k8s/namespace.yaml

# Crear configmap y secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Desplegar servicios
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/postgresql.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend-fastapi.yaml
kubectl apply -f k8s/django-admin.yaml
kubectl apply -f k8s/frontend-angular.yaml

# Configurar ingress
kubectl apply -f k8s/ingress.yaml

# Verificar
kubectl get pods -n sgi-platform
kubectl get services -n sgi-platform
```

## CI/CD con GitHub Actions

### Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy SGI Platform

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/sgi-platform
            git pull
            cd sgi-infrastructure
            docker compose -f docker-compose.prod.yml up -d --build
```

## Monitoreo

### Health Checks
```bash
# Verificar servicios
curl http://localhost/health
curl http://localhost:8000/health
curl http://localhost:8001/health/

# Verificar logs
docker compose logs -f --tail=100
```

### Métricas
```bash
# Instalar Prometheus y Grafana
docker compose -f docker-compose.monitoring.yml up -d

# Acceder a Grafana
http://tu-dominio.com:3000
```

## Backup

### MongoDB
```bash
# Backup manual
docker compose exec mongodb mongodump -u admin -p admin --out=/backup

# Backup automático (cron)
0 2 * * * docker compose exec mongodb mongodump -u admin -p admin --out=/backup/$(date +\%Y\%m\%d)
```

### PostgreSQL
```bash
# Backup manual
docker compose exec postgres pg_dump -U postgres sgi_db > backup.sql

# Backup automático (cron)
0 2 * * * docker compose exec postgres pg_dump -U postgres sgi_db > /backup/$(date +\%Y\%m\%d).sql
```

## Restauración

### MongoDB
```bash
docker compose exec mongodb mongorestore -u admin -p admin /backup/20260101
```

### PostgreSQL
```bash
docker compose exec postgres psql -U postgres sgi_db < backup.sql
```

## Solución de Problemas

### Servicio no inicia
```bash
# Ver logs
docker compose logs -f [servicio]

# Verificar recursos
docker system df
docker stats
```

### Error de memoria
```bash
# Verificar uso de memoria
docker stats --no-stream

# Limitar memoria en docker-compose.yml
services:
  backend-fastapi:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Error de disco
```bash
# Limpiar imágenes no usadas
docker system prune -a

# Verificar volumenes
docker volume ls
docker volume inspect [volumen]