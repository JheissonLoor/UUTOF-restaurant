from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.pedido.aplicacion.agregar_items import agregar_items_pedido
from app.entidad.pedido.aplicacion.cambiar_estado_cocina import cambiar_estado_pedido_cocina
from app.entidad.pedido.aplicacion.crear_pedido_cliente import crear_pedido_cliente
from app.entidad.pedido.aplicacion.entregar_item import entregar_item
from app.entidad.pedido.aplicacion.generar_cuenta import generar_cuenta
from app.entidad.pedido.aplicacion.listar_pedidos_cocina import listar_pedidos_cocina
from app.entidad.pedido.aplicacion.marcar_item_cocina import marcar_item_cocina
from app.entidad.pedido.aplicacion.obtener_pedido import obtener_pedido
from app.entidad.pedido.aplicacion.notificar_cocina import notificar_cocina
from app.entidad.pedido.aplicacion.pausar_pedido_cocina import pausar_pedido_cocina
from app.entidad.pedido.aplicacion.reportar_insumo import reportar_insumo
from app.entidad.pedido.infraestructura.schemas import (
    CuentaResponse,
    PedidoCocinaResponse,
    PedidoCreateRequest,
    PedidoCreateResponse,
    PedidoEstadoUpdateRequest,
    PedidoInsumoReportRequest,
    PedidoItemEstadoUpdateRequest,
    PedidoItemsCreateRequest,
    PedidoPausaRequest,
    PedidoPublico,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/pedidos", tags=["Pedidos"])


@router.post("", response_model=PedidoCreateResponse, status_code=201)
async def post_pedido_cliente(
    data: PedidoCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cliente", "admin")),
) -> PedidoCreateResponse:
    return await crear_pedido_cliente(session, data, actor)


@router.get("", response_model=list[PedidoCocinaResponse])
async def get_pedidos_cocina(
    estado: str | None = None,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cocina", "admin")),
) -> list[PedidoCocinaResponse]:
    _ = actor
    return await listar_pedidos_cocina(session, estado)


@router.patch("/{id_pedido}/estado", response_model=PedidoCocinaResponse)
async def patch_estado_pedido_cocina(
    id_pedido: int,
    data: PedidoEstadoUpdateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cocina", "admin")),
) -> PedidoCocinaResponse:
    return await cambiar_estado_pedido_cocina(session, id_pedido, data, actor)


@router.get("/{id_pedido}", response_model=PedidoPublico)
async def get_pedido(
    id_pedido: int,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cliente", "mesero", "admin")),
) -> PedidoPublico:
    return await obtener_pedido(session, id_pedido, actor)


@router.post("/{id_pedido}/items", response_model=PedidoPublico)
async def post_pedido_items(
    id_pedido: int,
    data: PedidoItemsCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cliente", "mesero", "admin")),
) -> PedidoPublico:
    return await agregar_items_pedido(session, id_pedido, data, actor)


@router.patch("/{id_pedido}/items/{id_detalle}", response_model=PedidoCocinaResponse)
async def patch_item_cocina(
    id_pedido: int,
    id_detalle: int,
    data: PedidoItemEstadoUpdateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cocina", "admin")),
) -> PedidoCocinaResponse:
    return await marcar_item_cocina(session, id_pedido, id_detalle, data, actor)


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
    actor: dict[str, Any] = Depends(requires("cliente", "mesero", "admin")),
) -> dict[str, bool]:
    return await notificar_cocina(session, id_pedido, actor)


@router.patch("/{id_pedido}/pausar", response_model=PedidoCocinaResponse)
async def patch_pausar_pedido(
    id_pedido: int,
    data: PedidoPausaRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cocina", "admin")),
) -> PedidoCocinaResponse:
    return await pausar_pedido_cocina(session, id_pedido, data, actor)


@router.post("/{id_pedido}/reportar-insumo", response_model=dict[str, bool])
async def post_reportar_insumo(
    id_pedido: int,
    data: PedidoInsumoReportRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cocina", "admin")),
) -> dict[str, bool]:
    return await reportar_insumo(session, id_pedido, data, actor)


@router.post("/{id_pedido}/cuenta", response_model=CuentaResponse)
async def post_cuenta(
    id_pedido: int,
    session: AsyncSession = Depends(get_session),
    actor: dict[str, Any] = Depends(requires("cliente", "mesero", "admin")),
) -> CuentaResponse:
    return await generar_cuenta(session, id_pedido, actor)
