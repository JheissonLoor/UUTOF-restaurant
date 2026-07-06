from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoCocinaResponse, PedidoPausaRequest
from app.utilidad.realtime.infraestructura.manager import manager


async def pausar_pedido_cocina(
    session: AsyncSession,
    id_pedido: int,
    data: PedidoPausaRequest,
    actor: dict[str, Any],
) -> PedidoCocinaResponse:
    _ = actor
    try:
        pedido = await repo.pausar_pedido_cocina(session, id_pedido, data.pausado)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    await manager.broadcast(
        {
            "tipo": "pedido.pausado" if data.pausado else "pedido.reanudado",
            "id_pedido": id_pedido,
            "pausado": data.pausado,
        }
    )
    return PedidoCocinaResponse(**pedido)
