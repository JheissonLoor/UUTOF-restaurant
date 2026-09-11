from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.utilidad.peru import normalizar_telefono_peru


RolUsuario = Literal[
    "cliente",
    "mesero",
    "cocina",
    "admin",
    "dueno",
    "gerente_sucursal",
]
DietaCliente = Literal["sin_restricciones", "vegetariana", "vegana", "sin_gluten"]
CocinaFavorita = Literal[
    "criolla",
    "marina",
    "parrilla",
    "chifa",
    "nikkei",
    "postres",
    "vegetariana",
    "picante",
]


class UsuarioPublico(BaseModel):
    id_usuario: int
    nombre: str
    email: EmailStr
    telefono: str | None = None
    rol: RolUsuario
    id_sucursal: int | None = None
    creado_en: datetime


class UsuariosPage(BaseModel):
    data: list[UsuarioPublico]
    next_cursor: str | None = None


class UsuarioCreateRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    email: EmailStr
    telefono: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=72)
    rol: RolUsuario
    id_sucursal: int | None = Field(default=None, gt=0)

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, value: str | None) -> str | None:
        return normalizar_telefono_peru(value)


class UsuarioPatchRequest(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    telefono: str | None = Field(default=None, max_length=20)
    rol: RolUsuario | None = None
    id_sucursal: int | None = Field(default=None, gt=0)

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, value: str | None) -> str | None:
        return normalizar_telefono_peru(value)

    @model_validator(mode="after")
    def validar_al_menos_un_campo(self) -> "UsuarioPatchRequest":
        if (
            self.nombre is None
            and self.telefono is None
            and self.rol is None
            and self.id_sucursal is None
        ):
            raise ValueError("Debes enviar al menos un campo para actualizar")
        return self


class PreferenciasClienteRequest(BaseModel):
    dieta: DietaCliente = "sin_restricciones"
    cocinas: list[CocinaFavorita] = Field(default_factory=list, max_length=8)

    @field_validator("cocinas")
    @classmethod
    def validar_cocinas_unicas(cls, value: list[CocinaFavorita]) -> list[CocinaFavorita]:
        if len(value) != len(set(value)):
            raise ValueError("Las cocinas favoritas no pueden repetirse")
        return value


class PreferenciasCliente(PreferenciasClienteRequest):
    actualizado_en: datetime | None = None
