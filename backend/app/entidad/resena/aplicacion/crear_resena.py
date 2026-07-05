from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.resena.infraestructura import repo
from app.entidad.resena.infraestructura.schemas import ResenaCreateRequest, ResenaPublica


async def crear_resena(
    session: AsyncSession,
    data: ResenaCreateRequest,
    actor: dict[str, Any],
) -> ResenaPublica:
    resena = await repo.crear_resena(
        session,
        id_usuario=int(actor["sub"]),
        id_pedido=data.id_pedido,
        calificacion=data.calificacion,
        comentario=data.comentario,
    )
    return ResenaPublica(**resena)
