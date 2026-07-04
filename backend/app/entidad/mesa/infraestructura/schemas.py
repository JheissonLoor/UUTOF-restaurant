from pydantic import BaseModel, Field
from typing import Literal

from app.entidad.mesa.dominio.mesa import EstadoMesa


class PedidoActivoMesa(BaseModel):
    id_pedido: int
    comensales: int
    abierto_en: str
    minutos: int
    total: float
    curso_actual: str
    items_count: int
    en_cocina: int
    alerta: int
    progreso: str


class MesaPublica(BaseModel):
    id_mesa: int
    numero: int
    zona: Literal["salon", "terraza", "barra", "privado"]
    capacidad: int
    estado: EstadoMesa
    pedido_activo: PedidoActivoMesa | None = None


class MesaEstadoPatchRequest(BaseModel):
    estado: EstadoMesa


class SentarComensalesRequest(BaseModel):
    comensales: int = Field(gt=0, le=50)


class SentarComensalesResponse(BaseModel):
    id_pedido: int
