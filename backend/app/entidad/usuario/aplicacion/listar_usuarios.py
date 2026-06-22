from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.usuario.infraestructura import repo
from app.entidad.usuario.infraestructura.schemas import UsuarioPublico, UsuariosPage


async def listar_usuarios(
    session: AsyncSession,
    *,
    rol: str | None,
    limit: int,
    cursor: int | None,
) -> UsuariosPage:
    usuarios = await repo.listar_usuarios(session, rol=rol, limit=limit, cursor=cursor)
    has_next = len(usuarios) > limit
    page = usuarios[:limit]
    next_cursor = str(page[-1]["id_usuario"]) if has_next and page else None
    return UsuariosPage(
        data=[UsuarioPublico(**usuario) for usuario in page],
        next_cursor=next_cursor,
    )
