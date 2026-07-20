from typing import Literal

from pydantic import BaseModel


class PronosticoPunto(BaseModel):
    hora: str
    demanda: float


class Recomendacion(BaseModel):
    id: str
    tipo: Literal["comprar", "staff", "menu"]
    texto: str
    impacto: str


class PrediccionResponse(BaseModel):
    modelo: str
    confianza: float
    recalculado_en: str
    pronostico: list[PronosticoPunto]
    picos: list[str]
    recomendaciones: list[Recomendacion]


class AccionRecomendacionRequest(BaseModel):
    accion: Literal["aceptar", "descartar"]
    id_sucursal: int | None = None


class AccionRecomendacionResponse(BaseModel):
    id: str
    accion: Literal["aceptar", "descartar"]
    ok: bool
