from datetime import datetime

from pydantic import BaseModel, Field


class ReservaPublica(BaseModel):
    id_reserva: int
    id_usuario: int | None = None
    nombre_cliente: str
    id_mesa: int
    hora_reserva: datetime
    num_personas: int
    notas_especiales: str | None = None


class ReservaCreateRequest(BaseModel):
    id_mesa: int = Field(gt=0)
    hora_reserva: datetime
    num_personas: int = Field(gt=0, le=50)
    notas: str | None = Field(default=None, max_length=500)
