from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator


RolUsuario = Literal["cliente", "mesero", "cocina", "admin"]


class UsuarioPublico(BaseModel):
    id_usuario: int
    nombre: str
    email: EmailStr
    telefono: str | None = None
    rol: RolUsuario
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


class UsuarioPatchRequest(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    telefono: str | None = Field(default=None, max_length=20)
    rol: RolUsuario | None = None

    @model_validator(mode="after")
    def validar_al_menos_un_campo(self) -> "UsuarioPatchRequest":
        if self.nombre is None and self.telefono is None and self.rol is None:
            raise ValueError("Debes enviar al menos un campo para actualizar")
        return self
