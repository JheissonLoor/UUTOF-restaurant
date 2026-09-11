from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.utilidad.auth.dominio.usuario_auth import UsuarioAuth
from app.utilidad.auth.aplicacion.sesion import crear_respuesta_sesion
from app.utilidad.auth.infraestructura import repo
from app.utilidad.auth.infraestructura.schemas import LoginRequest, TokenResponse


async def iniciar_sesion(
    session: AsyncSession,
    data: LoginRequest,
    auth: UsuarioAuth | None = None,
) -> TokenResponse:
    usuario = await repo.obtener_por_email(session, data.email)
    auth_service = auth or UsuarioAuth()

    if (
        not usuario
        or not bool(usuario.get("activo", True))
        or not auth_service.validar_password(data.password, usuario["password_hash"])
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invalidas",
        )

    return crear_respuesta_sesion(usuario)
