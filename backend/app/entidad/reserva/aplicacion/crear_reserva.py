from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.reserva.infraestructura import repo
from app.entidad.reserva.infraestructura.schemas import ReservaCreateRequest, ReservaPublica


async def crear_reserva(
    session: AsyncSession,
    data: ReservaCreateRequest,
    actor: dict[str, Any],
) -> ReservaPublica:
    reserva = await repo.crear_reserva(
        session,
        id_usuario=int(actor["sub"]),
        id_mesa=data.id_mesa,
        hora_reserva=data.hora_reserva,
        num_personas=data.num_personas,
        notas=data.notas,
    )
    return ReservaPublica(**reserva)
