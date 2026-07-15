#!/usr/bin/env python3
"""
Script de seed para datos operativos de la demo.
Crea órdenes de trabajo, reportes diarios e inspecciones para Servicios Totales.

Uso:
    python scripts/seed_demo_operaciones.py

Requisitos: El backend FastAPI debe estar corriendo en http://localhost:8000
"""

import requests
import json
import sys
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"


def login(email, password):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    resp.raise_for_status()
    return resp.json()["access_token"]


def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def main():
    print("=" * 60)
    print("  SEED DEMO: Procesos Operativos")
    print("  Servicios Totales S.A.S")
    print("=" * 60)

    # 1. Login
    print("\n[1] Login como coordinador...")
    try:
        token = login("coordinador@serviciostotales.com", "Coord123!")
        print("  [OK] Token obtenido")
    except Exception:
        print("  [ERROR] Intentando con admin...")
        try:
            token = login("admin@sgi.local", "Admin123!")
            print("  [OK] Token admin obtenido")
        except Exception as e:
            print(f"  [ERROR] No se pudo hacer login: {e}")
            sys.exit(1)

    # 2. Obtener organizaciones
    print("\n[2] Obteniendo organizaciones...")
    resp = requests.get(f"{BASE_URL}/organizations?page_size=50", headers=headers(token))
    resp.raise_for_status()
    orgs = resp.json().get("organizations", resp.json()) if isinstance(resp.json(), dict) else resp.json()
    org_map = {o["nit"]: o["id"] for o in orgs}
    svc_id = org_map.get("900123456-7", "")
    c1_id = org_map.get("900987654-3", "")
    c2_id = org_map.get("900555123-4", "")
    c3_id = org_map.get("900333789-0", "")
    print(f"  [OK] Servicios Totales: {svc_id}")
    print(f"  [OK] Alpha: {c1_id}, Beta: {c2_id}, Gamma: {c3_id}")

    # 3. Obtener coordinador ID
    print("\n[3] Obteniendo usuarios...")
    users = requests.get(f"{BASE_URL}/users", headers=headers(token)).json()
    coord_id = ""
    operarios = []
    for u in users:
        if u["email"] == "coordinador@serviciostotales.com":
            coord_id = u["id"]
        if "operario" in u.get("roles", []) or "todero" in u["email"]:
            operarios.append({"id": u["id"], "name": u["full_name"]})
    print(f"  [OK] Coordinador: {coord_id}")
    print(f"  [OK] Operarios encontrados: {len(operarios)}")

    # 4. Crear Órdenes de Trabajo
    print("\n[4] Creando órdenes de trabajo...")
    now = datetime.now()
    wo_data = [
        {
            "organization_id": svc_id, "client_organization_id": c1_id,
            "title": "Aseo integral oficinas piso 3 - Alpha",
            "description": "Limpieza completa de oficinas del piso 3 incluyendo áreas comunes, baños y sala de juntas.",
            "order_type": "aseo_interior", "priority": "media",
            "assigned_to": operarios[0]["id"] if operarios else None,
            "assigned_to_name": operarios[0]["name"] if operarios else "",
            "scheduled_date": (now + timedelta(days=1)).isoformat(),
            "due_date": (now + timedelta(days=1, hours=8)).isoformat(),
            "location": "Torre Alpha, Piso 3",
            "notes": "Acceso por tarjeta magnética. Usar productos certificados.",
            "status": "programada",
        },
        {
            "organization_id": svc_id, "client_organization_id": c2_id,
            "title": "Mantenimiento preventivo aire acondicionado",
            "description": "Revisión y mantenimiento preventivo de 12 unidades de aire acondicionado en bodega principal.",
            "order_type": "mantenimiento_preventivo", "priority": "alta",
            "assigned_to": operarios[1]["id"] if len(operarios) > 1 else None,
            "assigned_to_name": operarios[1]["name"] if len(operarios) > 1 else "",
            "scheduled_date": now.isoformat(),
            "due_date": (now + timedelta(hours=6)).isoformat(),
            "location": "Bodega Beta, Zona A",
            "status": "en_progreso",
        },
        {
            "organization_id": svc_id, "client_organization_id": c3_id,
            "title": "Emergencia: derrame en servidor room",
            "description": "Derrame de agua por tubería rota en sala de servidores. Reqiere limpieza inmediata y secado.",
            "order_type": "emergencia", "priority": "critica",
            "assigned_to": operarios[2]["id"] if len(operarios) > 2 else None,
            "assigned_to_name": operarios[2]["name"] if len(operarios) > 2 else "",
            "scheduled_date": now.isoformat(),
            "due_date": (now + timedelta(hours=2)).isoformat(),
            "location": "Corporación Gamma, Sótano 2",
            "status": "completada",
            "resolution_notes": "Derrame contenido. Equipos revisados sin daño. Piso seco.",
        },
        {
            "organization_id": svc_id, "client_organization_id": c1_id,
            "title": "Aseo exterior parqueadero",
            "description": "Limpieza y desinfección del parqueadero exterior, incluyendo rampas y señalización.",
            "order_type": "aseo_exterior", "priority": "baja",
            "assigned_to": operarios[3]["id"] if len(operarios) > 3 else None,
            "assigned_to_name": operarios[3]["name"] if len(operarios) > 3 else "",
            "scheduled_date": (now + timedelta(days=3)).isoformat(),
            "due_date": (now + timedelta(days=3, hours=4)).isoformat(),
            "location": "Torre Alpha, Parqueadero",
            "status": "pendiente",
        },
        {
            "organization_id": svc_id, "client_organization_id": c2_id,
            "title": "Mantenimiento correctivo bomba de agua",
            "description": "Reparación de bomba de agua del sistema de riego automático.",
            "order_type": "mantenimiento_correctivo", "priority": "alta",
            "assigned_to": operarios[4]["id"] if len(operarios) > 4 else None,
            "assigned_to_name": operarios[4]["name"] if len(operarios) > 4 else "",
            "scheduled_date": (now - timedelta(days=1)).isoformat(),
            "due_date": now.isoformat(),
            "location": "Beta, Zona de jardines",
            "status": "verificada",
            "resolution_notes": "Bomba reparada. Sistema de riego operativo al 100%.",
        },
        {
            "organization_id": svc_id, "client_organization_id": c3_id,
            "title": "Aseo industrial zona de producción",
            "description": "Limpieza profunda de zona de producción con protocolo industrial.",
            "order_type": "aseo_industrial", "priority": "media",
            "scheduled_date": (now + timedelta(days=2)).isoformat(),
            "due_date": (now + timedelta(days=2, hours=6)).isoformat(),
            "location": "Gamma, Planta 1",
            "status": "programada",
        },
        {
            "organization_id": svc_id, "client_organization_id": c1_id,
            "title": "Instalación sistema de filtración",
            "description": "Instalación de nuevo sistema de filtración de agua en cafetería.",
            "order_type": "instalacion", "priority": "media",
            "scheduled_date": (now + timedelta(days=5)).isoformat(),
            "due_date": (now + timedelta(days=5, hours=4)).isoformat(),
            "location": "Alpha, Cafetería Piso 1",
            "status": "pendiente",
        },
    ]

    wo_ids = []
    for wo in wo_data:
        resp = requests.post(f"{BASE_URL}/work-orders", headers=headers(token), json=wo)
        if resp.status_code == 201:
            wo_ids.append(resp.json()["id"])
            print(f"  [OK] OT: {wo['title'][:50]}")
        else:
            print(f"  [SKIP] {wo['title'][:30]}: {resp.json().get('detail', 'error')}")

    # 5. Crear Reportes Diarios
    print("\n[5] Creando reportes diarios...")
    reports_data = [
        {
            "organization_id": svc_id, "client_organization_id": c1_id,
            "work_order_id": wo_ids[2] if len(wo_ids) > 2 else None,
            "report_type": "reporte_servicio",
            "report_date": (now - timedelta(days=1)).strftime("%Y-%m-%d"),
            "reported_by": "Operario Tres",
            "title": "Reporte emergencia derrame Gamma",
            "description": "Se atendió emergencia de derrame en sala de servidores. Trabajo realizado de 2:30pm a 5:45pm.",
            "activities_performed": [
                " evaluación inicial del derrame",
                " Contención con material absorbente",
                " Secado de piso con equipo industrial",
                " Inspección de equipos electrónicos",
                " Desinfección del área",
            ],
            "hours_worked": 3.25,
            "materials_used": [
                {"name": "Material absorbente", "quantity": "5 kg"},
                {"name": "Desinfectante industrial", "quantity": "2 litros"},
                {"name": "Toallas industriales", "quantity": "20 unidades"},
            ],
            "issues_found": ["Tubería con corrosión detectada", "Cable UTP expuesto cerca del derrame"],
            "recommendations": "Revisar tubería con mantenimiento preventivo programado. Acomodar cables expuestos.",
            "status": "aprobado",
        },
        {
            "organization_id": svc_id, "client_organization_id": c2_id,
            "work_order_id": wo_ids[4] if len(wo_ids) > 4 else None,
            "report_type": "reporte_mantenimiento",
            "report_date": now.strftime("%Y-%m-%d"),
            "reported_by": "Operario Cinco",
            "title": "Reporte mantenimiento bomba de agua",
            "description": "Reparación de bomba de agua. Se identificó falla en sellos mecánicos.",
            "activities_performed": [
                " Diagnóstico de la bomba",
                " Desmontaje de sellos",
                " Reemplazo de sellos mecánicos",
                " Prueba de funcionamiento",
                " Calibración del sistema",
            ],
            "hours_worked": 4.5,
            "materials_used": [
                {"name": "Sellos mecánicos", "quantity": "2 unidades"},
                {"name": "Grasa de alta temperatura", "quantity": "500g"},
            ],
            "issues_found": [],
            "recommendations": "Programar revisión de bombas cada 3 meses.",
            "status": "enviado",
        },
        {
            "organization_id": svc_id, "client_organization_id": c1_id,
            "report_type": "bitacora_diaria",
            "report_date": now.strftime("%Y-%m-%d"),
            "reported_by": "Operario Uno",
            "title": "Bitácora diaria aseo piso 3 - Alpha",
            "description": "Rutina diaria de aseo completada en todas las oficinas del piso 3.",
            "activities_performed": [
                " Aspirado de alfombras",
                " Fregado de pisos",
                " Limpieza de baños (3)",
                " Limpieza de sala de juntas",
                " Aseo de área de café",
            ],
            "hours_worked": 6.0,
            "materials_used": [
                {"name": "Limpiador multiusos", "quantity": "1 litro"},
                {"name": "Papel higiénico", "quantity": "6 rollos"},
                {"name": "Bolsas de basura", "quantity": "10 unidades"},
            ],
            "issues_found": ["Fuga de agua en baño 2"],
            "status": "borrador",
        },
    ]

    for rpt in reports_data:
        resp = requests.post(f"{BASE_URL}/daily-reports", headers=headers(token), json=rpt)
        if resp.status_code == 201:
            print(f"  [OK] Reporte: {rpt['title'][:50]}")
        else:
            print(f"  [SKIP] {rpt['title'][:30]}: {resp.json().get('detail', 'error')}")

    # 6. Crear Inspecciones
    print("\n[6] Creando inspecciones...")
    insp_data = [
        {
            "organization_id": svc_id, "client_organization_id": c1_id,
            "work_order_id": wo_ids[0] if wo_ids else None,
            "inspection_type": "calidad",
            "title": "Inspección calidad aseo piso 3",
            "description": "Verificación de calidad del servicio de aseo en oficinas Alpha.",
            "scheduled_date": (now + timedelta(days=2)).strftime("%Y-%m-%d"),
            "inspector_name": "Carlos Coordinador",
            "location": "Torre Alpha, Piso 3",
            "checklist": [
                {"description": "Pisos limpios y sin manchas", "status": "pendiente"},
                {"description": "Baños desinfectados y abastecidos", "status": "pendiente"},
                {"description": "Papelera vaciadas", "status": "pendiente"},
                {"description": "Escritorios libre de polvo", "status": "pendiente"},
                {"description": "Vidrios sin marcas", "status": "pendiente"},
                {"description": "Olores agradables", "status": "pendiente"},
            ],
            "status": "programada",
        },
        {
            "organization_id": svc_id, "client_organization_id": c2_id,
            "work_order_id": wo_ids[1] if len(wo_ids) > 1 else None,
            "inspection_type": "operacional",
            "title": "Inspección mantenimiento A/C",
            "description": "Verificación del mantenimiento preventivo de aire acondicionado.",
            "scheduled_date": now.strftime("%Y-%m-%d"),
            "inspector_name": "Carlos Coordinador",
            "location": "Beta, Zona A",
            "checklist": [
                {"description": "Filtros limpios", "status": "cumple", "observation": "Filtros cambiados"},
                {"description": "Gas refrigerante OK", "status": "cumple"},
                {"description": "Drenaje libre de obstrucciones", "status": "cumple"},
                {"description": "Temperatura de salida correcta", "status": "cumple", "observation": "22°C"},
                {"description": "Ruidos anormales", "status": "no_cumple", "observation": "Unidad 7 con ruido leve"},
            ],
            "findings": ["Unidad 7 presenta ruido anormal en compresor", "2 unidades con filtros deteriorados"],
            "corrective_actions": ["Programar reparación de compresor unidad 7", "Reemplazar filtros de unidades 3 y 11"],
            "score": 78.5,
            "status": "completada",
            "result": "parcial",
        },
        {
            "organization_id": svc_id, "client_organization_id": c3_id,
            "inspection_type": "seguridad_industrial",
            "title": "Inspección seguridad sala servidores",
            "description": "Inspección post-emergencia de derrame en sala de servidores.",
            "scheduled_date": (now - timedelta(days=1)).strftime("%Y-%m-%d"),
            "inspector_name": "Carlos Coordinador",
            "location": "Gamma, Sótano 2",
            "checklist": [
                {"description": "Piso seco y libre de humedad", "status": "cumple"},
                {"description": "Equipos funcionando correctamente", "status": "cumple"},
                {"description": "Sin cables expuestos", "status": "no_cumple", "observation": "2 cables UTP expuestos"},
                {"description": "Sistema de extintores OK", "status": "cumple"},
                {"description": "Señalización de emergencia visible", "status": "cumple"},
            ],
            "findings": ["2 cables UTP expuestos cerca del área del derrame", "Tubería con signos de corrosión"],
            "corrective_actions": ["Reubicar y proteger cables UTP", "Programar reemplazo de tramo de tubería"],
            "score": 85.0,
            "status": "completada",
            "result": "aprobado",
        },
    ]

    for insp in insp_data:
        resp = requests.post(f"{BASE_URL}/inspections", headers=headers(token), json=insp)
        if resp.status_code == 201:
            print(f"  [OK] Inspección: {insp['title'][:50]}")
        else:
            print(f"  [SKIP] {insp['title'][:30]}: {resp.json().get('detail', 'error')}")

    print("\n" + "=" * 60)
    print("  SEED OPERACIONAL COMPLETADO")
    print("=" * 60)
    print("\nResumen:")
    print(f"  - {len(wo_ids)} Órdenes de trabajo creadas")
    print(f"  - {len(reports_data)} Reportes diarios creados")
    print(f"  - {len(insp_data)} Inspecciones creadas")
    print("\nEstados representados:")
    print("  OTs: pendiente, programada, en_progreso, completada, verificada")
    print("  Reportes: borrador, enviado, aprobado")
    print("  Inspecciones: programada, completada (aprobada, parcial)")


if __name__ == "__main__":
    main()
