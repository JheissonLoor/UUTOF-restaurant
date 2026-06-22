from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.pedido.aplicacion.entregar_item import entregar_item
from app.entidad.pedido.aplicacion.obtener_pedido import obtener_pedido
from app.entidad.pedido.aplicacion.notificar_cocina import notificar_cocina
from app.entidad.pedido.infraestructura.schemas import PedidoPublico
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/pedidos", tags=["Pedidos"])


@router.get("/{id_pedido}", response_model=PedidoPublico)
async def get_pedido(
    id_pedido: int,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("mesero", "admin")),
) -> PedidoPublico:
    return await obtener_pedido(session, id_pedido, actor)


@router.patch("/{id_pedido}/items/{id_detalle}/entregar", response_model=PedidoPublico)
async def patch_entregar_item(
    id_pedido: int,
    id_detalle: int,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("mesero", "admin")),
) -> PedidoPublico:
    return await entregar_item(session, id_pedido, id_detalle, actor)


@router.post("/{id_pedido}/llamar-cocina", response_model=dict[str, bool])
async def post_llamar_cocina(
    id_pedido: int,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("mesero", "admin")),
) -> dict[str, bool]:
    return await notificar_cocina(session, id_pedido, actor)
