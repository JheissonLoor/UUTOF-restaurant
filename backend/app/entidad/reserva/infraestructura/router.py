from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.reserva.aplicacion.crear_reserva import crear_reserva
from app.entidad.reserva.aplicacion.listar_reservas import listar_reservas
from app.entidad.reserva.aplicacion.listar_reservas_propias import listar_reservas_propias
from app.entidad.reserva.aplicacion.obtener_reserva import obtener_reserva
from app.entidad.reserva.aplicacion.validar_qr_reserva import validar_qr_reserva
from app.entidad.reserva.dominio.reserva import rango_del_dia
from app.entidad.reserva.infraestructura import repo
from app.entidad.reserva.infraestructura.schemas import (
    ReservaCreateRequest,
    ReservaDisponibilidad,
    ReservaPublica,
    ReservaQrValidarRequest,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/reservas", tags=["Reservas"])


@router.get("/disponibilidad", response_model=list[ReservaDisponibilidad])
async def get_disponibilidad(
    fecha: date = Query(),
    session: AsyncSession = Depends(get_session),
) -> list[ReservaDisponibilidad]:
    inicio, fin = rango_del_dia(fecha)
    rows = await repo.listar_disponibilidad(session, inicio=inicio, fin=fin)
    return [ReservaDisponibilidad(**row) for row in rows]


@router.get("/mias", response_model=list[ReservaPublica])
async def get_mis_reservas(
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente")),
) -> list[ReservaPublica]:
    return await listar_reservas_propias(session, actor)


@router.post("/validar-qr", response_model=ReservaPublica)
async def post_validar_qr(
    data: ReservaQrValidarRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("mesero", "admin")),
) -> ReservaPublica:
    return await validar_qr_reserva(session, data, actor)


@router.get("", response_model=list[ReservaPublica])
async def get_reservas(
    fecha: date = Query(),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "mesero", "admin")),
) -> list[ReservaPublica]:
    id_usuario = int(actor["sub"]) if actor["rol"] == "cliente" else None
    return await listar_reservas(session, fecha, id_usuario=id_usuario)


@router.post("", response_model=ReservaPublica, status_code=status.HTTP_201_CREATED)
async def post_reserva(
    data: ReservaCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "admin")),
) -> ReservaPublica:
    return await crear_reserva(session, data, actor)


@router.get("/{id_reserva}", response_model=ReservaPublica)
async def get_reserva(
    id_reserva: int,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "mesero", "admin")),
) -> ReservaPublica:
    return await obtener_reserva(session, id_reserva, actor)
