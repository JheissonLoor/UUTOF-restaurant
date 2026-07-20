from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.operacion_multilocal.infraestructura import repo
from app.entidad.operacion_multilocal.infraestructura.schemas import (
    MenuMultilocalItem,
    PlatilloMultilocalCreate,
    PlatilloMultilocalPatch,
)


async def listar_menu(session: AsyncSession, *, id_sucursal: int | None) -> list[MenuMultilocalItem]:
    rows = await repo.listar_menu(session, id_sucursal=id_sucursal)
    return [MenuMultilocalItem(**row) for row in rows]


async def crear_platillo(
    session: AsyncSession,
    data: PlatilloMultilocalCreate,
) -> MenuMultilocalItem:
    if not await repo.existe_sucursal(session, data.id_sucursal):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sucursal no encontrada")
    if not await repo.existe_categoria(session, data.id_categoria):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    row = await repo.crear_platillo(session, data.model_dump())
    return MenuMultilocalItem(**row)


async def actualizar_platillo(
    session: AsyncSession,
    id_platillo: int,
    data: PlatilloMultilocalPatch,
) -> MenuMultilocalItem:
    row = await repo.actualizar_platillo(
        session,
        id_platillo=id_platillo,
        id_sucursal=data.id_sucursal,
        cambios=data.model_dump(exclude_none=True, exclude={"id_sucursal"}),
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Platillo no encontrado en la sucursal")
    return MenuMultilocalItem(**row)


async def retirar_platillo(session: AsyncSession, *, id_platillo: int, id_sucursal: int) -> None:
    updated = await repo.retirar_platillo(session, id_platillo=id_platillo, id_sucursal=id_sucursal)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Platillo no encontrado en la sucursal")
