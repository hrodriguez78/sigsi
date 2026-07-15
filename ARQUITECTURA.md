# Arquitectura - SGI Platform

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                       │
│                     Puerto: 80/443                              │
└───────┬───────────────────┬───────────────────┬─────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Frontend    │  │  FastAPI API  │  │ Django Admin  │
│   Angular     │  │   Puerto: 8000│  │  Puerto: 8001 │
│   Puerto: 4200│  │               │  │               │
└───────────────┘  └───────┬───────┘  └───────┬───────┘
                           │                   │
                           ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BASES DE DATOS                             │
├────────────────────────┬────────────────┬───────────────────────┤
│      MongoDB 7         │  PostgreSQL 15 │       Redis 7         │
│   Puerto: 27017        │ Puerto: 5432   │    Puerto: 6379       │
│   (NoSQL Principal)    │ (Relacional)   │      (Cache)          │
└────────────────────────┴────────────────┴───────────────────────┘
```

## Comunicación entre Servicios

### Frontend → Backend
- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Autenticación**: JWT (Bearer Token)
- **Endpoints**: `/api/v1/*`

### Backend → MongoDB
- **Driver**: Motor (async)
- **Protocolo**: MongoDB Wire Protocol
- **Autenticación**: SCRAM-SHA-256

### Django → PostgreSQL
- **Driver**: psycopg2
- **Protocolo**: PostgreSQL Wire Protocol
- **Autenticación**: md5/scram-sha-256

### Cache (Redis)
- **Uso**: Sesiones, tokens, rate limiting
- **Protocolo**: Redis Protocol

## Seguridad

### Autenticación
1. **JWT Tokens**: FastAPI genera tokens JWT
2. **Session Authentication**: Django usa sesiones
3. **MFA**: Soporte para autenticación multifactor

### Autorización
- **RBAC**: Control de acceso basado en roles
- **ABAC**: Control de acceso basado en atributos
- **Permisos**: Por módulo y acción

### Red
- **TLS**: HTTPS en producción
- **CORS**: Configurado por origen
- **Rate Limiting**: En Nginx y FastAPI

## Escalabilidad

### Horizontal
- Múltiples instancias de FastAPI
- Load balancing en Nginx
- MongoDB Replica Set
- PostgreSQL Streaming Replication

### Vertical
- Aumentar recursos de contenedores
- Optimización de queries
- Cache agresivo con Redis

## Monitoreo

### Métricas
- **Prometheus**: Métricas de aplicación
- **Grafana**: Dashboards visualización
- **Health Checks**: En cada servicio

### Logs
- **Structured Logging**: JSON formateado
- **Centralized**: Agregación de logs
- **Alerting**: Notificaciones automáticas

## CI/CD

### Pipeline
1. **Code**: Git push
2. **Build**: Docker build
3. **Test**: Unit & Integration tests
4. **Scan**: Security scanning
5. **Deploy**: Docker Compose / Kubernetes
6. **Monitor**: Health checks post-deploy

### Herramientas
- **GitHub Actions**: CI/CD pipeline
- **SonarQube**: Code quality
- **OWASP ZAP**: Security testing
- **Trivy**: Container scanning