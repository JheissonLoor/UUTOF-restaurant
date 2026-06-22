from decimal import Decimal

from pydantic import BaseModel, Field, model_validator


class CategoriaPublica(BaseModel):
    id_categoria: int
    nombre: str
    orden: int


class PlatilloPublico(BaseModel):
    id_platillo: int
    id_categoria: int | None = None
    nombre: str
    precio: float
    disponible: bool
    imagen_url: str | None = None


class PlatillosPage(BaseModel):
    data: list[PlatilloPublico]
    next_cursor: str | None = None


class PlatilloCreateRequest(BaseModel):
    id_categoria: int
    nombre: str = Field(min_length=2, max_length=120)
    precio: Decimal = Field(ge=0)
    disponible: bool = True
    imagen_url: str | None = None


class PlatilloPatchRequest(BaseModel):
    id_categoria: int | None = None
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    precio: Decimal | None = Field(default=None, ge=0)
    disponible: bool | None = None
    imagen_url: str | None = None

    @model_validator(mode="after")
    def validar_al_menos_un_campo(self) -> "PlatilloPatchRequest":
        if (
            self.id_categoria is None
            and self.nombre is None
            and self.precio is None
            and self.disponible is None
            and self.imagen_url is None
        ):
            raise ValueError("Debes enviar al menos un campo para actualizar")
        return self
