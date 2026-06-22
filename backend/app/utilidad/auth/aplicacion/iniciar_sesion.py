from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.utilidad.auth.dominio.usuario_auth import UsuarioAuth
from app.utilidad.auth.infraestructura import repo
from app.utilidad.auth.infraestructura.schemas import LoginRequest, TokenResponse, UsuarioPublico


async def iniciar_sesion(
    session: AsyncSession,
    data: LoginRequest,
    auth: UsuarioAuth | None = None,
) -> TokenResponse:
    usuario = await repo.obtener_por_email(session, data.email)
    auth_service = auth or UsuarioAuth()

    if not usuario or not auth_service.validar_password(data.password, usuario["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invalidas",
        )

    tokens = auth_service.generar_token(
        usuario["id_usuario"],
        usuario["email"],
        usuario["rol"],
    )
    return TokenResponse(
        **tokens,
        usuario=UsuarioPublico(
            id_usuario=usuario["id_usuario"],
            nombre=usuario["nombre"],
            email=usuario["email"],
            rol=usuario["rol"],
        ),
    )
