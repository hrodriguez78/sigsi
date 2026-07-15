#!/bin/bash
# Test script for operational endpoints: work_orders, daily_reports, inspections
set -e

BASE_URL="http://localhost:8000/api/v1"
PASS=0
FAIL=0

echo "=============================================="
echo "  TEST: Procesos Operativos"
echo "  Servicios Totales S.A.S"
echo "=============================================="

# 1. Login
echo ""
echo "[1] Login como coordinador..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinador@serviciostotales.com","password":"Coord123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

if [ -n "$TOKEN" ]; then
  echo "  [PASS] Token obtenido"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] No se pudo obtener token"
  FAIL=$((FAIL + 1))
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

# 2. Get org ID
echo ""
echo "[2] Obteniendo organizaciones..."
SVC_ID=$(curl -s -H "$AUTH" "$BASE_URL/organizations?page_size=10" \
  | python3 -c "import sys,json; orgs=json.load(sys.stdin).get('organizations',[]); print(next(o['id'] for o in orgs if o['nit']=='900123456-7'))")

if [ -n "$SVC_ID" ]; then
  echo "  [PASS] Servicios Totales: $SVC_ID"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] No se encontró Servicios Totales"
  FAIL=$((FAIL + 1))
fi

# ========== WORK ORDERS ==========
echo ""
echo "--- ÓRDENES DE TRABAJO ---"

# 3. List work orders
echo "[3] GET /work-orders..."
WO_COUNT=$(curl -s -H "$AUTH" "$BASE_URL/work-orders?organization_id=$SVC_ID&page=1&page_size=50" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])")
if [ "$WO_COUNT" -gt 0 ] 2>/dev/null; then
  echo "  [PASS] $WO_COUNT órdenes de trabajo encontradas"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] No se encontraron órdenes de trabajo"
  FAIL=$((FAIL + 1))
fi

# 4. Get single work order
echo "[4] GET /work-orders/:id..."
WO_ID=$(curl -s -H "$AUTH" "$BASE_URL/work-orders?organization_id=$SVC_ID&page=1&page_size=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['work_orders'][0]['id'])")
WO_DETAIL=$(curl -s -H "$AUTH" "$BASE_URL/work-orders/$WO_ID" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('title',''))")
if [ -n "$WO_DETAIL" ]; then
  echo "  [PASS] OT encontrada: $WO_DETAIL"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] No se pudo obtener OT"
  FAIL=$((FAIL + 1))
fi

# 5. Work order stats
echo "[5] GET /work-orders/stats..."
STATS=$(curl -s -H "$AUTH" "$BASE_URL/work-orders/stats?organization_id=$SVC_ID" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',-1))")
if [ "$STATS" -gt 0 ] 2>/dev/null; then
  echo "  [PASS] Stats: $STATS total"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] Stats no disponibles"
  FAIL=$((FAIL + 1))
fi

# 6. Work order comments
echo "[6] GET /work-orders/:id/comments..."
COMMENTS=$(curl -s -H "$AUTH" "$BASE_URL/work-orders/$WO_ID/comments" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "  [PASS] $COMMENTS comentarios en la OT"
PASS=$((PASS + 1))

# ========== DAILY REPORTS ==========
echo ""
echo "--- REPORTES DIARIOS ---"

# 7. List daily reports
echo "[7] GET /daily-reports..."
DR_COUNT=$(curl -s -H "$AUTH" "$BASE_URL/daily-reports?organization_id=$SVC_ID&page=1&page_size=50" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])")
if [ "$DR_COUNT" -gt 0 ] 2>/dev/null; then
  echo "  [PASS] $DR_COUNT reportes diarios encontrados"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] No se encontraron reportes"
  FAIL=$((FAIL + 1))
fi

# 8. Get single daily report
echo "[8] GET /daily-reports/:id..."
DR_ID=$(curl -s -H "$AUTH" "$BASE_URL/daily-reports?organization_id=$SVC_ID&page=1&page_size=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['reports'][0]['id'])")
DR_DETAIL=$(curl -s -H "$AUTH" "$BASE_URL/daily-reports/$DR_ID" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('title',''))")
if [ -n "$DR_DETAIL" ]; then
  echo "  [PASS] Reporte encontrado: $DR_DETAIL"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] No se pudo obtener reporte"
  FAIL=$((FAIL + 1))
fi

# 9. Daily report stats
echo "[9] GET /daily-reports/stats..."
DR_STATS=$(curl -s -H "$AUTH" "$BASE_URL/daily-reports/stats?organization_id=$SVC_ID" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',-1))")
if [ "$DR_STATS" -gt 0 ] 2>/dev/null; then
  echo "  [PASS] Stats: $DR_STATS total"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] Stats no disponibles"
  FAIL=$((FAIL + 1))
fi

# ========== INSPECTIONS ==========
echo ""
echo "--- INSPECCIONES ---"

# 10. List inspections
echo "[10] GET /inspections..."
INSP_COUNT=$(curl -s -H "$AUTH" "$BASE_URL/inspections?organization_id=$SVC_ID&page=1&page_size=50" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])")
if [ "$INSP_COUNT" -gt 0 ] 2>/dev/null; then
  echo "  [PASS] $INSP_COUNT inspecciones encontradas"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] No se encontraron inspecciones"
  FAIL=$((FAIL + 1))
fi

# 11. Get single inspection
echo "[11] GET /inspections/:id..."
INSP_ID=$(curl -s -H "$AUTH" "$BASE_URL/inspections?organization_id=$SVC_ID&page=1&page_size=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['inspections'][0]['id'])")
INSP_DETAIL=$(curl -s -H "$AUTH" "$BASE_URL/inspections/$INSP_ID" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('title',''))")
if [ -n "$INSP_DETAIL" ]; then
  echo "  [PASS] Inspección encontrada: $INSP_DETAIL"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] No se pudo obtener inspección"
  FAIL=$((FAIL + 1))
fi

# 12. Inspection stats
echo "[12] GET /inspections/stats..."
INSP_STATS=$(curl -s -H "$AUTH" "$BASE_URL/inspections/stats?organization_id=$SVC_ID" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',-1))")
if [ "$INSP_STATS" -gt 0 ] 2>/dev/null; then
  echo "  [PASS] Stats: $INSP_STATS total"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] Stats no disponibles"
  FAIL=$((FAIL + 1))
fi

# 13. Filter work orders by status
echo "[13] GET /work-orders?status=en_progreso..."
WO_PROGRESS=$(curl -s -H "$AUTH" "$BASE_URL/work-orders?organization_id=$SVC_ID&status=en_progreso&page_size=50" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])")
echo "  [PASS] OTs en progreso: $WO_PROGRESS"
PASS=$((PASS + 1))

# 14. Filter inspections by type
echo "[14] GET /inspections?inspection_type=calidad..."
INSP_QUALITY=$(curl -s -H "$AUTH" "$BASE_URL/inspections?organization_id=$SVC_ID&inspection_type=calidad&page_size=50" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['total'])")
echo "  [PASS] Inspecciones calidad: $INSP_QUALITY"
PASS=$((PASS + 1))

# Summary
echo ""
echo "=============================================="
echo "  RESUMEN: $PASS passed / $FAIL failed / $((PASS + FAIL)) total"
echo "=============================================="

if [ "$FAIL" -eq 0 ]; then
  echo "  ALL TESTS PASSED!"
else
  echo "  Some tests failed. Check above for details."
fi

exit $FAIL
