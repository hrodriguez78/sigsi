# Usuarios Demo — SGI Platform

Credenciales para verificar el sistema. Backend: `http://localhost:8000/docs` | Frontend: `http://localhost:4200`

---

## 1. Administración Global

| Email | Contraseña | Nombre | Rol | Organización |
|---|---|---|---|---|
| `admin@sgi.local` | `Admin123!` | Administrador | admin | (ninguna) |

> Acceso total: CRUD de todos los módulos, usuarios, roles, configuración del sistema.

---

## 2. Empresa Proveedor — Servicios Totales S.A.S (NIT 900123456-7)

### Coordinador

| Email | Contraseña | Nombre | Rol | Organización |
|---|---|---|---|---|
| `coordinador@serviciostotales.com` | `Coord123!` | Carlos Coordinador | coordinador | Servicios Totales S.A.S |

> Gestiona OTs, reportes, inspecciones, candidatos, capacitación. Puede aprobar reportes y verificar OTs.

### Operarios (7)

| Email | Contraseña | Nombre |
|---|---|---|
| `operario1@serviciostotales.com` | `Oper123!` | Operario Uno |
| `operario2@serviciostotales.com` | `Oper123!` | Operario Dos |
| `operario3@serviciostotales.com` | `Oper123!` | Operario Tres |
| `operario4@serviciostotales.com` | `Oper123!` | Operario Cuatro |
| `operario5@serviciostotales.com` | `Oper123!` | Operario Cinco |
| `operario6@serviciostotales.com` | `Oper123!` | Operario Seis |
| `operario7@serviciostotales.com` | `Oper123!` | Operario Siete |

> Rol: `operario`. Ejecutan OTs, crean reportes diarios, lectura de inspecciones.

### Toderos (2)

| Email | Contraseña | Nombre |
|---|---|---|
| `todero1@serviciostotales.com` | `Todero123!` | Carlos Todero |
| `todero2@serviciostotales.com` | `Todero123!` | Luis Todero |

> Rol: `operario`. Técnicos multifunción para tareas diversas.

---

## 3. Empresa Cliente — Inversiones Alpha S.A (NIT 900987654-3)

| Email | Contraseña | Nombre | Rol | Organización |
|---|---|---|---|---|
| `usuario1@alpha.com` | `User123!` | Juan Perez | cliente_contacto | Inversiones Alpha S.A |

> Puede ver OTs, reportes e inspecciones de Alpha. Crear/actualizar OTs. Lectura de candidatos.

---

## 4. Empresa Cliente — Distribuciones Beta Ltda (NIT 900555123-4)

| Email | Contraseña | Nombre | Rol | Organización |
|---|---|---|---|---|
| `usuario1@beta.com` | `User123!` | Maria Rodriguez | cliente_contacto | Distribuciones Beta Ltda |

> Mismos permisos que Juan Perez pero para servicios de Beta.

---

## 5. Empresa Cliente — Corporación Gamma (NIT 900333789-0)

| Email | Contraseña | Nombre | Rol | Organización |
|---|---|---|---|---|
| `usuario1@gamma.com` | `User123!` | Andrea Cliente | cliente_contacto | Corporación Gamma |

> Mismos permisos pero para servicios de Gamma.

---

## Resumen Rápido

| Cantidad | Rol | Contraseña común |
|---|---|---|
| 1 | admin | `Admin123!` |
| 1 | coordinador | `Coord123!` |
| 9 | operario | `Oper123!` / `Todero123!` |
| 3 | cliente_contacto | `User123!` |
| **14 total** | | |

---

## Permisos por Rol

| Rol | OTs | Reportes | Inspecciones | Candidatos | Capacitación | Usuarios |
|---|---|---|---|---|---|---|
| `admin` | CRUD | CRUD + Aprobar | CRUD | CRUD | CRUD | CRUD |
| `coordinador` | CRUD + Eliminar | CRUD + Aprobar | CRUD + Eliminar | CRUD | CRUD | Lectura |
| `operario` | Leer + Escribir | Leer + Escribir | Lectura | — | Lectura | — |
| `cliente_contacto` | Leer + Escribir | Lectura | Lectura | Lectura | — | — |
| `cliente_observador` | Lectura | Lectura | Lectura | Lectura | — | — |

---

## Scripts de Seed

Los usuarios se crean en dos fases:

1. **Automático (al iniciar backend):** admin, coordinador, Juan Perez (Alpha), Maria Rodriguez (Beta)
   ```bash
   # El backend los crea automáticamente al arrancar
   cd sgi-backend-fastapi && uvicorn app.main:app --reload
   ```

2. **Manual (requiere backend corriendo):** 7 operarios, 2 toderos, Andrea Cliente (Gamma)
   ```bash
   python3 scripts/seed_demo_contratacion.py
   ```

3. **Datos operativos (requiere backend + usuarios):** OTs, reportes, inspecciones
   ```bash
   python3 scripts/seed_demo_operaciones.py
   ```

---

## Verificación Rápida del Sistema

```bash
# 1. Login como admin
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sgi.local","password":"Admin123!"}'

# 2. Login como coordinador
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinador@serviciostotales.com","password":"Coord123!"}'

# 3. Login como operario
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operario1@serviciostotales.com","password":"Oper123!"}'

# 4. Login como cliente
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario1@alpha.com","password":"User123!"}'
```
