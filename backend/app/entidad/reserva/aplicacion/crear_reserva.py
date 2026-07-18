from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.reserva.infraestructura import repo
from app.entidad.reserva.infraestructura.schemas import ReservaCreateRequest, ReservaPublica


async def crear_reserva(
    session: AsyncSession,
    data: ReservaCreateRequest,
    actor: dict[str, Any],
) -> ReservaPublica:
    mesa = await repo.obtener_mesa_para_reserva(session, data.id_mesa)
    if mesa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")
    if data.num_personas > int(mesa["capacidad"]):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La cantidad de personas supera la capacidad de la mesa",
        )
    if await repo.existe_conflicto_reserva(
        session,
        id_mesa=data.id_mesa,
        hora_reserva=data.hora_reserva,
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La mesa ya esta reservada cerca de ese horario",
        )

    reserva = await repo.crear_reserva(
        session,
        id_usuario=int(actor["sub"]),
        id_mesa=data.id_mesa,
        hora_reserva=data.hora_reserva,
        num_personas=data.num_personas,
        notas=data.notas,
    )
    return ReservaPublica(**reserva)
