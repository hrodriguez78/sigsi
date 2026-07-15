#!/usr/bin/env python3
"""
Script de seed para la demo de contratación.
Crea operarios y procesos de contratación para la empresa Servicios Totales.

Uso:
    python scripts/seed_demo_contratacion.py

Requisitos: El backend FastAPI debe estar corriendo en http://localhost:8000
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def login(email: str, password: str) -> str:
    """Login y retorna el token JWT."""
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password,
    })
    resp.raise_for_status()
    return resp.json()["access_token"]

def headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def create_user(token: str, email: str, password: str, full_name: str, org_id: str, roles: list) -> dict:
    """Crea un usuario via API."""
    resp = requests.post(f"{BASE_URL}/users", headers=headers(token), json={
        "email": email,
        "password": password,
        "full_name": full_name,
        "organization_id": org_id,
    })
    if resp.status_code == 409:
        print(f"  [SKIP] Usuario {email} ya existe")
        return {}
    resp.raise_for_status()
    user = resp.json()
    # Asignar roles
    requests.put(f"{BASE_URL}/roles/users/{user['id']}", headers=headers(token), json={
        "role_names": roles,
    })
    print(f"  [OK] {full_name} ({email}) -> roles: {roles}")
    return user

def create_process(token: str, org_id: str, name: str, code: str, parent_id: str = None, desc: str = "") -> dict:
    """Crea un proceso."""
    resp = requests.post(f"{BASE_URL}/processes", headers=headers(token), json={
        "organization_id": org_id,
        "name": name,
        "code": code,
        "process_type": "operativo",
        "description": desc,
        "parent_id": parent_id,
        "status": "activo",
    })
    if resp.status_code == 409:
        print(f"  [SKIP] Proceso {code} ya existe")
        return {}
    resp.raise_for_status()
    p = resp.json()
    print(f"  [OK] Proceso: {name} ({code})")
    return p

def create_candidate(token: str, org_id: str, process_id: str, name: str, email: str, position: str, source: str = "referral") -> dict:
    """Crea un candidato."""
    resp = requests.post(f"{BASE_URL}/candidates", headers=headers(token), json={
        "organization_id": org_id,
        "process_id": process_id,
        "full_name": name,
        "email": email,
        "position_applied": position,
        "source": source,
    })
    if resp.status_code == 409:
        print(f"  [SKIP] Candidato {email} ya existe")
        return {}
    resp.raise_for_status()
    c = resp.json()
    print(f"  [OK] Candidato: {name} ({email})")
    return c

def main():
    print("=" * 60)
    print("  SEED DEMO: Procesos de Contratación")
    print("  Servicios Totales S.A.S")
    print("=" * 60)

    # 1. Login como admin
    print("\n[1] Login como administrador...")
    try:
        token = login("admin@sgi.local", "Admin123!")
        print("  [OK] Token obtenido")
    except Exception as e:
        print(f"  [ERROR] No se pudo hacer login: {e}")
        print("  Asegúrese de que el backend está corriendo en http://localhost:8000")
        sys.exit(1)

    # 2. Obtener IDs de organizaciones
    print("\n[2] Obteniendo organizaciones...")
    resp = requests.get(f"{BASE_URL}/organizations?page_size=50", headers=headers(token))
    resp.raise_for_status()
    resp_data = resp.json()
    orgs = resp_data.get("organizations", resp_data) if isinstance(resp_data, dict) else resp_data
    org_map = {o["nit"]: o["id"] for o in orgs}
    svc_id = org_map.get("900123456-7", "")
    if not svc_id:
        print("  [ERROR] No se encontró Servicios Totales S.A.S")
        sys.exit(1)
    print(f"  [OK] Servicios Totales: {svc_id}")

    # 3. Crear 7 operarios
    print("\n[3] Creando 7 operarios de aseo...")
    operarios = [
        ("operario1@serviciostotales.com", "Operario Uno"),
        ("operario2@serviciostotales.com", "Operario Dos"),
        ("operario3@serviciostotales.com", "Operario Tres"),
        ("operario4@serviciostotales.com", "Operario Cuatro"),
        ("operario5@serviciostotales.com", "Operario Cinco"),
        ("operario6@serviciostotales.com", "Operario Seis"),
        ("operario7@serviciostotales.com", "Operario Siete"),
    ]
    for email, name in operarios:
        create_user(token, email, "Oper123!", name, svc_id, ["operario"])

    # 4. Crear 2 "toderos" (técnico多功能)
    print("\n[4] Creando 2 toderos (técnicos multifunción)...")
    toderos = [
        ("todero1@serviciostotales.com", "Carlos Todero"),
        ("todero2@serviciostotales.com", "Luis Todero"),
    ]
    for email, name in toderos:
        create_user(token, email, "Todero123!", name, svc_id, ["operario"])

    # 5. Crear usuario cliente en Corporación Gamma
    print("\n[5] Creando usuario cliente en Corporación Gamma...")
    gamma_id = org_map.get("900333789-0", "")
    if gamma_id:
        create_user(token, "usuario1@gamma.com", "User123!", "Andrea Cliente", gamma_id, ["cliente_contacto"])
    else:
        print("  [SKIP] No se encontró Corporación Gamma")

    # 6. Crear procesos de contratación
    print("\n[6] Creando procesos de contratación...")
    p_raiz = create_process(token, svc_id, "Gestión de Talento Humano", "GTH-001",
                            desc="Procesos relacionados con el talento humano")
    p_contratacion = create_process(token, svc_id, "Procesos de Contratación", "GTH-CTR-001",
                                     parent_id=p_raiz.get("id"), desc="Flujo de selección y contratación")
    create_process(token, svc_id, "Inducción y Capacitación", "GTH-IND-001",
                    parent_id=p_raiz.get("id"), desc="Onboarding de nuevo personal")
    create_process(token, svc_id, "Evaluación de Desempeño", "GTH-EVD-001",
                    parent_id=p_raiz.get("id"), desc="Evaluaciones periódicas")

    # 7. Crear procesos operativos
    print("\n[7] Creando procesos operativos...")
    p_ops = create_process(token, svc_id, "Gestión Operativa", "GO-001",
                            desc="Procesos operativos del servicio")
    p_aseo = create_process(token, svc_id, "Servicios de Aseo", "GO-ASEO-001",
                             parent_id=p_ops.get("id"), desc="Todos los servicios de aseo")
    create_process(token, svc_id, "Aseo Interior", "GO-ASEO-INT",
                    parent_id=p_aseo.get("id"), desc="Limpieza de interiores")
    create_process(token, svc_id, "Aseo Exterior", "GO-ASEO-EXT",
                    parent_id=p_aseo.get("id"), desc="Limpieza de exteriores")
    p_mant = create_process(token, svc_id, "Servicios de Mantenimiento", "GO-MANT-001",
                             parent_id=p_ops.get("id"), desc="Mantenimiento general")
    create_process(token, svc_id, "Mantenimiento Preventivo", "GO-MANT-PREV",
                    parent_id=p_mant.get("id"), desc="Mantenimiento preventivo programado")
    create_process(token, svc_id, "Mantenimiento Correctivo", "GO-MANT-CORR",
                    parent_id=p_mant.get("id"), desc="Reparaciones por fallas")

    # 8. Crear candidatos demo
    if p_contratacion.get("id"):
        print("\n[8] Creando candidatos demo...")
        candidatos = [
            ("Maria Limpieza", "maria@email.com", "Operaria de Aseo", "portal"),
            ("Jose Mantenimiento", "jose@email.com", "Técnico de Mantenimiento", "linkedin"),
            ("Pedro Multifuncion", "pedro@email.com", "Operario Multifunción", "referral"),
        ]
        for name, email, pos, src in candidatos:
            create_candidate(token, svc_id, p_contratacion["id"], name, email, pos, src)

    print("\n" + "=" * 60)
    print("  SEED COMPLETADO")
    print("=" * 60)
    print("\nResumen:")
    print("  - 1 Coordinador: coordinador@serviciostotales.com / Coord123!")
    print("  - 7 Operarios: operario[N]@serviciostotales.com / Oper123!")
    print("  - 2 Toderos: todero[N]@serviciostotales.com / Todero123!")
    print("  - 1 Cliente Gamma: usuario1@gamma.com / User123!")
    print("  - Procesos jerárquicos creados")
    print("  - 3 candidatos demo creados")
    print("\nAcceso Frontend: http://localhost:4200")
    print("Acceso API Docs: http://localhost:8000/docs")


if __name__ == "__main__":
    main()
