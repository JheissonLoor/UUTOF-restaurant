import re
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.reserva.aplicacion.presentacion import presentar_reserva
from app.entidad.reserva.infraestructura import repo
from app.entidad.reserva.infraestructura.schemas import ReservaPublica, ReservaQrValidarRequest


def _extraer_id_folio(value: str) -> int | None:
    match = re.fullmatch(r"UTTOF-R-(\d{6})", value.strip().upper())
    return int(match.group(1)) if match else None


async def validar_qr_reserva(
    session: AsyncSession,
    data: ReservaQrValidarRequest,
    actor: dict[str, Any],
) -> ReservaPublica:
    _ = actor
    reserva = await repo.obtener_reserva_por_qr_o_folio(
        session,
        valor=data.token_o_folio,
        id_reserva=_extraer_id_folio(data.token_o_folio),
    )
    if reserva is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
    if reserva["estado"] in {"cancelada", "completada"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La reserva ya no puede validarse")
    if reserva["estado"] == "confirmada":
        reserva = await repo.actualizar_estado_reserva(session, int(reserva["id_reserva"]), "validada")
    return presentar_reserva(reserva)
