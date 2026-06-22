from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.mesa.dominio.mesa import puede_hacer_checkin
from app.entidad.mesa.infraestructura import repo
from app.entidad.mesa.infraestructura.schemas import MesaPublica


async def checkin_mesa(session: AsyncSession, id_mesa: int) -> MesaPublica:
    mesa = await repo.obtener_mesa(session, id_mesa)
    if not mesa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesa no encontrada",
        )

    if not puede_hacer_checkin(mesa["estado"]):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La mesa no esta libre para check-in",
        )

    mesa_actualizada = await repo.actualizar_estado_mesa(session, id_mesa, "ocupada")
    return MesaPublica(**mesa_actualizada)
