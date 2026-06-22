from typing import Literal

from pydantic import BaseModel


class PedidoItemPublico(BaseModel):
    id_detalle: int
    id_platillo: int
    nombre: str
    qty: int
    price: float
    nota: str | None
    curso: str
    estado_item: Literal["en_cocina", "ready", "delivered"]


class PedidoPublico(BaseModel):
    id_pedido: int
    id_mesa: int
    estado: Literal["creado", "en_cocina", "listo", "entregado", "pagado", "cancelado"]
    comensales: int
    total: float
    items: list[PedidoItemPublico]
