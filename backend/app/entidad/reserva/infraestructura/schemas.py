from datetime import datetime

from pydantic import BaseModel


class ReservaPublica(BaseModel):
    id_reserva: int
    id_usuario: int | None = None
    nombre_cliente: str
    id_mesa: int
    hora_reserva: datetime
    num_personas: int
    notas_especiales: str | None = None
