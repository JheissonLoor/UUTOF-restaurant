from typing import Literal

from pydantic import BaseModel, Field


class InventarioItem(BaseModel):
    id_insumo: int
    nombre: str
    descripcion: str | None = None
    id_sucursal: int
    sucursal: str
    color: str
    nivel_pct: float
    stock: str
    estado: Literal["ok", "bajo", "critico"]
    sugerido: str


class OrdenCompraItemRequest(BaseModel):
    id_insumo: int = Field(gt=0)
    cantidad: str = Field(min_length=1, max_length=40)


class OrdenCompraRequest(BaseModel):
    id_sucursal: int = Field(gt=0)
    items: list[OrdenCompraItemRequest] = Field(min_length=1, max_length=100)


class OrdenCompraResponse(BaseModel):
    id_orden: int
    id_sucursal: int
    estado: Literal["generada"]
    items: int
