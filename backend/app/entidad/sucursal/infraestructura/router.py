from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.sucursal.aplicacion.gestionar_sucursales import (
    comparar_sucursales,
    crear_sucursal,
    listar_sucursales,
    obtener_sucursal,
)
from app.entidad.sucursal.infraestructura.schemas import (
    NuevaSucursalRequest,
    SucursalComparativa,
    SucursalDetalle,
    SucursalResumen,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/sucursales", tags=["Sucursales"])


def _sucursal_actor(actor: dict) -> int | None:
    if actor["rol"] != "gerente_sucursal":
        return None
    value = actor.get("id_sucursal")
    return int(value) if value is not None else -1


@router.get("", response_model=list[SucursalResumen])
async def get_sucursales(
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> list[SucursalResumen]:
    return await listar_sucursales(session, id_sucursal=_sucursal_actor(actor))


@router.get("/comparativa", response_model=list[SucursalComparativa])
async def get_comparativa_sucursales(
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> list[SucursalComparativa]:
    return await comparar_sucursales(session, id_sucursal=_sucursal_actor(actor))


@router.post("", response_model=SucursalResumen, status_code=status.HTTP_201_CREATED)
async def post_sucursal(
    data: NuevaSucursalRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno")),
) -> SucursalResumen:
    return await crear_sucursal(session, data)


@router.get("/{id_sucursal}", response_model=SucursalDetalle)
async def get_sucursal(
    id_sucursal: int,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> SucursalDetalle:
    actor_branch = _sucursal_actor(actor)
    if actor_branch is not None and actor_branch != id_sucursal:
        id_sucursal = actor_branch
    return await obtener_sucursal(session, id_sucursal)
