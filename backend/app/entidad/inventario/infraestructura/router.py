from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.inventario.aplicacion.gestionar_inventario import (
    crear_orden_compra,
    listar_inventario,
)
from app.entidad.inventario.infraestructura.schemas import (
    InventarioItem,
    OrdenCompraRequest,
    OrdenCompraResponse,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/inventario", tags=["Inventario multilocal"])


def _scope(actor: dict, requested: int | None) -> int | None:
    if actor["rol"] != "gerente_sucursal":
        return requested
    assigned = actor.get("id_sucursal")
    if assigned is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sucursal no asignada")
    return int(assigned)


@router.get("", response_model=list[InventarioItem])
async def get_inventario(
    id_sucursal: int | None = Query(default=None, gt=0),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> list[InventarioItem]:
    return await listar_inventario(session, id_sucursal=_scope(actor, id_sucursal))


@router.post("/orden-compra", response_model=OrdenCompraResponse, status_code=status.HTTP_201_CREATED)
async def post_orden_compra(
    data: OrdenCompraRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> OrdenCompraResponse:
    effective_branch = _scope(actor, data.id_sucursal)
    if effective_branch != data.id_sucursal:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sucursal no autorizada")
    return await crear_orden_compra(session, data, id_usuario=int(actor["sub"]))
