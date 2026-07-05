from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoCocinaResponse, PedidoEstadoUpdateRequest


async def cambiar_estado_pedido_cocina(
    session: AsyncSession,
    id_pedido: int,
    data: PedidoEstadoUpdateRequest,
    actor: dict[str, Any],
) -> PedidoCocinaResponse:
    _ = actor
    try:
        pedido = await repo.cambiar_estado_pedido_cocina(session, id_pedido, data.transicion)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    return PedidoCocinaResponse(**pedido)
