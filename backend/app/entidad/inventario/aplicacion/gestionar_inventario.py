import re

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.inventario.infraestructura import repo
from app.entidad.inventario.infraestructura.schemas import (
    InventarioItem,
    OrdenCompraRequest,
    OrdenCompraResponse,
)
from app.utilidad.realtime.infraestructura.manager import manager


async def listar_inventario(
    session: AsyncSession,
    *,
    id_sucursal: int | None,
) -> list[InventarioItem]:
    rows = await repo.listar_inventario(session, id_sucursal=id_sucursal)
    return [InventarioItem(**row) for row in rows]


def _cantidad_numerica(value: str) -> float:
    match = re.match(r"^\s*(\d+(?:[.,]\d+)?)", value)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Cantidad inválida: {value}",
        )
    return float(match.group(1).replace(",", "."))


async def crear_orden_compra(
    session: AsyncSession,
    data: OrdenCompraRequest,
    *,
    id_usuario: int,
) -> OrdenCompraResponse:
    if not data.items:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La orden requiere al menos un insumo",
        )

    items: list[dict[str, object]] = []
    for item in data.items:
        inventory = await repo.obtener_inventario_insumo(
            session,
            id_sucursal=data.id_sucursal,
            id_insumo=item.id_insumo,
        )
        if inventory is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El insumo {item.id_insumo} no pertenece a la sucursal",
            )
        items.append(
            {
                "id_insumo": item.id_insumo,
                "cantidad": _cantidad_numerica(item.cantidad),
                "unidad": inventory["unidad"],
            }
        )

    id_orden = await repo.crear_orden_compra(
        session,
        id_sucursal=data.id_sucursal,
        id_usuario=id_usuario,
        items=items,
    )
    await manager.broadcast(
        {
            "tipo": "inventario.orden_creada",
            "id_orden": id_orden,
            "id_sucursal": data.id_sucursal,
        }
    )
    return OrdenCompraResponse(
        id_orden=id_orden,
        id_sucursal=data.id_sucursal,
        estado="generada",
        items=len(items),
    )
