from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.menu.dominio.menu import normalizar_limit
from app.entidad.menu.infraestructura import repo
from app.entidad.menu.infraestructura.schemas import PlatilloPublico, PlatillosPage


async def listar_platillos(
    session: AsyncSession,
    *,
    categoria_id: int | None,
    limit: int,
    cursor: int | None,
) -> PlatillosPage:
    page_size = normalizar_limit(limit)
    rows = await repo.listar_platillos(
        session,
        categoria_id=categoria_id,
        limit=page_size + 1,
        cursor=cursor,
    )
    next_cursor = None
    if len(rows) > page_size:
        next_cursor = str(rows[page_size - 1]["id_platillo"])
        rows = rows[:page_size]

    return PlatillosPage(
        data=[PlatilloPublico(**row) for row in rows],
        next_cursor=next_cursor,
    )
