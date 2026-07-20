from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.operacion_multilocal.aplicacion.gestionar_menu import (
    actualizar_platillo,
    crear_platillo,
    listar_menu,
    retirar_platillo,
)
from app.entidad.operacion_multilocal.aplicacion.listar_empleados import listar_empleados
from app.entidad.operacion_multilocal.infraestructura.schemas import (
    MenuMultilocalItem,
    EmpleadoMultilocal,
    PlatilloMultilocalCreate,
    PlatilloMultilocalPatch,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/multilocal", tags=["Operación multilocal"])


def _scope(actor: dict, requested: int | None) -> int | None:
    if actor["rol"] != "gerente_sucursal":
        return requested
    assigned = actor.get("id_sucursal")
    if assigned is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sucursal no asignada")
    return int(assigned)


def _require_branch(actor: dict, requested: int) -> int:
    effective = _scope(actor, requested)
    if effective != requested:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sucursal no autorizada")
    return requested


@router.get("/menu", response_model=list[MenuMultilocalItem])
async def get_menu_multilocal(
    id_sucursal: int | None = Query(default=None, gt=0),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> list[MenuMultilocalItem]:
    return await listar_menu(session, id_sucursal=_scope(actor, id_sucursal))


@router.post("/menu/platillos", response_model=MenuMultilocalItem, status_code=status.HTTP_201_CREATED)
async def post_platillo_multilocal(
    data: PlatilloMultilocalCreate,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> MenuMultilocalItem:
    _require_branch(actor, data.id_sucursal)
    return await crear_platillo(session, data)


@router.patch("/menu/platillos/{id_platillo}", response_model=MenuMultilocalItem)
async def patch_platillo_multilocal(
    id_platillo: int,
    data: PlatilloMultilocalPatch,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> MenuMultilocalItem:
    _require_branch(actor, data.id_sucursal)
    return await actualizar_platillo(session, id_platillo, data)


@router.delete("/menu/platillos/{id_platillo}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_platillo_multilocal(
    id_platillo: int,
    id_sucursal: int = Query(gt=0),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> Response:
    _require_branch(actor, id_sucursal)
    await retirar_platillo(session, id_platillo=id_platillo, id_sucursal=id_sucursal)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/empleados", response_model=list[EmpleadoMultilocal])
async def get_empleados_multilocal(
    id_sucursal: int | None = Query(default=None, gt=0),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> list[EmpleadoMultilocal]:
    return await listar_empleados(session, id_sucursal=_scope(actor, id_sucursal))
