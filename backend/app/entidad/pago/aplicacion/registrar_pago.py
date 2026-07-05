from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pago.infraestructura import repo
from app.entidad.pago.infraestructura.schemas import PagoCreateRequest, PagoResponse
from app.utilidad.realtime.infraestructura.manager import manager


async def registrar_pago(session: AsyncSession, data: PagoCreateRequest, actor: dict) -> PagoResponse:
    pedido = await repo.obtener_pedido_pago(session, data.id_pedido)
    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    if pedido["estado"] == "pagado":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El pedido ya fue pagado")
    if pedido["estado"] == "cancelado":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El pedido esta cancelado")

    if actor["rol"] == "mesero":
        id_mesero = pedido.get("id_mesero")
        if id_mesero is None or int(id_mesero) != int(actor["sub"]):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tus mesas")
    if actor["rol"] == "cliente" and int(pedido["id_usuario"]) != int(actor["sub"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tu sesion")

    cambio: Decimal | None = None
    total_recibo = data.monto + data.propina
    if data.recibido is not None:
        cambio = data.recibido - total_recibo

    id_transaccion = await repo.registrar_pago(
        session,
        id_pedido=data.id_pedido,
        metodo=data.metodo,
        monto=data.monto,
        propina=data.propina,
    )
    await manager.broadcast(
        {
            "tipo": "pedido.pagado_app",
            "id_pedido": data.id_pedido,
            "id_mesa": int(pedido["id_mesa"]),
        }
    )
    return PagoResponse(
        id_transaccion=id_transaccion,
        cambio=cambio,
        recibo={
            "id_pedido": data.id_pedido,
            "metodo": data.metodo,
            "monto": float(data.monto),
            "propina": float(data.propina),
            "total": float(total_recibo),
        },
    )
