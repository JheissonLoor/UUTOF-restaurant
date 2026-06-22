from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.menu.infraestructura import repo
from app.entidad.menu.infraestructura.schemas import PlatilloCreateRequest, PlatilloPublico


async def crear_platillo(
    session: AsyncSession,
    data: PlatilloCreateRequest,
) -> PlatilloPublico:
    if not await repo.obtener_categoria(session, data.id_categoria):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria no encontrada",
        )

    platillo = await repo.crear_platillo(session, data.model_dump())
    return PlatilloPublico(**platillo)
