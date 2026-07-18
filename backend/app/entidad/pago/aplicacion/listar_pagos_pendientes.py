from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pago.infraestructura import repo
from app.entidad.pago.infraestructura.schemas import PagoPendienteResponse


async def listar_pagos_pendientes(
    session: AsyncSession,
    actor: dict,
) -> list[PagoPendienteResponse]:
    id_mesero = int(actor["sub"]) if actor["rol"] == "mesero" else None
    pagos = await repo.listar_pagos_efectivo_pendientes(session, id_mesero=id_mesero)
    return [PagoPendienteResponse(**pago) for pago in pagos]
