from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.mesa.infraestructura import repo as mesa_repo
from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoCreateRequest, PedidoCreateResponse
from app.utilidad.realtime.infraestructura.manager import manager


async def crear_pedido_cliente(
    session: AsyncSession,
    data: PedidoCreateRequest,
    actor: dict[str, Any],
) -> PedidoCreateResponse:
    mesa = await mesa_repo.obtener_mesa(session, data.id_mesa)
    if mesa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")

    if mesa["estado"] not in {"ocupada", "lista"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Debes hacer check-in antes de pedir")

    pedido_base = await repo.obtener_pedido_abierto_por_mesa(session, data.id_mesa)
    id_pedido = int(pedido_base["id_pedido"]) if pedido_base else await repo.crear_pedido_base_cliente(
        session,
        int(actor["sub"]),
        data.id_mesa,
    )

    pedido = await repo.agregar_items(
        session,
        id_pedido=id_pedido,
        items=[item.model_dump() for item in data.items],
    )
    await manager.broadcast(
        {
            "tipo": "pedido.items_agregados",
            "id_pedido": int(pedido["id_pedido"]),
            "id_mesa": int(pedido["id_mesa"]),
        }
    )
    return PedidoCreateResponse(
        id_pedido=int(pedido["id_pedido"]),
        estado=pedido["estado"],
        total=float(pedido["total"]),
        folio=f"UTTOF-{int(pedido['id_pedido']):06d}",
    )
