import json
import os
import httpx
from typing import Optional


AI_PROVIDER = "ollama"
OLLAMA_URL = "http://ollama:11434"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-3.5-turbo"


def _get_iso_context() -> str:
    return """Eres un asistente experto en ISO 27001:2022, ISO 27002, ISO 27005, ISO 31001 y sistemas de gestión de seguridad de la información (SGSI).
Conoces a fondo los 93 controles del Anexo A de ISO 27001:2022, organizados en 4 categorías: organizativo (37 controles), personas (8 controles), físico (14 controles) y tecnológico (34 controles).
Puedes ayudar con: políticas, procedimientos, análisis de brechas, matrices de riesgo, declaraciones de aplicabilidad, y recomendaciones de controles."""


SYSTEM_PROMPT = _get_iso_context()


ISO_CONTROLS = {
    "A.5": "Controles Organizativos",
    "A.5.1": "Policies for information security",
    "A.5.2": "Information security roles and responsibilities",
    "A.5.3": "Segregation of duties",
    "A.5.4": "Management responsibilities",
    "A.5.5": "Contact with authorities",
    "A.5.6": "Contact with special interest groups",
    "A.5.7": "Threat intelligence",
    "A.5.8": "Information security in project management",
    "A.5.9": "Inventory of information and other associated assets",
    "A.5.10": "Acceptable use of information and other associated assets",
    "A.5.11": "Return of assets",
    "A.5.12": "Classification of information",
    "A.5.13": "Labelling of information",
    "A.5.14": "Information transfer",
    "A.5.15": "Access control",
    "A.5.16": "Identity management",
    "A.5.17": "Authentication information",
    "A.5.18": "Access rights",
    "A.5.19": "Information security in supplier relationships",
    "A.5.20": "Addressing information security within supplier agreements",
    "A.5.21": "Managing information security in the ICT supply chain",
    "A.5.22": "Monitoring, review and change management of supplier services",
    "A.5.23": "Information security for use of cloud services",
    "A.5.24": "Information security incident management planning and preparation",
    "A.5.25": "Assessment and decision on information security events",
    "A.5.26": "Response to information security incidents",
    "A.5.27": "Learning from information security incidents",
    "A.5.28": "Collection of evidence",
    "A.5.29": "Information security during disruption",
    "A.5.30": "ICT readiness for business continuity",
    "A.5.31": "Legal, statutory, regulatory and contractual requirements",
    "A.5.32": "Intellectual property rights",
    "A.5.33": "Protection of records",
    "A.5.34": "Privacy and protection of PII",
    "A.5.35": "Independent review of information security",
    "A.5.36": "Compliance with policies, rules and standards for information security",
    "A.5.37": "Documented operating procedures",
    "A.6": "Controles de Personas",
    "A.6.1": "Screening",
    "A.6.2": "Terms and conditions of employment",
    "A.6.3": "Information security awareness, education and training",
    "A.6.4": "Disciplinary process",
    "A.6.5": "Responsibilities after termination or change of employment",
    "A.6.6": "Confidentiality or non-disclosure agreements",
    "A.6.7": "Remote working",
    "A.6.8": "Information security event reporting",
    "A.7": "Controles Físicos",
    "A.7.1": "Physical security perimeters",
    "A.7.2": "Physical entry",
    "A.7.3": "Securing offices, rooms and facilities",
    "A.7.4": "Physical security monitoring",
    "A.7.5": "Protecting against physical and environmental threats",
    "A.7.6": "Working in secure areas",
    "A.7.7": "Clear desk and clear screen",
    "A.7.8": "Equipment siting and protection",
    "A.7.9": "Security of assets off-premises",
    "A.7.10": "Storage media",
    "A.7.11": "Supporting utilities",
    "A.7.12": "Cabling security",
    "A.7.13": "Equipment maintenance",
    "A.7.14": "Secure disposal or re-use of equipment",
    "A.8": "Controles Tecnológicos",
    "A.8.1": "User endpoint devices",
    "A.8.2": "Privileged access rights",
    "A.8.3": "Information access restriction",
    "A.8.4": "Access to source code",
    "A.8.5": "Secure authentication",
    "A.8.6": "Capacity management",
    "A.8.7": "Protection against malware",
    "A.8.8": "Management of technical vulnerabilities",
    "A.8.9": "Configuration management",
    "A.8.10": "Information deletion",
    "A.8.11": "Data masking",
    "A.8.12": "Data leakage prevention",
    "A.8.13": "Information backup",
    "A.8.14": "Redundancy of information processing facilities",
    "A.8.15": "Logging",
    "A.8.16": "Monitoring activities",
    "A.8.17": "Clock synchronization",
    "A.8.18": "Use of privileged utility programs",
    "A.8.19": "Installation of software on operational systems",
    "A.8.20": "Networks security",
    "A.8.21": "Security of network services",
    "A.8.22": "Segregation of networks",
    "A.8.23": "Web filtering",
    "A.8.24": "Use of cryptography",
    "A.8.25": "Secure development life cycle",
    "A.8.26": "Application security requirements",
    "A.8.27": "Secure system architecture and engineering principles",
    "A.8.28": "Secure coding",
    "A.8.29": "Security testing in development and acceptance",
    "A.8.30": "Outsourced development",
    "A.8.31": "Separation of development, test and production environments",
    "A.8.32": "Change management",
    "A.8.33": "Test information",
    "A.8.34": "Protection of information systems during audit testing",
}


async def chat_with_ai(message: str, history: list[dict] = None, context: str = None) -> str:
    messages = [{"role": "system", "content": context or SYSTEM_PROMPT}]

    if history:
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": message})

    if AI_PROVIDER == "ollama":
        return await _call_ollama(messages)
    elif AI_PROVIDER == "openai":
        return await _call_openai(messages)
    else:
        return await _generate_local_response(message)


async def _call_ollama(messages: list[dict]) -> str:
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": "llama3.1",
                    "messages": messages,
                    "stream": False,
                },
            )
            if response.status_code == 200:
                return response.json()["message"]["content"]
            return await _generate_local_response(messages[-1]["content"])
    except Exception:
        return await _generate_local_response(messages[-1]["content"])


async def _call_openai(messages: list[dict]) -> str:
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                json={"model": OPENAI_MODEL, "messages": messages, "max_tokens": 2000},
            )
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            return await _generate_local_response(messages[-1]["content"])
    except Exception:
        return await _generate_local_response(messages[-1]["content"])


async def _generate_local_response(message: str) -> str:
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["política", "politica", "policy"]):
        return await generate_policy_template(message)
    elif any(w in msg_lower for w in ["riesgo", "risk", "matriz"]):
        return await generate_risk_guidance(message)
    elif any(w in msg_lower for w in ["control", "iso 27001", "annex"]):
        return await generate_control_guidance(message)
    elif any(w in msg_lower for w in ["brecha", "gap", "análisis"]):
        return await generate_gap_guidance(message)
    else:
        return f"""Soy tu asistente ISO. Puedo ayudarte con:

1. **Políticas y procedimientos** - Generar borradores basados en ISO 27001
2. **Análisis de brechas** - Evaluar cumplimiento contra controles del Anexo A
3. **Matrices de riesgo** - Guiar la identificación y valoración de riesgos
4. **Controles ISO** - Recomendar controles según tu contexto
5. **Declaración de Aplicabilidad** - Generar SoA

Escribe tu consulta específica para obtener ayuda detallada.

**Nota**: El motor de IA está en modo local sin LLM. Para respuestas completas, configure Ollama o OpenAI."""


async def generate_policy_template(message: str) -> str:
    return """# Política de Seguridad de la Información

## 1. Propósito
Establecer el marco de referencia para la protección de la información de la organización.

## 2. Alcance
Aplica a todos los empleados, contratistas y terceros que accedan a los sistemas de información.

## 3. Referencias
- ISO 27001:2022, Cláusula 5.2
- ISO 27002:2022, Control A.5.1

## 4. Política

### 4.1 Clasificación de la Información
Toda la información debe ser clasificada según su criticidad: Pública, Interna, Confidencial, Estrictamente Confidencial.

### 4.2 Control de Acceso
El acceso a la información se basará en el principio de mínimo privilegio y necesidad de saber.

### 4.3 Seguridad de Contraseñas
- Mínimo 12 caracteres
- Combinar mayúsculas, minúsculas, números y símbolos
- Cambio cada 90 días

### 4.4 Gestión de Incidentes
Todo incidente de seguridad debe reportarse dentro de las primeras 24 horas.

### 4.5 Continuidad del Negocio
Se mantendrán planes de continuidad y recuperación ante desastres revisados semestralmente.

## 5. Responsabilidades
- **Alta Dirección**: Aprobar y proveer recursos
- **CISO/Oficial de Seguridad**: Implementar y supervisar
- **Empleados**: Cumplir y reportar

## 6. Cumplimiento
El incumplimiento de esta política podrá resultar en acciones disciplinarias.

## 7. Revisiones
Esta política será revisada anualmente o cuando existan cambios significativos.

---
*Documento generado con asistencia IA - ISO 27001:2022*"""


async def generate_risk_guidance(message: str) -> str:
    return """## Guía de Gestión de Riesgos - ISO 27001/27005/31000

### Paso 1: Identificación de Riesgos
Para cada activo, identificar:
- **Amenazas**: Qué podría dañar el activo
- **Vulnerabilidades**: Debilidades que podrían ser explotadas
- **Consecuencias**: Impacto si el riesgo se materializa

### Paso 2: Valoración
Usar matriz 5×5:

| Probabilidad | Impacto Bajo | Impacto Medio | Impacto Alto | Impacto Muy Alto | Impacto Catastrófico |
|---|---|---|---|---|---|
| Casi seguro (5) | 5 | 10 | 15 | 20 | 25 |
| Probable (4) | 4 | 8 | 12 | 16 | 20 |
| Posible (3) | 3 | 6 | 9 | 12 | 15 |
| Improbable (2) | 2 | 4 | 6 | 8 | 10 |
| Raro (1) | 1 | 2 | 3 | 4 | 5 |

### Niveles de Riesgo:
- **1-4**: Bajo (Aceptar)
- **5-9**: Medio (Mitigar)
- **10-15**: Alto (Tratar urgentemente)
- **16-25**: Crítico (Evitar o transferir)

### Paso 3: Tratamiento
1. **Mitigar**: Implementar controles para reducir probabilidad/impacto
2. **Transferir**: Seguros, outsourcing
3. **Evitar**: Eliminar la actividad generadora
4. **Aceptar**: Documentar y monitorear

### Paso 4: Seguimiento
- Revisar trimestralmente
- Actualizar cuando cambien activos o amenazas
- Medir efectividad de tratamientos"""


async def generate_control_guidance(message: str) -> str:
    controls_summary = "\n".join([f"- **{k}**: {v}" for k, v in list(ISO_CONTROLS.items())[:20]])
    return f"""## Controles ISO 27001:2022 - Anexo A

### Categorías Principales:

**A.5 - Controles Organizativos (37 controles)**
Gestión de políticas, roles, clasificación, transferencia, acceso.

**A.6 - Controles de Personas (8 controles)**
Screening, capacitación, proceso disciplinario, teletrabajo.

**A.7 - Controles Físicos (14 controles)**
Perímetros, acceso, monitoreo, medios de almacenamiento.

**A.8 - Controles Tecnológicos (34 controles)**
Privilegios, malware, vulnerabilidades, criptografía, desarrollo seguro.

### Controles más relevantes:
{controls_summary}

### Recomendación:
1. Realizar gap analysis contra los 93 controles
2. Seleccionar controles aplicables en la Declaración de Aplicabilidad
3. Implementar por categoría priorizando controles de alto impacto
4. Documentar evidencias de implementación
5. Medir efectividad periódicamente"""


async def generate_gap_guidance(message: str) -> str:
    return """## Análisis de Brechas - ISO 27001:2022

### Metodología:

1. **Alcance**: Definir qué estándar y qué procesos/áreas evaluar
2. **Recopilación**: Revisar documentación existente, entrevistas, observaciones
3. **Evaluación**: Comparar contra cada control del estándar
4. **Clasificación**: 
   - ✅ Cumple total
   - ⚠️ Cumple parcial
   - ❌ No cumple
   - ➖ No aplica
5. **Priorización**: Enfocarse en gaps de alto riesgo primero

### Herramientas SGI:
- Use el módulo de Controles para registrar el estado de cada control
- Genere la Declaración de Aplicabilidad (SoA) automáticamente
- Priorice tratamientos basados en análisis de riesgos

### Próximos pasos:
1. Completar inventario de activos
2. Realizar análisis de riesgos
3. Seleccionar controles applicable
4. Crear plan de tratamiento
5. Implementar y documentar"""


async def generate_policy_from_request(
    policy_type: str,
    title: str,
    scope: str,
    iso_references: list[str] = None,
) -> dict:
    refs = iso_references or ["ISO 27001:2022"]

    sections = [
        "Propósito",
        "Alcance",
        "Definiciones",
        "Referencias Normativas",
        "Responsabilidades",
        "Política/Procedimiento",
        "Indicadores",
        "Registros",
        "Historial de Revisiones",
    ]

    content = f"""# {title}

## 1. Propósito
Establecer el marco para {scope.lower()} dentro de la organización.

## 2. Alcance
Este {policy_type} aplica a: {scope}

## 3. Definiciones
- **SGSI**: Sistema de Gestión de Seguridad de la Información
- **CISO**: Oficial de Seguridad de la Información
- **PII**: Información de Identificación Personal

## 4. Referencias Normativas
{chr(10).join(f"- {ref}" for ref in refs)}

## 5. Responsabilidades
| Rol | Responsabilidad |
|-----|-----------------|
| Alta Dirección | Aprobar y proveer recursos |
| CISO | Implementar y supervisar |
| Empleados | Cumplir y reportar |

## 6. {policy_type.title()}
### 6.1 Requisitos Generales
[Desarrollar según contexto de la organización]

### 6.2 Procedimiento
[Paso a paso detallado]

### 6.3 Excepciones
[Solo con aprobación documentada]

## 7. Indicadores
- % de cumplimiento
- Número de no conformidades
- Tiempo de implementación

## 8. Registros
- Formato de registro asociado
- Responsable de mantenimiento
- Tiempo de retención

## 9. Historial de Revisiones
| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | {__import__('datetime').date.today().isoformat()} | Creación | Sistema |

---
*Generado con asistencia IA - {', '.join(refs)}*
*Este documento requiere revisión y aprobación antes de su publicación.*"""

    return {
        "title": title,
        "content": content,
        "iso_references": refs,
        "sections": sections,
    }
