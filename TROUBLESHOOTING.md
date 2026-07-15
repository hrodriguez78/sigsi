# Troubleshooting - SGI Platform

## Problemas Comunes

### 1. Docker no inicia

**Síntoma**: Error "Cannot connect to the Docker daemon"

**Solución**:
```bash
# Verificar estado de Docker
sudo systemctl status docker

# Iniciar Docker
sudo systemctl start docker

# Habilitar inicio automático
sudo systemctl enable docker

# Verificar permisos
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar
```

### 2. Puerto en uso

**Síntoma**: Error "Port is already allocated"

**Solución**:
```bash
# Encontrar proceso que usa el puerto
lsof -i :80
lsof -i :8000
lsof -i :8001
lsof -i :4200

# Matar el proceso
kill -9 [PID]

# O cambiar puerto en docker-compose.yml
services:
  nginx:
    ports:
      - "8080:80"  # Cambiar 80 por 8080
```

### 3. Contenedor falla al iniciar

**Síntoma**: Contenedor se reinicia constantemente

**Solución**:
```bash
# Ver logs del contenedor
docker compose logs -f [servicio]

# Verificar estado
docker compose ps

# Reconstruir contenedor
docker compose up -d --build [servicio]

# Verificar recursos
docker stats
```

### 4. Error de conexión a base de datos

**Síntoma**: "Connection refused" o "Authentication failed"

**Solución**:
```bash
# Verificar que la base de datos esté corriendo
docker compose ps mongodb postgres redis

# Verificar logs de la base de datos
docker compose logs -f mongodb
docker compose logs -f postgres

# Reiniciar bases de datos
docker compose restart mongodb postgres redis

# Verificar variables de entorno
docker compose exec backend-fastapi env | grep -E "MONGO|POSTGRES"
```

### 5. Frontend no carga

**Síntoma**: Página en blanco o error 404

**Solución**:
```bash
# Verificar logs de Angular
docker compose logs -f frontend-angular

# Verificar configuración de Nginx
docker compose exec nginx cat /etc/nginx/nginx.conf

# Reconstruir frontend
docker compose up -d --build frontend-angular

# Verificar que los assets existen
docker compose exec frontend-angular ls -la /usr/share/nginx/html
```

### 6. API retorna 404

**Síntoma**: Endpoints no encontrados

**Solución**:
```bash
# Verificar que FastAPI esté corriendo
docker compose ps backend-fastapi

# Verificar documentación API
curl http://localhost:8000/docs

# Verificar logs de FastAPI
docker compose logs -f backend-fastapi

# Verificar rutas registradas
curl http://localhost:8000/api/v1/openapi.json
```

### 7. Autenticación falla

**Síntoma**: Error 401 o 403

**Solución**:
```bash
# Verificar JWT_SECRET
docker compose exec backend-fastapi env | grep SECRET_KEY

# Verificar token
curl -H "Authorization: Bearer [token]" http://localhost:8000/api/v1/users/me

# Verificar permisos en Django
docker compose exec django-admin python manage.py shell -c "
from apps.users.models import User
print(User.objects.all())
"
```

### 8. MongoDB no acepta conexiones

**Síntoma**: "MongoNetworkError"

**Solución**:
```bash
# Verificar estado de MongoDB
docker compose exec mongodb mongosh -u admin -p admin --eval "db.runCommand('ping')"

# Verificar autenticación
docker compose exec mongodb mongosh -u admin -p admin --eval "
db = db.getSiblingDB('sgi_db');
db.getUsers()
"

# Reiniciar MongoDB
docker compose restart mongodb

# Verificar volumenes
docker volume inspect sgi-infrastructure_mongodb_data
```

### 9. Django migraciones fallan

**Síntoma**: Error durante migrate

**Solución**:
```bash
# Verificar conexión a PostgreSQL
docker compose exec django-admin python manage.py dbshell

# Verificar migraciones pendientes
docker compose exec django-admin python manage.py showmigrations

# Aplicar migraciones específicas
docker compose exec django-admin python manage.py migrate users

# Resetear migraciones (último recurso)
docker compose exec django-admin python manage.py migrate users zero
docker compose exec django-admin python manage.py migrate
```

### 10. Nginx retorna 502

**Síntoma**: Bad Gateway

**Solución**:
```bash
# Verificar que los upstream estén corriendo
docker compose ps

# Verificar logs de Nginx
docker compose logs -f nginx

# Verificar configuración de upstream
docker compose exec nginx cat /etc/nginx/nginx.conf

# Verificar conectividad
docker compose exec nginx curl http://backend-fastapi:8000/health
```

## Problemas de Rendimiento

### Contenedores lentos
```bash
# Verificar uso de recursos
docker stats

# Limitar CPU y memoria
services:
  backend-fastapi:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Base de datos lenta
```bash
# Verificar queries lentas (MongoDB)
docker compose exec mongodb mongosh -u admin -p admin --eval "
db.setProfilingLevel(1, {slowms: 100});
"

# Verificar queries lentas (PostgreSQL)
docker compose exec postgres psql -U postgres -d sgi_db -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle' AND now() - pg_stat_activity.query_start > interval '5 minutes';
"
```

## Problemas de Red

### Contenedores no se comunican
```bash
# Verificar red
docker network ls
docker network inspect sgi-infrastructure_sgi-network

# Verificar DNS
docker compose exec backend-fastapi nslookup mongodb

# Verificar conectividad
docker compose exec backend-fastapi ping mongodb
```

## Logs Útiles

### Ver logs en tiempo real
```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker compose logs -f backend-fastapi

# Últimas 100 líneas
docker compose logs --tail=100 backend-fastapi
```

### Buscar errores
```bash
# Buscar en logs
docker compose logs backend-fastapi 2>&1 | grep -i error

# Exportar logs
docker compose logs backend-fastapi > backend.log 2>&1
```

## Comandos de Emergencia

### Detener todo
```bash
docker compose down
```

### Detener y eliminar volúmenes
```bash
docker compose down -v
```

### Limpiar todo
```bash
docker system prune -a
docker volume prune
```

### Reconstruir desde cero
```bash
docker compose down -v
docker system prune -a
docker compose up -d --build
```

## Contacto de Soporte

Si el problema persiste:
1. Recopilar logs: `docker compose logs > logs.txt 2>&1`
2. Verificar estado: `docker compose ps > status.txt`
3. Verificar configuración: `cat docker-compose.yml > config.txt`
4. Buscar en documentación oficial de cada tecnología
5. Consultar issues en GitHub