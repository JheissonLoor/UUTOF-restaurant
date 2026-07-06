from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoInsumoReportRequest
from app.utilidad.realtime.infraestructura.manager import manager


async def reportar_insumo(
    session: AsyncSession,
    id_pedido: int,
    data: PedidoInsumoReportRequest,
    actor: dict[str, Any],
) -> dict[str, bool]:
    pedido = await repo.reportar_insumo(
        session,
        id_pedido=id_pedido,
        id_detalle=data.id_detalle,
        id_usuario=int(actor["sub"]),
        nota=data.nota,
    )
    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item de pedido no encontrado")

    await manager.broadcast(
        {
            "tipo": "insumo.alerta",
            "id_pedido": id_pedido,
            "id_detalle": data.id_detalle,
            "nota": data.nota,
        }
    )
    return {"ok": True}
