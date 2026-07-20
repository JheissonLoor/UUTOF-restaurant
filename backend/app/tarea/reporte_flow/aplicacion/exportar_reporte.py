from io import BytesIO
from typing import Any

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.reporte_flow.dominio.exportacion import (
    FormatoReporte,
    RangoReporte,
    TipoReporte,
    resolver_rango,
)
from app.tarea.reporte_flow.infraestructura.export_repo import consultar_reporte


REPORT_TITLES: dict[TipoReporte, str] = {
    "ventas": "Ventas e ingresos",
    "productos": "Platillos y menú",
    "empleados": "Personal y turnos",
    "inventario": "Inventario y abastecimiento",
}


async def exportar_reporte(
    session: AsyncSession,
    *,
    tipo: TipoReporte,
    rango: RangoReporte,
    formato: FormatoReporte,
    desde,
    hasta,
    id_sucursal: int | None,
) -> tuple[bytes, str, str]:
    fecha_inicio, fecha_fin = resolver_rango(rango, desde=desde, hasta=hasta)
    rows = await consultar_reporte(
        session,
        tipo=tipo,
        desde=fecha_inicio,
        hasta=fecha_fin,
        id_sucursal=id_sucursal,
    )
    title = REPORT_TITLES[tipo]
    headers = list(rows[0]) if rows else ["resultado"]
    values = [[_display(row.get(header)) for header in headers] for row in rows]
    if not values:
        values = [["Sin registros para el rango seleccionado"]]

    filename = f"uttof_{tipo}_{fecha_inicio.isoformat()}_{fecha_fin.isoformat()}.{formato}"
    if formato == "pdf":
        return _crear_pdf(title, fecha_inicio.isoformat(), fecha_fin.isoformat(), headers, values), filename, "application/pdf"
    return _crear_excel(title, headers, values), filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _display(value: Any) -> str | int | float:
    if value is None:
        return ""
    if isinstance(value, (int, float, str)):
        return value
    return str(value)


def _crear_pdf(title: str, desde: str, hasta: str, headers: list[str], rows: list[list[Any]]) -> bytes:
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=landscape(A4), title=f"UTTOF - {title}")
    styles = getSampleStyleSheet()
    data = [[header.replace("_", " ").title() for header in headers], *rows]
    table = Table(data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F1A14")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#DED4C8")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAF6F0")]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story = [
        Paragraph(f"UTTOF · {title}", styles["Title"]),
        Paragraph(f"Periodo: {desde} al {hasta} · Zona horaria America/Lima", styles["Normal"]),
        Spacer(1, 14),
        table,
    ]
    document.build(story)
    return buffer.getvalue()


def _crear_excel(title: str, headers: list[str], rows: list[list[Any]]) -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = title[:31]
    sheet.append([header.replace("_", " ").title() for header in headers])
    for row in rows:
        sheet.append(row)
    for cell in sheet[1]:
        cell.fill = PatternFill("solid", fgColor="1F1A14")
        cell.font = Font(color="FFFFFF", bold=True)
    sheet.freeze_panes = "A2"
    for column in sheet.columns:
        letter = column[0].column_letter
        width = min(max(len(str(cell.value or "")) for cell in column) + 2, 42)
        sheet.column_dimensions[letter].width = width
    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()
