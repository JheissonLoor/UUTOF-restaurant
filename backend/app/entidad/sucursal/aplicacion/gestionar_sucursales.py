from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.sucursal.infraestructura import repo
from app.entidad.sucursal.infraestructura.schemas import (
    NuevaSucursalRequest,
    SucursalComparativa,
    SucursalDetalle,
    SucursalResumen,
)


async def listar_sucursales(
    session: AsyncSession,
    *,
    id_sucursal: int | None = None,
) -> list[SucursalResumen]:
    rows = await repo.listar_sucursales(session, id_sucursal=id_sucursal)
    return [SucursalResumen(**row) for row in rows]


async def obtener_sucursal(session: AsyncSession, id_sucursal: int) -> SucursalDetalle:
    row = await repo.obtener_sucursal(session, id_sucursal)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sucursal no encontrada")
    return SucursalDetalle(**row)


async def crear_sucursal(session: AsyncSession, data: NuevaSucursalRequest) -> SucursalResumen:
    if await repo.existe_nombre(session, data.nombre):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una sucursal con ese nombre",
        )
    id_sucursal = await repo.crear_sucursal(session, data)
    row = await repo.obtener_sucursal(session, id_sucursal)
    if row is None:
        raise RuntimeError("No se pudo recuperar la sucursal creada")
    return SucursalResumen(**row)


async def comparar_sucursales(
    session: AsyncSession,
    *,
    id_sucursal: int | None = None,
) -> list[SucursalComparativa]:
    rows = await repo.comparar_sucursales(session, id_sucursal=id_sucursal)
    return [SucursalComparativa(**row) for row in rows]
