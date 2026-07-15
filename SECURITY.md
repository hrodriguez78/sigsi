# Política de Seguridad - SGI Platform

## Compromiso con la Seguridad

SGI Platform se compromete a garantizar la seguridad de nuestros usuarios y datos. tomamos非常 en serio la seguridad de nuestra plataforma y apreciamos los esfuerzos de los investigadores de seguridad para identificar y reportar vulnerabilidades.

## Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor repórtala de manera responsable. **No crees un issue público**.

### Cómo Reportar

1. **Email**: Envía un email a [security@sgi-platform.com] con:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Cualquier prueba de concepto

2. **GitHub**: Usa el template de "Security Vulnerability Report" en issues

### Información Incluida

Por favor incluye:
- Tipo de vulnerabilidad (ej. XSS, SQL Injection, etc.)
- Ubicación del código vulnerable
- Condiciones para explotarla
- Impacto potencial
- Sugerencia de remediación

## Respuesta

### Tiempo de Respuesta

- **Confirmación**: Dentro de 48 horas
- **Evaluación**: Dentro de 5 días hábiles
- **Corrección**: Según severidad
  - Crítica: 24-48 horas
  - Alta: 1 semana
  - Media: 2 semanas
  - Baja: Próximo release

### Comunicación

- Te mantendremos informado del progreso
- Te creditaremos (si lo deseas) en el changelog
- No tomaremos acciones legales contra investigadores responsables

## Alcance

### Incluido

- **sgi-backend-fastapi**: API REST
- **sgi-django-admin**: Panel de administración
- **sgi-frontend-angular**: Frontend SPA
- **sgi-infrastructure**: Configuración Docker

### Excluido

- Dependencias de terceros (reportar directamente)
- Servicios de infraestructura externos
- Ataques de denegación de servicio (DoS)
- Ingeniería social

## Severidad

### Crítica
- Ejecución remota de código
- Acceso a datos sensibles sin autenticación
- Bypass de autenticación/autorización

### Alta
- SQL/NoSQL Injection
- Cross-Site Scripting (XSS) persistente
- Acceso a datos con autenticación débil

### Media
- Cross-Site Scripting (XSS) reflejo
- CSRF en acciones sensibles
- Información sensible en logs

### Baja
- Cross-Site Scripting (XSS) DOM-based
- Problemas de configuración
- Información en mensajes de error

## Buenas Prácticas

### Para Usuarios
- Usar contraseñas fuertes
- Habilitar MFA cuando sea posible
- No compartir credenciales
- Reportar actividades sospechosas

### Para Desarrolladores
- Validar toda entrada de usuario
- Usar parametrización para queries
- Implementar Content Security Policy
- Encriptar datos sensibles
- Usar HTTPS siempre
- Implementar rate limiting
- Logging de actividad sospechosa
- No hardcodear credenciales (usar variables de entorno)
- Fijar versiones de dependencias (bcrypt==4.0.1 para compatibilidad con passlib)

## Cumplimiento

Esta política cumple con:
- ISO 27001:2022 (Controles de seguridad)
- OWASP Top 10
- NIST Cybersecurity Framework
- GDPR (Protección de datos)

## Actualizaciones

Esta política se actualiza regularmente. Última actualización: [Fecha].

## Contacto

Para preguntas sobre seguridad:
- Email: [security@sgi-platform.com]
- GitHub: [Security Advisories]