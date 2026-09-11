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

    mesa_actual = await repo.obtener_mesa(session, id_mesa)
    if not mesa_actual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada",
        )

    if data.estado == "libre" and mesa_actual.get("pedido_activo") is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La mesa tiene un pedido pendiente de cierre",
        )

    mesa = await repo.actualizar_estado_mesa(session, id_mesa, data.estado)
    return MesaPublica(**mesa)
