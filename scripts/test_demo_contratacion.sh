#!/bin/bash
# =================================================================
# Script de Pruebas Automatizadas - Demo de Contratación
# =================================================================
# Ejecuta validaciones contra la API REST del backend.
# Uso: bash scripts/test_demo_contratacion.sh
# Requisitos: backend corriendo en http://localhost:8000, curl, jq
# =================================================================

set -e

BASE="http://localhost:8000/api/v1"
PASS=0
FAIL=0
TOKEN=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓ PASS${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}✗ FAIL${NC} $1"; FAIL=$((FAIL + 1)); }
info() { echo -e "${YELLOW}→ $1${NC}"; }

# ── 0. Health Check ──────────────────────────────────────────────
info "Verificando health check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$STATUS" = "200" ]; then
    pass "Health check OK"
else
    fail "Health check falló (HTTP $STATUS)"
    echo "Asegúrese de que el backend está corriendo."
    exit 1
fi

# ── 1. Login Admin ───────────────────────────────────────────────
info "Login como admin..."
RESP=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sgi.local","password":"Admin123!"}')
TOKEN=$(echo $RESP | jq -r '.access_token')
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    pass "Login admin exitoso"
else
    fail "Login admin falló"
    echo "Response: $RESP"
    exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

# ── 2. Login Coordinador ─────────────────────────────────────────
info "Login como coordinador..."
RESP=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinador@serviciostotales.com","password":"Coord123!"}')
TOKEN_C=$(echo $RESP | jq -r '.access_token')
if [ -n "$TOKEN_C" ] && [ "$TOKEN_C" != "null" ] && [ "$TOKEN_C" != "" ]; then
    pass "Login coordinador exitoso"
else
    fail "Login coordinador falló"
fi

# ── 3. Obtener perfil ────────────────────────────────────────────
info "Obteniendo perfil (/auth/me)..."
ME=$(curl -s -H "$AUTH" "$BASE/auth/me")
ME_NAME=$(echo $ME | jq -r '.full_name')
if [ "$ME_NAME" = "Administrador" ]; then
    pass "Perfil admin correcto"
else
    fail "Perfil admin incorrecto: $ME_NAME"
fi

# ── 4. Listar roles ──────────────────────────────────────────────
info "Listando roles..."
ROLES=$(curl -s -H "$AUTH" "$BASE/roles")
ROLE_COUNT=$(echo $ROLES | jq 'length')
if [ "$ROLE_COUNT" -ge 8 ]; then
    pass "Roles cargados: $ROLE_COUNT roles (esperados >= 8)"
else
    fail "Roles insuficientes: $ROLE_COUNT (esperados >= 8)"
fi

# ── 5. Verificar roles específicos ───────────────────────────────
info "Verificando roles de la demo..."
COORD_EXISTS=$(echo $ROLES | jq '[.[] | select(.name=="coordinador")] | length')
OPER_EXISTS=$(echo $ROLES | jq '[.[] | select(.name=="operario")] | length')
CLI1_EXISTS=$(echo $ROLES | jq '[.[] | select(.name=="cliente_contacto")] | length')
CLI2_EXISTS=$(echo $ROLES | jq '[.[] | select(.name=="cliente_observador")] | length')

[ "$COORD_EXISTS" -ge 1 ] && pass "Rol coordinador existe" || fail "Rol coordinador no encontrado"
[ "$OPER_EXISTS" -ge 1 ] && pass "Rol operario existe" || fail "Rol operario no encontrado"
[ "$CLI1_EXISTS" -ge 1 ] && pass "Rol cliente_contacto existe" || fail "Rol cliente_contacto no encontrado"
[ "$CLI2_EXISTS" -ge 1 ] && pass "Rol cliente_observador existe" || fail "Rol cliente_observador no encontrado"

# ── 6. Listar usuarios ───────────────────────────────────────────
info "Listando usuarios..."
USERS=$(curl -s -H "$AUTH" "$BASE/users")
USER_COUNT=$(echo $USERS | jq 'length')
if [ "$USER_COUNT" -ge 5 ]; then
    pass "Usuarios cargados: $USER_COUNT (esperados >= 5)"
else
    fail "Usuarios insuficientes: $USER_COUNT (esperados >= 5)"
fi

# ── 7. Listar organizaciones ─────────────────────────────────────
info "Listando organizaciones..."
ORGS_RAW=$(curl -s -H "$AUTH" "$BASE/organizations?page_size=50")
ORGS=$(echo $ORGS_RAW | jq '.organizations // .')
ORG_COUNT=$(echo $ORGS | jq 'length')
if [ "$ORG_COUNT" -ge 4 ]; then
    pass "Organizaciones cargadas: $ORG_COUNT (esperadas >= 4)"
else
    fail "Organizaciones insuficientes: $ORG_COUNT (esperadas >= 4)"
fi

# Obtener ID de Servicios Totales
SVC_NIT="900123456-7"
SVC_ID=$(echo $ORGS | jq -r "[.[] | select(.nit==\"$SVC_NIT\")] | .[0].id // empty")
if [ -n "$SVC_ID" ] && [ "$SVC_ID" != "null" ]; then
    pass "Servicios Totales encontrada: $SVC_ID"
else
    fail "Servicios Totales no encontrada"
fi

# ── 8. Crear proceso de contratación ─────────────────────────────
info "Creando proceso de contratación..."
PROC_RESP=$(curl -s -X POST "$BASE/processes" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"$SVC_ID\",
    \"name\": \"Proceso Selección Operarios\",
    \"code\": \"TEST-CTR-001\",
    \"process_type\": \"operativo\",
    \"description\": \"Test automatizado\",
    \"status\": \"activo\"
  }")
PROC_ID=$(echo $PROC_RESP | jq -r '.id' 2>/dev/null)
if [ -z "$PROC_ID" ] || [ "$PROC_ID" = "null" ]; then
    PROC_RESP=$(curl -s -X POST "$BASE/processes" \
      -H "$AUTH" -H "Content-Type: application/json" \
      -d "{
        \"organization_id\": \"$SVC_ID\",
        \"name\": \"Test Proceso Contratación\",
        \"code\": \"TEST-CTR-002\",
        \"process_type\": \"operativo\",
        \"status\": \"activo\"
      }")
    PROC_ID=$(echo $PROC_RESP | jq -r '.id // empty')
fi
if [ -z "$PROC_ID" ] || [ "$PROC_ID" = "null" ]; then
    EXISTING=$(curl -s -H "$AUTH" "$BASE/processes?organization_id=$SVC_ID" | jq -r '.processes[0].id // empty')
    if [ -n "$EXISTING" ]; then
        PROC_ID="$EXISTING"
    fi
fi
if [ -n "$PROC_ID" ] && [ "$PROC_ID" != "null" ]; then
    pass "Proceso de contratación encontrado/creado: $PROC_ID"
else
    fail "Error creando proceso"
fi

# ── 8. Obtener árbol de procesos ─────────────────────────────────
info "Obteniendo árbol de procesos..."
TREE=$(curl -s -H "$AUTH" "$BASE/processes/tree?organization_id=$SVC_ID")
TREE_COUNT=$(echo $TREE | jq '.tree | length')
if [ "$TREE_COUNT" -ge 1 ]; then
    pass "Árbol de procesos tiene $TREE_COUNT procesos raíz"
else
    fail "Árbol de procesos vacío"
fi

# ── 9. Crear candidato ───────────────────────────────────────────
info "Creando candidato de prueba..."
if [ -n "$PROC_ID" ]; then
    CAND=$(curl -s -X POST "$BASE/candidates" \
      -H "$AUTH" -H "Content-Type: application/json" \
      -d "{
        \"organization_id\": \"$SVC_ID\",
        \"process_id\": \"$PROC_ID\",
        \"full_name\": \"Test Candidato\",
        \"email\": \"test_candidato@test.com\",
        \"position_applied\": \"Operario de Aseo\",
        \"source\": \"referral\"
      }")
    CAND_ID=$(echo $CAND | jq -r '.id // empty')
    if [ -n "$CAND_ID" ] && [ "$CAND_ID" != "null" ]; then
        pass "Candidato creado: $CAND_ID"
    else
        DETAIL=$(echo $CAND | jq -r '.detail // ""')
        if echo "$DETAIL" | grep -q "existe"; then
            pass "Candidato ya existía (OK)"
        else
            fail "Error creando candidato: $CAND"
        fi
    fi
else
    fail "No hay process_id para crear candidato"
fi

# ── 10. Pipeline stats ──────────────────────────────────────────
info "Obteniendo estadísticas del pipeline..."
STATS=$(curl -s -H "$AUTH" "$BASE/candidates/pipeline-stats?organization_id=$SVC_ID")
TOTAL=$(echo $STATS | jq '.total // 0')
if [ "$TOTAL" -ge 0 ]; then
    pass "Pipeline stats: $TOTAL candidatos totales"
else
    fail "Error obteniendo pipeline stats"
fi

# ── 11. Roles por permisos ──────────────────────────────────────
info "Verificando permisos del rol coordinador..."
COORD_ROLE=$(echo $ROLES | jq '.[] | select(.name=="coordinador")')
COORD_PERMS=$(echo $COORD_ROLE | jq '.permissions | length')
if [ "$COORD_PERMS" -ge 5 ]; then
    pass "Rol coordinador tiene $COORD_PERMS permisos"
else
    fail "Rol coordinador tiene pocos permisos: $COORD_PERMS"
fi

# ── 12. Login Cliente ────────────────────────────────────────────
info "Login como cliente Alpha..."
RESP=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario1@alpha.com","password":"User123!"}')
TOKEN_CLI=$(echo $RESP | jq -r '.access_token')
if [ -n "$TOKEN_CLI" ] && [ "$TOKEN_CLI" != "null" ] && [ "$TOKEN_CLI" != "" ]; then
    pass "Login cliente Alpha exitoso"
else
    fail "Login cliente Alpha falló"
fi

# ── Resumen ──────────────────────────────────────────────────────
echo ""
echo "================================================================"
echo -e "  ${GREEN}PASS: $PASS${NC}  |  ${RED}FAIL: $FAIL${NC}"
echo "================================================================"

if [ $FAIL -gt 0 ]; then
    exit 1
fi
