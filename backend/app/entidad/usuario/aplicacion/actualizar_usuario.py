from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.usuario.dominio.usuario import puede_acceder_usuario, validar_rol
from app.entidad.usuario.infraestructura import repo
from app.entidad.usuario.infraestructura.schemas import UsuarioPatchRequest, UsuarioPublico


async def actualizar_usuario(
    session: AsyncSession,
    id_usuario: int,
    data: UsuarioPatchRequest,
    actor: dict,
) -> UsuarioPublico:
    if not puede_acceder_usuario(actor, id_usuario):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar este usuario",
        )

    cambios = data.model_dump(exclude_unset=True)
    if "rol" in cambios:
        if actor.get("rol") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo admin puede cambiar roles",
            )
        try:
            validar_rol(cambios["rol"])
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            ) from exc

    usuario = await repo.actualizar_usuario(session, id_usuario, cambios)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
    return UsuarioPublico(**usuario)
