from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.usuario.infraestructura import repo
from app.entidad.usuario.infraestructura.schemas import (
    PreferenciasCliente,
    PreferenciasClienteRequest,
)


def _validar_cliente_registrado(actor: dict[str, Any]) -> int:
    if bool(actor.get("es_invitado")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Crea una cuenta para guardar tus preferencias",
        )
    return int(actor["sub"])


async def obtener_preferencias(
    session: AsyncSession,
    actor: dict[str, Any],
) -> PreferenciasCliente:
    id_usuario = _validar_cliente_registrado(actor)
    preferencias = await repo.obtener_preferencias(session, id_usuario)
    if preferencias is None:
        return PreferenciasCliente(dieta="sin_restricciones", cocinas=[])
    return PreferenciasCliente(**preferencias)


async def guardar_preferencias(
    session: AsyncSession,
    data: PreferenciasClienteRequest,
    actor: dict[str, Any],
) -> PreferenciasCliente:
    id_usuario = _validar_cliente_registrado(actor)
    preferencias = await repo.guardar_preferencias(
        session,
        id_usuario=id_usuario,
        dieta=data.dieta,
        cocinas=data.cocinas,
    )
    return PreferenciasCliente(**preferencias)
