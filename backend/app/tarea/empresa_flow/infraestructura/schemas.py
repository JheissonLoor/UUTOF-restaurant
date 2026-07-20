from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


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
