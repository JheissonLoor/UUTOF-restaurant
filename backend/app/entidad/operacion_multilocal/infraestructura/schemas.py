from decimal import Decimal

from pydantic import BaseModel, Field, model_validator


class MenuMultilocalItem(BaseModel):
    id_platillo: int
    id_sucursal: int
    sucursal: str
    color: str
    id_categoria: int
    categoria: str
    nombre: str
    precio: float
    disponible: bool
    imagen_url: str | None = None
    vendidos_hoy: int


class PlatilloMultilocalCreate(BaseModel):
    id_sucursal: int = Field(gt=0)
    id_categoria: int = Field(gt=0)
    nombre: str = Field(min_length=2, max_length=120)
    precio: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    disponible: bool = True
    imagen_url: str | None = Field(default=None, max_length=1000)


class PlatilloMultilocalPatch(BaseModel):
    id_sucursal: int = Field(gt=0)
    precio: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    disponible: bool | None = None

    @model_validator(mode="after")
    def validar_cambios(self) -> "PlatilloMultilocalPatch":
        if self.precio is None and self.disponible is None:
            raise ValueError("Debes enviar precio o disponibilidad")
        return self
