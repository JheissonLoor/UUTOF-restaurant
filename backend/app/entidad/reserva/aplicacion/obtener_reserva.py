from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.reserva.aplicacion.presentacion import presentar_reserva
from app.entidad.reserva.infraestructura import repo
from app.entidad.reserva.infraestructura.schemas import ReservaPublica


async def obtener_reserva(
    session: AsyncSession,
    id_reserva: int,
    actor: dict[str, Any],
) -> ReservaPublica:
    reserva = await repo.obtener_reserva(session, id_reserva)
    if reserva is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
    if actor["rol"] == "cliente" and int(reserva["id_usuario"] or 0) != int(actor["sub"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La reserva no pertenece a tu cuenta")
    return presentar_reserva(reserva)
