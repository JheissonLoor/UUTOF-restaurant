from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class IntegracionResumen(BaseModel):
    id: int
    nombre: str
    categoria: Literal["contabilidad", "delivery", "facturacion"]
    descripcion: str
    color: str
    conectado: bool
    credencial_hint: str | None = None


class ConectarIntegracionRequest(BaseModel):
    api_key: str = Field(min_length=8, max_length=500)


class ApiKeyResumen(BaseModel):
    id: int
    nombre: str
    token_mascara: str
    creada_en: datetime
    ultimo_uso: datetime | None = None


class ApiKeyCrearRequest(BaseModel):
    nombre: str = Field(min_length=3, max_length=100)


class ApiKeyCreada(ApiKeyResumen):
    token: str


class MarcaConfig(BaseModel):
    nombre_marca: str
    logo_url: str | None = None
    color_primario: str
    subdominio: str


class MarcaConfigUpdate(BaseModel):
    nombre_marca: str = Field(min_length=2, max_length=120)
    logo_url: str | None = Field(default=None, max_length=1_500_000)
    color_primario: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")
    subdominio: str = Field(min_length=3, max_length=63, pattern=r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$")

    @field_validator("color_primario")
    @classmethod
    def normalizar_color(cls, value: str) -> str:
        return value.upper()
