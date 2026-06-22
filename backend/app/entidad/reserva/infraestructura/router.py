from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.reserva.aplicacion.listar_reservas import listar_reservas
from app.entidad.reserva.infraestructura.schemas import ReservaPublica
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/reservas", tags=["Reservas"])


@router.get("", response_model=list[ReservaPublica])
async def get_reservas(
    fecha: date = Query(),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("mesero", "admin")),
) -> list[ReservaPublica]:
    return await listar_reservas(session, fecha)
