# SGI Frontend Angular

Frontend SPA para la plataforma SGI - Sistema de Gestión de Seguridad de la Información.

## Tecnologías

- Angular 17
- TypeScript 5.3
- SCSS
- Docker

## Desarrollo

### Requisitos
- Node.js 20+
- npm 10+
- Docker y Docker Compose

### Instalación Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm start
```

### Con Docker

```bash
docker build -t sgi-frontend .
docker run -p 4200:80 sgi-frontend
```

## Estructura

```
src/
├── app/
│   ├── core/           # Guards, interceptors, servicios
│   ├── features/       # Módulos de la aplicación
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── organizations/
│   └── shared/         # Componentes, directivas, pipes compartidos
├── assets/
└── environments/
```

## Desarrollo

El servidor de desarrollo estará disponible en:
- http://localhost:4200