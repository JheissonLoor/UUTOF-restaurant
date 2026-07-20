import hashlib
import secrets

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.empresa_flow.infraestructura import repo
from app.tarea.empresa_flow.infraestructura.schemas import (
    ApiKeyCreada,
    ApiKeyResumen,
    IntegracionResumen,
)


async def listar_integraciones(session: AsyncSession) -> list[IntegracionResumen]:
    return [IntegracionResumen(**row) for row in await repo.listar_integraciones(session)]


async def conectar_integracion(
    session: AsyncSession,
    *,
    id_integracion: int,
    api_key: str,
    id_usuario: int,
) -> IntegracionResumen:
    if not await repo.existe_integracion(session, id_integracion):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integración no encontrada")
    digest = hashlib.sha256(api_key.encode("utf-8")).hexdigest()
    await repo.actualizar_integracion(
        session,
        id_integracion=id_integracion,
        conectado=True,
        credencial_hash=digest,
        credencial_hint=f"••••{api_key[-4:]}",
        id_usuario=id_usuario,
    )
    row = await repo.obtener_integracion(session, id_integracion)
    return IntegracionResumen(**row)


async def desconectar_integracion(session: AsyncSession, *, id_integracion: int, id_usuario: int) -> None:
    if not await repo.existe_integracion(session, id_integracion):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integración no encontrada")
    await repo.actualizar_integracion(
        session,
        id_integracion=id_integracion,
        conectado=False,
        credencial_hash=None,
        credencial_hint=None,
        id_usuario=id_usuario,
    )


async def listar_api_keys(session: AsyncSession) -> list[ApiKeyResumen]:
    return [ApiKeyResumen(**row) for row in await repo.listar_api_keys(session)]


async def crear_api_key(session: AsyncSession, *, nombre: str, id_usuario: int) -> ApiKeyCreada:
    raw_token = f"uttof_live_{secrets.token_urlsafe(32)}"
    digest = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    row = await repo.crear_api_key(
        session,
        nombre=nombre,
        token_hash=digest,
        token_prefix=raw_token[:18],
        token_ultimos4=raw_token[-4:],
        id_usuario=id_usuario,
    )
    return ApiKeyCreada(**row, token=raw_token)


async def revocar_api_key(session: AsyncSession, id_api_key: int) -> None:
    if not await repo.revocar_api_key(session, id_api_key):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key no encontrada")
