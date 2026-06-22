from decimal import Decimal

from pydantic import BaseModel


class MontoPorPeriodo(BaseModel):
    periodo: str
    monto: Decimal


class CantidadPorPeriodo(BaseModel):
    periodo: str
    cantidad: int


class TopPlatilloVentas(BaseModel):
    id_platillo: int
    nombre: str
    cantidad: int
    ingresos: Decimal


class ReporteVentasResponse(BaseModel):
    ingresos_total: Decimal
    pedidos_total: int
    ticket_promedio: Decimal
    ingresos_por_periodo: list[MontoPorPeriodo]
    pedidos_por_periodo: list[CantidadPorPeriodo]
    ticket_promedio_por_periodo: list[MontoPorPeriodo]
    top_platillos: list[TopPlatilloVentas]


class DashboardResumen(BaseModel):
    ingresos_hoy: Decimal
    ingresos_ayer: Decimal
    ingresos_delta_pct: Decimal
    pedidos_hoy: int
    pedidos_ayer: int
    pedidos_delta_pct: Decimal
    mesas_ocupadas: int
    mesas_totales: int
    ocupacion_pct: Decimal
    ticket_promedio: Decimal
    ticket_promedio_ayer: Decimal
    ticket_delta_pct: Decimal
    pedidos_pendientes: int


class DistribucionPedido(BaseModel):
    key: str
    label: str
    count: int


class Ingresos14Dias(BaseModel):
    labels: list[str]
    actual: list[Decimal]
    anterior: list[Decimal]
    total_actual: Decimal
    total_anterior: Decimal
    delta_pct: Decimal


class MesaDashboard(BaseModel):
    id_mesa: int
    numero: int
    capacidad: int
    estado: str
    status: str
    guests: int | None = None
    time: str | None = None
    ticket: Decimal | None = None


class TopPlatilloDashboard(BaseModel):
    id_platillo: int
    nombre: str
    categoria: str | None = None
    cantidad: int
    pct: float


class DashboardHoy(BaseModel):
    ingresos: float
    ingresos_ayer: float
    pedidos: int
    pedidos_ayer: int
    mesas_ocupadas: int
    mesas_totales: int
    ticket_promedio: float
    ticket_promedio_ayer: float
    pedidos_pendientes: int


class DashboardIngresosPorDia(BaseModel):
    labels: list[str]
    esta_semana: list[float]
    semana_anterior: list[float]


class ActividadReciente(BaseModel):
    type: str
    who: str
    what: str
    when: str
    actor: str


class AlertaDashboard(BaseModel):
    level: str
    title: str
    sub: str
    accionable: bool | None = None
    accion_url: str | None = None


class PagoPorTipo(BaseModel):
    name: str
    sub: str
    amount: float
    pct: float


class DashboardResponse(BaseModel):
    hoy: DashboardHoy
    distribucion: list[DistribucionPedido]
    ingresos_por_dia: DashboardIngresosPorDia
    top_platillos: list[TopPlatilloDashboard]
    actividad: list[ActividadReciente]
    alertas: list[AlertaDashboard]
    pagos_por_tipo: list[PagoPorTipo]
    heatmap_pedidos: list[list[int]]
