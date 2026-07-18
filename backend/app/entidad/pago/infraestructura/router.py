from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.pago.aplicacion.listar_pagos_pendientes import listar_pagos_pendientes
from app.entidad.pago.aplicacion.registrar_pago import registrar_pago
from app.entidad.pago.aplicacion.verificar_pago_efectivo import verificar_pago_efectivo
from app.entidad.pago.infraestructura.schemas import (
    PagoCreateRequest,
    PagoEfectivoVerificarRequest,
    PagoPendienteResponse,
    PagoResponse,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/pagos", tags=["Pagos"])


@router.post("", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
async def post_pago(
    data: PagoCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "mesero", "admin")),
) -> PagoResponse:
    return await registrar_pago(session, data, actor)


@router.get("/pendientes", response_model=list[PagoPendienteResponse])
async def get_pagos_pendientes(
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("mesero", "admin")),
) -> list[PagoPendienteResponse]:
    return await listar_pagos_pendientes(session, actor)


@router.post("/{id_transaccion}/verificar", response_model=PagoResponse)
async def post_verificar_pago_efectivo(
    id_transaccion: int,
    data: PagoEfectivoVerificarRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("mesero", "admin")),
) -> PagoResponse:
    return await verificar_pago_efectivo(session, id_transaccion, data, actor)
