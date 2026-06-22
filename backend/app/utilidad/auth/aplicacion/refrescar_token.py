from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.utilidad.auth.dominio import token
from app.utilidad.auth.dominio.usuario_auth import UsuarioAuth
from app.utilidad.auth.infraestructura import repo
from app.utilidad.auth.infraestructura.schemas import RefreshRequest, RefreshResponse, UsuarioPublico


async def refrescar_token(session: AsyncSession, data: RefreshRequest) -> RefreshResponse:
    try:
        payload = token.verify(data.refresh_token, token_type="refresh")
        id_usuario = int(payload["sub"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalido",
        ) from exc

    usuario = await repo.obtener_por_id(session, id_usuario)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )

    auth_service = UsuarioAuth()
    tokens = auth_service.generar_token(
        usuario["id_usuario"],
        usuario["email"],
        usuario["rol"],
    )
    return RefreshResponse(
        **tokens,
        usuario=UsuarioPublico(
            id_usuario=usuario["id_usuario"],
            nombre=usuario["nombre"],
            email=usuario["email"],
            rol=usuario["rol"],
        ),
    )
