from pydantic import BaseModel, Field
from typing import Literal

from app.entidad.mesa.dominio.mesa import EstadoMesa
from app.utilidad.auth.infraestructura.schemas import TokenResponse


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


class MesaQrCheckinRequest(BaseModel):
    token_o_codigo: str = Field(min_length=8, max_length=128)


class MesaQrResponse(BaseModel):
    id_mesa: int
    numero: int
    qr_url: str
    codigo_corto: str


class MesaQrCheckinResponse(BaseModel):
    mesa: MesaPublica
    sesion: TokenResponse
