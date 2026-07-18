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
    if pedido["estado"] not in {"listo", "entregado"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El pedido debe estar listo o entregado antes de pagar",
        )

    total_pedido = Decimal(str(pedido["total"]))
    if data.monto != total_pedido:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El monto no coincide con el total del pedido",
        )

    if actor["rol"] == "mesero":
        id_mesero = pedido.get("id_mesero")
        if id_mesero is None or int(id_mesero) != int(actor["sub"]):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tus mesas")
    if actor["rol"] == "cliente" and int(pedido["id_usuario"]) != int(actor["sub"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tu sesion")

    pago_efectivo_cliente = data.metodo == "efectivo" and actor["rol"] == "cliente"
    if data.metodo == "efectivo" and not pago_efectivo_cliente and data.recibido is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El cobro en efectivo requiere el monto recibido",
        )

    estado_pago = "pendiente" if pago_efectivo_cliente else "verificado"
    recibido = None if pago_efectivo_cliente else data.recibido
    cambio: Decimal | None = None
    total_recibo = data.monto + data.propina
    if recibido is not None:
        cambio = recibido - total_recibo

    desglose = None
    if data.desglose is not None:
        desglose = [
            {"metodo": parte.metodo, "monto": float(parte.monto)}
            for parte in data.desglose
        ]

    id_transaccion = await repo.registrar_pago(
        session,
        id_pedido=data.id_pedido,
        metodo=data.metodo,
        monto=data.monto,
        propina=data.propina,
        estado=estado_pago,
        recibido=recibido,
        desglose=desglose,
        verificado_por=None if estado_pago == "pendiente" else int(actor["sub"]),
    )
    if estado_pago == "pendiente":
        event_type = "pago.efectivo_pendiente"
    elif data.metodo == "efectivo":
        event_type = "pago.verificado"
    else:
        event_type = "pedido.pagado_app" if actor["rol"] == "cliente" else "pedido.pagado"
    await manager.broadcast(
        {
            "tipo": event_type,
            "id_pedido": data.id_pedido,
            "id_mesa": int(pedido["id_mesa"]),
        }
    )
    return PagoResponse(
        id_transaccion=id_transaccion,
        estado=estado_pago,
        cambio=cambio,
        recibo={
            "id_pedido": data.id_pedido,
            "metodo": data.metodo,
            "monto": float(data.monto),
            "propina": float(data.propina),
            "total": float(total_recibo),
            "estado": estado_pago,
            "desglose": desglose or [],
        },
    )
