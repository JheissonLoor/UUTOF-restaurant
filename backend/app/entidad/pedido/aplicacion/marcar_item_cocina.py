from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoCocinaResponse, PedidoItemEstadoUpdateRequest
from app.utilidad.realtime.infraestructura.manager import manager


async def marcar_item_cocina(
    session: AsyncSession,
    id_pedido: int,
    id_detalle: int,
    data: PedidoItemEstadoUpdateRequest,
    actor: dict[str, Any],
) -> PedidoCocinaResponse:
    _ = actor
    try:
        pedido = await repo.marcar_item_cocina(session, id_pedido, id_detalle, data.listo)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item de pedido no encontrado")

    await manager.broadcast(
        {
            "tipo": "pedido.item_listo" if data.listo else "pedido.item_reabierto",
            "id_pedido": id_pedido,
            "id_detalle": id_detalle,
            "listo": data.listo,
        }
    )
    if pedido["estado"] == "listo":
        await manager.broadcast({"tipo": "pedido.listo", "id_pedido": id_pedido, "id_mesa": pedido["id_mesa"]})

    return PedidoCocinaResponse(**pedido)
