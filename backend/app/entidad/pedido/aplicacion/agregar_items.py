from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoItemsCreateRequest, PedidoPublico
from app.utilidad.realtime.infraestructura.manager import manager


async def agregar_items_pedido(
    session: AsyncSession,
    id_pedido: int,
    data: PedidoItemsCreateRequest,
    actor: dict[str, Any],
) -> PedidoPublico:
    pedido = await repo.obtener_pedido_base(session, id_pedido)
    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    if pedido["estado"] in {"pagado", "cancelado"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El pedido ya no acepta nuevos items")

    if actor["rol"] == "mesero" and not await repo.pertenece_a_mesero(session, id_pedido, int(actor["sub"])):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tus mesas")
    if actor["rol"] == "cliente" and not await repo.pertenece_a_cliente(session, id_pedido, int(actor["sub"])):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tu sesion")

    try:
        actualizado = await repo.agregar_items(
            session,
            id_pedido=id_pedido,
            items=[item.model_dump() for item in data.items],
        )
    except ValueError as exc:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    await manager.broadcast(
        {
            "tipo": "pedido.items_agregados",
            "id_pedido": id_pedido,
            "id_mesa": int(pedido["id_mesa"]),
        }
    )
    return PedidoPublico(**actualizado)
