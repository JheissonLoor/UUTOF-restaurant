from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.usuario.infraestructura import repo
from app.entidad.usuario.infraestructura.schemas import UsuarioCreateRequest, UsuarioPublico
from app.utilidad.auth.dominio.usuario_auth import UsuarioAuth


async def crear_usuario(
    session: AsyncSession,
    data: UsuarioCreateRequest,
    auth: UsuarioAuth | None = None,
) -> UsuarioPublico:
    auth_service = auth or UsuarioAuth()
    try:
        usuario = await repo.crear_usuario(
            session,
            nombre=data.nombre,
            email=data.email,
            telefono=data.telefono,
            password_hash=auth_service.hash_password(data.password),
            rol=data.rol,
        )
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya esta registrado",
        ) from exc

    return UsuarioPublico(**usuario)
