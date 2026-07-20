from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.metrica_flow.dominio.periodo import RangoMetricas, resolver_periodo
from app.tarea.metrica_flow.infraestructura import repo
from app.tarea.metrica_flow.infraestructura.schemas import (
    ConsolidadoKpis,
    MetricasConsolidadoResponse,
    MetricasDelta,
    RendimientoSucursal,
)


def _porcentaje(actual: float, anterior: float) -> float:
    if anterior == 0:
        return 0.0 if actual == 0 else 100.0
    return round(((actual - anterior) / anterior) * 100, 1)


async def obtener_consolidado(
    session: AsyncSession,
    rango: RangoMetricas,
    *,
    id_sucursal: int | None = None,
) -> MetricasConsolidadoResponse:
    periodo = resolver_periodo(rango)
    rows = await repo.metricas_por_sucursal(
        session,
        inicio=periodo.inicio,
        fin=periodo.fin,
        inicio_anterior=periodo.inicio_anterior,
        fin_anterior=periodo.fin_anterior,
        id_sucursal=id_sucursal,
    )

    ingresos = sum(float(row["ingresos"]) for row in rows)
    ingresos_anteriores = sum(float(row["ingresos_anteriores"]) for row in rows)
    pedidos = sum(int(row["pedidos"]) for row in rows)
    pedidos_anteriores = sum(int(row["pedidos_anteriores"]) for row in rows)
    pagos = sum(int(row["pagos"]) for row in rows)
    pagos_anteriores = sum(int(row["pagos_anteriores"]) for row in rows)
    mesas = sum(int(row["mesas"]) for row in rows)
    mesas_ocupadas = sum(int(row["mesas_ocupadas"]) for row in rows)

    ticket = ingresos / pagos if pagos else 0.0
    ticket_anterior = ingresos_anteriores / pagos_anteriores if pagos_anteriores else 0.0
    ocupacion = (mesas_ocupadas / mesas * 100) if mesas else 0.0

    branches = [_presentar_sucursal(row) for row in rows]
    return MetricasConsolidadoResponse(
        kpis=ConsolidadoKpis(
            ingresos=round(ingresos, 2),
            pedidos=pedidos,
            ticket_prom=round(ticket, 2),
            ocupacion=round(ocupacion, 1),
            delta=MetricasDelta(
                ingresos=_porcentaje(ingresos, ingresos_anteriores),
                pedidos=_porcentaje(float(pedidos), float(pedidos_anteriores)),
                ticket_prom=_porcentaje(ticket, ticket_anterior),
                ocupacion=0.0,
            ),
        ),
        por_sucursal=branches,
    )


def _presentar_sucursal(row: dict[str, Any]) -> RendimientoSucursal:
    ingresos = float(row["ingresos"])
    ingresos_anteriores = float(row["ingresos_anteriores"])
    mesas = int(row["mesas"])
    ocupacion = (int(row["mesas_ocupadas"]) / mesas * 100) if mesas else 0.0
    return RendimientoSucursal(
        id_sucursal=int(row["id_sucursal"]),
        nombre=str(row["nombre"]),
        color=str(row["color"]),
        ingresos=round(ingresos, 2),
        pedidos=int(row["pedidos"]),
        ocupacion=round(ocupacion, 1),
        inventario_estado=row["inventario_estado"],
        delta_semana=_porcentaje(ingresos, ingresos_anteriores),
    )
