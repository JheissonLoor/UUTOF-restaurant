from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.utilidad.auth.dominio import token
from app.utilidad.auth.aplicacion.sesion import crear_respuesta_sesion
from app.utilidad.auth.infraestructura import repo
from app.utilidad.auth.infraestructura.schemas import RefreshRequest, RefreshResponse


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
    if not usuario or not bool(usuario.get("activo", True)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )
    if bool(usuario.get("es_invitado")) and usuario.get("expira_en") is not None:
        from datetime import datetime

        if usuario["expira_en"] <= datetime.now():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="La sesion invitada ha expirado")

    return RefreshResponse(**crear_respuesta_sesion(usuario).model_dump())
