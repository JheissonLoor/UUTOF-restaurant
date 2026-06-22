from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.reporte_flow.dominio.reportes import decimal_2, validar_rango_fechas
from app.tarea.reporte_flow.infraestructura import repo
from app.tarea.reporte_flow.infraestructura.schemas import (
    CantidadPorPeriodo,
    MontoPorPeriodo,
    ReporteVentasResponse,
    TopPlatilloVentas,
)


async def obtener_ventas(
    session: AsyncSession,
    from_date: date,
    to_date: date,
    granularidad: str,
) -> ReporteVentasResponse:
    try:
        validar_rango_fechas(from_date, to_date)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    resumen = await repo.resumen_ventas(session, from_date, to_date)
    periodos = await repo.ventas_por_periodo(session, from_date, to_date, granularidad)
    top = await repo.top_platillos_ventas(session, from_date, to_date)

    return ReporteVentasResponse(
        ingresos_total=decimal_2(resumen["ingresos_total"]),
        pedidos_total=int(resumen["pedidos_total"]),
        ticket_promedio=decimal_2(resumen["ticket_promedio"]),
        ingresos_por_periodo=[
            MontoPorPeriodo(periodo=row["periodo"], monto=decimal_2(row["ingresos"]))
            for row in periodos
        ],
        pedidos_por_periodo=[
            CantidadPorPeriodo(periodo=row["periodo"], cantidad=int(row["pedidos"]))
            for row in periodos
        ],
        ticket_promedio_por_periodo=[
            MontoPorPeriodo(periodo=row["periodo"], monto=decimal_2(row["ticket_promedio"]))
            for row in periodos
        ],
        top_platillos=[
            TopPlatilloVentas(
                id_platillo=row["id_platillo"],
                nombre=row["nombre"],
                cantidad=int(row["cantidad"]),
                ingresos=decimal_2(row["ingresos"]),
            )
            for row in top
        ],
    )
