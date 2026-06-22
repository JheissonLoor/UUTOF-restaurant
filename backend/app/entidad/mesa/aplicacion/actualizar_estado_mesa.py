from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.mesa.dominio.mesa import validar_estado_mesa
from app.entidad.mesa.infraestructura import repo
from app.entidad.mesa.infraestructura.schemas import MesaEstadoPatchRequest, MesaPublica


async def actualizar_estado_mesa(
    session: AsyncSession,
    id_mesa: int,
    data: MesaEstadoPatchRequest,
) -> MesaPublica:
    try:
        validar_estado_mesa(data.estado)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    if not await repo.obtener_mesa(session, id_mesa):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada",
        )

    mesa = await repo.actualizar_estado_mesa(session, id_mesa, data.estado)
    return MesaPublica(**mesa)
