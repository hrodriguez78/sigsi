import io
from datetime import datetime
from typing import Any, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
)


PRIMARY = colors.HexColor("#1565C0")
LIGHT_BG = colors.HexColor("#F5F7FA")
BORDER_COLOR = colors.HexColor("#DEE2E6")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    'TableHeader',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8,
    textColor=colors.white,
    alignment=1,
    leading=10,
))
styles.add(ParagraphStyle(
    'TableCell',
    parent=styles['Normal'],
    fontSize=7,
    leading=9,
    wordWrap='CJK',
))
styles.add(ParagraphStyle(
    'DocTitle',
    parent=styles['Title'],
    fontName='Helvetica-Bold',
    fontSize=16,
    textColor=PRIMARY,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=9,
    textColor=colors.HexColor("#888888"),
    spaceAfter=12,
))


def _build_pdf(title: str, headers: list[str], rows: list[list[Any]],
               col_widths: Optional[list[float]] = None,
               landscape_mode: bool = True) -> io.BytesIO:
    buf = io.BytesIO()
    page_size = landscape(A4) if landscape_mode else A4
    doc = SimpleDocTemplate(buf, pagesize=page_size,
                            leftMargin=1.5*cm, rightMargin=1.5*cm,
                            topMargin=2*cm, bottomMargin=1.5*cm)

    elements = []
    elements.append(Paragraph(title, styles['DocTitle']))
    elements.append(Paragraph(
        f"Exportado: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        styles['DocSubtitle']
    ))

    header_row = [Paragraph(h, styles['TableHeader']) for h in headers]
    table_data = [header_row]
    for row in rows:
        table_data.append([Paragraph(str(c), styles['TableCell']) for c in row])

    if not col_widths:
        available = page_size[0] - 3*cm
        col_widths = [available / len(headers)] * len(headers)

    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)

    doc.build(elements)
    buf.seek(0)
    return buf


def _simple_rows(data: list[dict], keys: list[str]) -> list[list]:
    rows = []
    for item in data:
        row = []
        for k in keys:
            val = item.get(k, "")
            if isinstance(val, dict):
                val = str(val)
            elif isinstance(val, list):
                val = ", ".join(str(v) for v in val)
            row.append(val)
        rows.append(row)
    return rows


def pdf_risks(data: list[dict]) -> io.BytesIO:
    headers = ["Código", "Nombre", "Categoría", "Prob.", "Impacto", "Nivel",
               "Score", "Tratamiento", "Estado", "Propietario"]
    keys = ["code", "name", "category", "probability", "impact", "risk_level",
            "risk_score", "treatment", "status", "owner_id"]
    return _build_pdf("Matriz de Riesgos", headers, _simple_rows(data, keys))


def pdf_incidents(data: list[dict]) -> io.BytesIO:
    headers = ["Título", "Tipo", "Severidad", "Prioridad", "Estado",
               "Detección", "Asignado a", "Causa Raíz", "F. Creación"]
    keys = ["title", "incident_type", "severity", "priority", "status",
            "detection_method", "assigned_to", "root_cause", "created_at"]
    return _build_pdf("Registro de Incidentes", headers, _simple_rows(data, keys))


def pdf_controls(data: list[dict]) -> io.BytesIO:
    headers = ["Código", "Nombre", "Categoría", "Estado", "Cumplimiento",
               "Implementador", "Fecha Impl.", "Evidencias"]
    keys = ["code", "name", "category", "status", "compliance_level",
            "implementer_id", "implementation_date", "evidence_count"]
    return _build_pdf("Controles ISO 27001:2022", headers, _simple_rows(data, keys))


def pdf_audits(data: list[dict]) -> io.BytesIO:
    headers = ["Título", "Tipo", "Alcance", "Estado", "Auditor",
               "F. Planificada", "F. Inicio", "F. Fin"]
    keys = ["title", "audit_type", "scope", "status", "auditor_name",
            "planned_date", "start_date", "end_date"]
    return _build_pdf("Registro de Auditorías", headers, _simple_rows(data, keys))


def pdf_training(data: list[dict]) -> io.BytesIO:
    headers = ["Código", "Título", "Categoría", "Estado", "Duración",
               "Instructor", "Inscritos", "Obligatorio"]
    keys = ["code", "title", "category", "status", "duration_hours",
            "instructor", "enrollments_count", "is_mandatory"]
    return _build_pdf("Cursos de Capacitación", headers, _simple_rows(data, keys))


def pdf_documents(data: list[dict]) -> io.BytesIO:
    headers = ["Código", "Título", "Tipo", "Estado", "Versión",
               "Responsable", "F. Publicación"]
    keys = ["code", "title", "document_type", "status", "current_version",
            "owner_id", "published_at"]
    return _build_pdf("Gestión Documental", headers, _simple_rows(data, keys))


def pdf_assets(data: list[dict]) -> io.BytesIO:
    headers = ["Código", "Nombre", "Tipo", "Criticidad", "Estado",
               "C", "I", "D", "Propietario"]
    def extract_cia(item):
        cia = item.get("cia", {})
        return [
            item.get("code", ""), item.get("name", ""),
            item.get("asset_type", ""), item.get("criticality", ""),
            item.get("status", ""),
            cia.get("confidentiality", "") if isinstance(cia, dict) else "",
            cia.get("integrity", "") if isinstance(cia, dict) else "",
            cia.get("availability", "") if isinstance(cia, dict) else "",
            item.get("owner_id", ""),
        ]
    rows = [extract_cia(d) for d in data]
    return _build_pdf("Inventario de Activos", headers, rows)


def pdf_raci(data: list[dict]) -> io.BytesIO:
    headers = ["Nombre", "Descripción", "Procesos", "Roles", "F. Creación"]
    keys = ["name", "description", "process_ids", "role_names", "created_at"]
    rows = _simple_rows(data, keys)
    return _build_pdf("Matriz RACI", headers, rows)


PDF_EXPORTERS = {
    "risks": pdf_risks,
    "incidents": pdf_incidents,
    "controls": pdf_controls,
    "audits": pdf_audits,
    "training": pdf_training,
    "documents": pdf_documents,
    "assets": pdf_assets,
    "raci": pdf_raci,
}
