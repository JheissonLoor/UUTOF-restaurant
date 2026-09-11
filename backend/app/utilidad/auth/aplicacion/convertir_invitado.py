from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.utilidad.auth.aplicacion.sesion import crear_respuesta_sesion
from app.utilidad.auth.dominio.usuario_auth import UsuarioAuth
from app.utilidad.auth.infraestructura import repo
from app.utilidad.auth.infraestructura.schemas import RegisterRequest, TokenResponse


async def convertir_invitado(
    session: AsyncSession,
    data: RegisterRequest,
    actor: dict[str, Any],
) -> TokenResponse:
    id_usuario = int(actor["sub"])
    usuario = await repo.obtener_por_id(session, id_usuario)
    if usuario is None or not bool(usuario.get("es_invitado")):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La sesion actual no es una cuenta invitada",
        )
    existente = await repo.obtener_por_email(session, data.email)
    if existente is not None and int(existente["id_usuario"]) != id_usuario:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya esta registrado")

    try:
        convertido = await repo.convertir_invitado(
            session,
            id_usuario=id_usuario,
            nombre=data.nombre,
            email=data.email,
            password_hash=UsuarioAuth().hash_password(data.password),
            telefono=data.telefono,
        )
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya esta registrado") from exc
    return crear_respuesta_sesion(convertido)
