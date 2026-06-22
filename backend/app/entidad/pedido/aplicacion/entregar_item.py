from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.dominio import puede_entregar_item
from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoPublico


async def entregar_item(
    session: AsyncSession,
    id_pedido: int,
    id_detalle: int,
    actor: dict[str, Any],
) -> PedidoPublico:
    pedido = await repo.obtener_pedido(session, id_pedido)
    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    if actor["rol"] == "mesero" and not await repo.pertenece_a_mesero(session, id_pedido, int(actor["sub"])):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tus mesas")

    estado_item = await repo.obtener_estado_item(session, id_pedido, id_detalle)
    if estado_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item de pedido no encontrado")
    if not puede_entregar_item(estado_item):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Solo los items listos en pase pueden marcarse como entregados",
        )

    actualizado = await repo.entregar_item(session, id_pedido, id_detalle)
    return PedidoPublico(**actualizado)
