from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.reserva.aplicacion.crear_reserva import crear_reserva
from app.entidad.reserva.aplicacion.listar_reservas import listar_reservas
from app.entidad.reserva.infraestructura.schemas import ReservaCreateRequest, ReservaPublica
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/reservas", tags=["Reservas"])


@router.get("", response_model=list[ReservaPublica])
async def get_reservas(
    fecha: date = Query(),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "mesero", "admin")),
) -> list[ReservaPublica]:
    _ = actor
    return await listar_reservas(session, fecha)


@router.post("", response_model=ReservaPublica, status_code=status.HTTP_201_CREATED)
async def post_reserva(
    data: ReservaCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "admin")),
) -> ReservaPublica:
    return await crear_reserva(session, data, actor)
