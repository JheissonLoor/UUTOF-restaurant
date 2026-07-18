from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.mesa.aplicacion.actualizar_estado_mesa import actualizar_estado_mesa
from app.entidad.mesa.aplicacion.checkin_mesa import checkin_mesa
from app.entidad.mesa.aplicacion.listar_mesas import listar_mesas
from app.entidad.mesa.aplicacion.sentar_comensales import sentar_comensales
from app.entidad.mesa.infraestructura.schemas import (
    MesaEstadoPatchRequest,
    MesaPublica,
    SentarComensalesRequest,
    SentarComensalesResponse,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/mesas", tags=["Mesas"])


@router.get("", response_model=list[MesaPublica])
async def get_mesas(
    mesero_id: Literal["me"] | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "mesero", "admin")),
) -> list[MesaPublica]:
    if mesero_id == "me" and actor["rol"] != "mesero":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El filtro de mesero solo esta disponible para meseros",
        )

    id_mesero = int(actor["sub"]) if actor["rol"] == "mesero" else None
    mesas = await listar_mesas(session, id_mesero=id_mesero)
    if actor["rol"] == "cliente":
        return [mesa.model_copy(update={"pedido_activo": None}) for mesa in mesas]
    return mesas


@router.patch("/{id}/estado", response_model=MesaPublica)
async def patch_estado_mesa(
    id: int,
    data: MesaEstadoPatchRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("mesero", "admin")),
) -> MesaPublica:
    return await actualizar_estado_mesa(session, id, data)


@router.post("/{id}/checkin", response_model=MesaPublica)
async def post_checkin_mesa(
    id: int,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente")),
) -> MesaPublica:
    return await checkin_mesa(session, id)


@router.post("/{id}/sentar", response_model=SentarComensalesResponse)
async def post_sentar_comensales(
    id: int,
    data: SentarComensalesRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("mesero", "admin")),
) -> SentarComensalesResponse:
    return await sentar_comensales(session, id, data, actor)
