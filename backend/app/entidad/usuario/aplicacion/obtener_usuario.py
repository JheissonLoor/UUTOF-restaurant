from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.usuario.dominio.usuario import puede_acceder_usuario
from app.entidad.usuario.infraestructura import repo
from app.entidad.usuario.infraestructura.schemas import UsuarioPublico


async def obtener_usuario(
    session: AsyncSession,
    id_usuario: int,
    actor: dict,
) -> UsuarioPublico:
    if not puede_acceder_usuario(actor, id_usuario):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a este usuario",
        )

    usuario = await repo.obtener_usuario(session, id_usuario)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
    return UsuarioPublico(**usuario)
