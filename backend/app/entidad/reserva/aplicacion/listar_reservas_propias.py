from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.reserva.aplicacion.presentacion import presentar_reserva
from app.entidad.reserva.infraestructura import repo
from app.entidad.reserva.infraestructura.schemas import ReservaPublica


async def listar_reservas_propias(
    session: AsyncSession,
    actor: dict[str, Any],
) -> list[ReservaPublica]:
    if bool(actor.get("es_invitado")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Crea una cuenta para reservar")
    reservas = await repo.listar_reservas_propias(session, int(actor["sub"]))
    return [presentar_reserva(reserva) for reserva in reservas]
