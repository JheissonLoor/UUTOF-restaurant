from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.menu.infraestructura import repo
from app.entidad.menu.infraestructura.schemas import CategoriaPublica


async def listar_categorias(session: AsyncSession) -> list[CategoriaPublica]:
    categorias = await repo.listar_categorias(session)
    return [CategoriaPublica(**categoria) for categoria in categorias]
