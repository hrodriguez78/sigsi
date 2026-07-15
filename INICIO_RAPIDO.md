# Guía de Inicio Rápido - SGI Platform

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Docker](https://docs.docker.com/get-docker/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.20+)
- [Git](https://git-scm.com/downloads)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/sgi-platform.git
cd sgi-platform
```

### 2. Verificar Prerrequisitos

```bash
./scripts/check-prerequisites.sh
```

### 3. Configurar Variables de Entorno

```bash
cd sgi-infrastructure
cp .env.example .env
```

Edita el archivo `.env` si es necesario.

### 4. Iniciar la Plataforma

```bash
./scripts/start.sh
```

Este script:
- Construye las imágenes Docker
- Inicia todos los servicios
- Espera a que estén listos
- Muestra el estado

## Verificación

Una vez iniciado, verifica que todo funcione:

### Frontend
- Abre http://localhost:4200
- Deberías ver la página de login

### FastAPI
- Abre http://localhost:8000/docs
- Verás la documentación Swagger

### Django Admin
- Abre http://localhost:8001/admin
- Inicia sesión con tu superusuario

## Crear Superusuario Django

```bash
./scripts/create-superuser.sh
```

Sigue las instrucciones para crear un usuario administrador.

## Estructura dearchivos

```
sgi-platform/
├── sgi-backend-fastapi/     # API REST
├── sgi-django-admin/        # Admin panel
├── sgi-frontend-angular/    # Frontend SPA
├── sgi-infrastructure/      # Docker e infra
├── scripts/                 # Scripts útiles
├── plan.md                  # Especificación
├── plan de trabajo.md       # Plan de trabajo
├── README.md                # Documentación principal
├── ESTRUCTURA.md            # Estructura del proyecto
├── ARQUITECTURA.md          # Arquitectura técnica
├── COMANDOS.md              # Comandos útiles
└── VERIFICACION.md          # Verificación de servicios
```

## Solución de Problemas

### El servicio no inicia
```bash
# Ver logs del servicio
docker compose logs -f [servicio]

# Reconstruir servicio
docker compose up -d --build [servicio]
```

### Error de conexión a base de datos
```bash
# Verificar estado de bases de datos
docker compose ps

# Reiniciar bases de datos
docker compose restart mongodb postgres redis
```

### Puerto en uso
```bash
# Ver qué proceso usa el puerto
lsof -i :[puerto]

# Matar el proceso o cambiar puerto en docker-compose.yml
```

## Próximos Pasos

1. Explorar la documentación API en http://localhost:8000/docs
2. Revisar el código fuente de cada repositorio
3. Implementar los módulos del SGSI según el plan de trabajo
4. Configurar CI/CD para producción
5. Implementar las normas ISO según prioridad

## Soporte

- Revisa la documentación en cada repositorio
- Consulta los archivos *.md en la raíz
- Revisa los logs para errores específicos