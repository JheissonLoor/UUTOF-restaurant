from datetime import datetime
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field, field_validator


LIMA_TZ = ZoneInfo("America/Lima")


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

    @field_validator("hora_reserva")
    @classmethod
    def validar_hora_futura(cls, value: datetime) -> datetime:
        hora_local = value.astimezone(LIMA_TZ).replace(tzinfo=None) if value.tzinfo else value
        ahora_local = datetime.now(LIMA_TZ).replace(tzinfo=None)
        if hora_local <= ahora_local:
            raise ValueError("La hora de reserva debe ser futura")
        return hora_local
