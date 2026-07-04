from decimal import Decimal
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import CuentaResponse


async def generar_cuenta(session: AsyncSession, id_pedido: int, actor: dict[str, Any]) -> CuentaResponse:
    pedido = await repo.obtener_pedido_base(session, id_pedido)
    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    if actor["rol"] == "mesero" and not await repo.pertenece_a_mesero(session, id_pedido, int(actor["sub"])):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El pedido no pertenece a tus mesas")

    total = Decimal(str(pedido["total"]))
    folio = f"UTTOF-{id_pedido:06d}"
    return CuentaResponse(
        folio=folio,
        qr_url=f"uttof://pago/{folio}",
        total=total,
    )
