from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.utilidad.auth.dominio.usuario_auth import UsuarioAuth
from app.utilidad.auth.infraestructura import repo
from app.utilidad.auth.infraestructura.schemas import RegisterRequest, UsuarioPublico


async def registrar_usuario(
    session: AsyncSession,
    data: RegisterRequest,
    auth: UsuarioAuth | None = None,
) -> UsuarioPublico:
    if await repo.obtener_por_email(session, data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya esta registrado",
        )

    auth_service = auth or UsuarioAuth()
    try:
        usuario = await repo.crear_usuario_cliente(
            session,
            email=data.email,
            password_hash=auth_service.hash_password(data.password),
            nombre=data.nombre,
            telefono=data.telefono,
        )
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya esta registrado",
        ) from exc

    return UsuarioPublico(
        id_usuario=usuario["id_usuario"],
        nombre=usuario["nombre"],
        email=usuario["email"],
        rol=usuario["rol"],
    )
