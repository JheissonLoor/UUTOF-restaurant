from typing import Literal

from pydantic import BaseModel


class MetricasDelta(BaseModel):
    ingresos: float
    pedidos: float
    ticket_prom: float
    ocupacion: float


class ConsolidadoKpis(BaseModel):
    ingresos: float
    pedidos: int
    ticket_prom: float
    ocupacion: float
    delta: MetricasDelta


class RendimientoSucursal(BaseModel):
    id_sucursal: int
    nombre: str
    color: str
    ingresos: float
    pedidos: int
    ocupacion: float
    inventario_estado: Literal["ok", "bajo", "critico"]
    delta_semana: float


class MetricasConsolidadoResponse(BaseModel):
    kpis: ConsolidadoKpis
    por_sucursal: list[RendimientoSucursal]
