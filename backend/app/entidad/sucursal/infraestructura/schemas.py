from typing import Literal

from pydantic import BaseModel, Field, field_validator


ColorSucursal = Literal["coral", "mint", "sky", "plum", "sun"]


class NuevaSucursalRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    direccion: str = Field(min_length=5, max_length=240)
    color: ColorSucursal = "coral"
    mesas: int = Field(ge=1, le=100)

    @field_validator("nombre", "direccion")
    @classmethod
    def limpiar_texto(cls, value: str) -> str:
        return " ".join(value.strip().split())


class SucursalResumen(BaseModel):
    id_sucursal: int
    nombre: str
    direccion: str
    color: str
    mesas: int
    activa: bool


class SucursalDetalle(SucursalResumen):
    mesas_ocupadas: int
    ingresos_semana: float
    pedidos_semana: int


class SucursalComparativa(BaseModel):
    id_sucursal: int
    nombre: str
    color: str
    ingresos_semana: float
    ticket_promedio: float
    resenas_promedio: float | None
    empleados: int
    margen_pct: float | None
