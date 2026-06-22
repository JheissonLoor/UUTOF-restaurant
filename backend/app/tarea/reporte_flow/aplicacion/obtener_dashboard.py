from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.reporte_flow.dominio.reportes import decimal_2
from app.tarea.reporte_flow.infraestructura import repo
from app.tarea.reporte_flow.infraestructura.schemas import (
    ActividadReciente,
    AlertaDashboard,
    DashboardHoy,
    DashboardIngresosPorDia,
    DashboardResponse,
    DistribucionPedido,
    PagoPorTipo,
    TopPlatilloDashboard,
)


def _float_2(value: Decimal | int | float | None) -> float:
    return float(decimal_2(value))


async def obtener_dashboard(session: AsyncSession) -> DashboardResponse:
    resumen_row = await repo.dashboard_resumen(session)
    ingresos_hoy = decimal_2(resumen_row["ingresos_hoy"])
    ingresos_ayer = decimal_2(resumen_row["ingresos_ayer"])
    pedidos_hoy = int(resumen_row["pedidos_hoy"])
    pedidos_ayer = int(resumen_row["pedidos_ayer"])
    ticket_promedio = decimal_2(resumen_row["ticket_promedio"])
    ticket_promedio_ayer = decimal_2(resumen_row["ticket_promedio_ayer"])
    mesas_ocupadas = int(resumen_row["mesas_ocupadas"])
    mesas_totales = int(resumen_row["mesas_totales"])

    distribucion_rows = await repo.dashboard_distribucion(session)
    ingresos_rows = await repo.dashboard_ingresos_14_dias(session)
    top_rows = await repo.dashboard_top_platillos(session)
    actividad_rows = await repo.dashboard_actividad_reciente(session)
    pagos_rows = await repo.dashboard_pagos_por_tipo(session)
    heatmap_rows = await repo.dashboard_heatmap_pedidos(session)
    alertas_rows = await repo.dashboard_alertas(session)

    actual = [decimal_2(row["actual"]) for row in ingresos_rows]
    anterior = [decimal_2(row["anterior"]) for row in ingresos_rows]
    max_top = max((int(row["cantidad"]) for row in top_rows), default=0)
    total_pagos = sum((decimal_2(row["amount"]) for row in pagos_rows), Decimal("0"))

    heatmap = [[0 for _ in range(24)] for _ in range(7)]
    for row in heatmap_rows:
        dia = int(row["dia"])
        hora = int(row["hora"])
        if 0 <= dia < 7 and 0 <= hora < 24:
            heatmap[dia][hora] = int(row["cantidad"])

    return DashboardResponse(
        hoy=DashboardHoy(
            ingresos=_float_2(ingresos_hoy),
            ingresos_ayer=_float_2(ingresos_ayer),
            pedidos=pedidos_hoy,
            pedidos_ayer=pedidos_ayer,
            mesas_ocupadas=mesas_ocupadas,
            mesas_totales=mesas_totales,
            ticket_promedio=_float_2(ticket_promedio),
            ticket_promedio_ayer=_float_2(ticket_promedio_ayer),
            pedidos_pendientes=int(resumen_row["pedidos_pendientes"]),
        ),
        distribucion=[
            DistribucionPedido(
                key=row["key"],
                label=row["label"],
                count=int(row["count"]),
            )
            for row in distribucion_rows
        ],
        ingresos_por_dia=DashboardIngresosPorDia(
            labels=[row["label"] for row in ingresos_rows],
            esta_semana=[_float_2(value) for value in actual],
            semana_anterior=[_float_2(value) for value in anterior],
        ),
        top_platillos=[
            TopPlatilloDashboard(
                id_platillo=row["id_platillo"],
                nombre=row["nombre"],
                categoria=row["categoria"] or "Sin categoría",
                cantidad=int(row["cantidad"]),
                pct=(int(row["cantidad"]) / max_top) if max_top else 0,
            )
            for row in top_rows
        ],
        actividad=[
            ActividadReciente(
                type=row["type"],
                who=row["who"],
                what=row["what"],
                when=row["when"],
                actor=row["actor"] or "UT",
            )
            for row in actividad_rows
        ],
        alertas=[
            AlertaDashboard(
                level=row["level"],
                title=row["title"],
                sub=row["sub"],
                accionable=bool(row["accionable"]),
                accion_url=row["accion_url"],
            )
            for row in alertas_rows
        ],
        pagos_por_tipo=[
            PagoPorTipo(
                name=row["name"],
                sub=row["sub"],
                amount=_float_2(row["amount"]),
                pct=_float_2((decimal_2(row["amount"]) / total_pagos) * Decimal("100")) if total_pagos else 0,
            )
            for row in pagos_rows
        ],
        heatmap_pedidos=heatmap,
    )
