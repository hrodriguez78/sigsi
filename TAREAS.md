# Tareas Pendientes - SGI Platform

## ✅ Completadas

- [x] Definir estructura de repos separados
- [x] Crear repositorio backend-fastapi
- [x] Crear repositorio django-admin
- [x] Crear repositorio frontend-angular
- [x] Crear repositorio infrastructure
- [x] Dockerizar todos los servicios
- [x] Documentar estructura y arquitectura
- [x] Crear scripts de utilidad
- [x] Implementar RBAC completo (roles/permisos backend + frontend)
- [x] Dashboard ejecutivo con charts (Chart.js)
- [x] Dark mode y responsive design
- [x] Búsqueda global multi-módulo
- [x] Motor IA (chat, políticas, gap analysis, recomendaciones)
- [x] Corregir bugs críticos de compilación
- [x] Login NgRx conectado al backend FastAPI
- [x] Docker Compose funcional (MongoDB + PostgreSQL + Redis + Backend)
- [x] Corregir imports rotos (widgets, orgchart, ocr)
- [x] Fix bcrypt/passlib compatibility (bcrypt 4.0.1)
- [x] Fix EmailStr para dominios .local

## 🔄 En Progreso

- [ ] Exportación de reportes PDF/Excel
- [ ] Drag & Drop en procesos y dashboard
- [ ] OCR para documentos escaneados
- [ ] Widgets configurables de dashboard

## ⏳ Pendientes - Fase 2 (Restante)

### Angular Refinamientos
- [ ] Process tree visual con drag & drop
- [ ] Asset catalog con filtros avanzados
- [ ] Relación activos-riesgos-controles en UI
- [ ] Editor WYSIWYG para documentos
- [ ] Historial de versiones visual

## ✅ Demo: Procesos de Contratación (Empresa Servicios)

- [x] Roles específicos: coordinador, operario, cliente_contacto, cliente_observador
- [x] Organizaciones demo: Servicios Totales + 3 clientes
- [x] Usuarios demo: coordinador, 2 clientes, seed automático
- [x] Módulo de Usuarios en frontend (CRUD + roles)
- [x] Módulo de Gestión Humana (hub de navegación)
- [x] Endpoints backend: /users (GET, POST, PUT, DELETE)
- [x] Scripts de seed y pruebas automatizadas
- [x] Documentación completa (DEMO_CONTRATACION.md)

## ⏳ Pendientes - Producción

### CI/CD
- [ ] Configurar GitHub Actions completos
- [ ] Tests automáticos (backend + frontend)
- [ ] Configurar SonarQube
- [ ] Security scanning

### Despliegue
- [ ] Configurar Kubernetes
- [ ] Implementar autoscaling
- [ ] Configurar monitoreo completo
- [ ] SSL/TLS en Nginx

## 📋 Notas Importantes

1. **Orden de desarrollo**: Fase 1 → 2 → 3 → 4 → 5 → 6 completadas. Pendiente: refinamientos UI
2. **Pruebas**: Cada módulo debe tener tests antes de producción
3. **Documentación**: Actualizar README y docs después de cada módulo
4. **Code review**: Revisar código antes de cada merge
5. **Commits**: Usar convención de commits (feat, fix, docs, etc.)

## 🎯 Objetivo Final

Plataforma completa para implementar y administrar SGSI según ISO 27001:2022 con:
- 10+ módulos funcionales
- IA integrada (chat, políticas, gap analysis)
- Dashboard ejecutivo con charts
- Roles y permisos RBAC
- Dark mode y responsive
- Búsqueda global
- Listo para auditorías
- Mejora continua PHVA