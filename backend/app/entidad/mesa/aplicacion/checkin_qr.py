import secrets
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.mesa.infraestructura import repo
from app.entidad.mesa.infraestructura.schemas import MesaQrCheckinResponse, MesaPublica
from app.utilidad.auth.aplicacion.sesion import crear_respuesta_sesion
from app.utilidad.auth.dominio.usuario_auth import UsuarioAuth
from app.utilidad.auth.infraestructura import repo as auth_repo


async def _obtener_o_crear_usuario(
    session: AsyncSession,
    actor: dict[str, Any] | None,
) -> dict[str, Any]:
    if actor is not None:
        if actor.get("rol") != "cliente":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El QR de mesa es para clientes")
        usuario = await auth_repo.obtener_por_id(session, int(actor["sub"]))
        if usuario is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
        return usuario

    random_id = uuid4().hex
    return await auth_repo.crear_usuario_invitado(
        session,
        email=f"guest+{random_id}@guest.uttof.pe",
        password_hash=UsuarioAuth().hash_password(secrets.token_urlsafe(32)),
    )


async def checkin_qr(
    session: AsyncSession,
    token_o_codigo: str,
    actor: dict[str, Any] | None,
) -> MesaQrCheckinResponse:
    mesa = await repo.obtener_mesa_por_qr(session, token_o_codigo)
    if mesa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR de mesa no reconocido")
    if mesa["estado"] in {"reservada", "limpieza"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La mesa no esta disponible para check-in")

    usuario = await _obtener_o_crear_usuario(session, actor)
    if mesa["estado"] == "libre":
        mesa = await repo.actualizar_estado_mesa(session, int(mesa["id_mesa"]), "ocupada")
    if mesa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")

    return MesaQrCheckinResponse(
        mesa=MesaPublica(**mesa),
        sesion=crear_respuesta_sesion(usuario),
    )
