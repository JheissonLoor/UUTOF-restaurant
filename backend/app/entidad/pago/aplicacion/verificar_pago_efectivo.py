from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pago.infraestructura import repo
from app.entidad.pago.infraestructura.schemas import PagoEfectivoVerificarRequest, PagoResponse
from app.utilidad.realtime.infraestructura.manager import manager


async def verificar_pago_efectivo(
    session: AsyncSession,
    id_transaccion: int,
    data: PagoEfectivoVerificarRequest,
    actor: dict,
) -> PagoResponse:
    pago = await repo.obtener_pago_para_verificar(session, id_transaccion)
    if pago is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado")
    if pago["metodo"] != "efectivo":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El pago no es en efectivo")
    if pago["estado"] != "pendiente":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El pago ya fue verificado")

    if actor["rol"] == "mesero":
        id_mesero = pago.get("id_mesero")
        if id_mesero is None or int(id_mesero) != int(actor["sub"]):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pago no pertenece a tus mesas")

    total = Decimal(str(pago["monto"])) + Decimal(str(pago["propina"]))
    if data.recibido < total:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El monto recibido no cubre el total",
        )

    actualizado = await repo.verificar_pago_efectivo(
        session,
        id_transaccion=id_transaccion,
        recibido=data.recibido,
        verificado_por=int(actor["sub"]),
    )
    if not actualizado:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El pago ya fue procesado")

    cambio = data.recibido - total
    await manager.broadcast(
        {
            "tipo": "pago.verificado",
            "id_pedido": int(pago["id_pedido"]),
            "id_mesa": int(pago["id_mesa"]),
        }
    )
    return PagoResponse(
        id_transaccion=id_transaccion,
        estado="verificado",
        cambio=cambio,
        recibo={
            "id_pedido": int(pago["id_pedido"]),
            "numero_mesa": int(pago["numero_mesa"]),
            "metodo": "efectivo",
            "total": float(total),
            "recibido": float(data.recibido),
            "cambio": float(cambio),
            "estado": "verificado",
        },
    )
