from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.menu.infraestructura import repo
from app.entidad.menu.infraestructura.schemas import PlatilloPatchRequest, PlatilloPublico


async def actualizar_platillo(
    session: AsyncSession,
    id_platillo: int,
    data: PlatilloPatchRequest,
) -> PlatilloPublico:
    if not await repo.obtener_platillo(session, id_platillo):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platillo no encontrado",
        )

    cambios = data.model_dump(exclude_unset=True)
    if "id_categoria" in cambios and not await repo.obtener_categoria(session, cambios["id_categoria"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria no encontrada",
        )

    platillo = await repo.actualizar_platillo(session, id_platillo, cambios)
    return PlatilloPublico(**platillo)
