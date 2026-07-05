from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.utilidad.realtime.infraestructura.manager import manager


async def notificar_cocina(session: AsyncSession, id_pedido: int, actor: dict[str, Any]) -> dict[str, bool]:
    pedido = await repo.obtener_pedido(session, id_pedido)
    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    if actor["rol"] == "mesero" and not await repo.pertenece_a_mesero(session, id_pedido, int(actor["sub"])):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tus mesas")
    if actor["rol"] == "cliente" and not await repo.pertenece_a_cliente(session, id_pedido, int(actor["sub"])):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tu sesion")

    await manager.broadcast(
        {
            "tipo": "pedido.llamar_cocina",
            "id_pedido": id_pedido,
            "id_mesa": int(pedido["id_mesa"]),
        }
    )
    return {"ok": True}
