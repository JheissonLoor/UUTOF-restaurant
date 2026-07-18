from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.reserva.dominio.reserva import rango_del_dia
from app.entidad.reserva.infraestructura import repo
from app.entidad.reserva.infraestructura.schemas import ReservaPublica


async def listar_reservas(
    session: AsyncSession,
    fecha: date,
    *,
    id_usuario: int | None = None,
) -> list[ReservaPublica]:
    inicio, fin = rango_del_dia(fecha)
    reservas = await repo.listar_reservas_por_rango(
        session,
        inicio=inicio,
        fin=fin,
        id_usuario=id_usuario,
    )
    return [ReservaPublica(**reserva) for reserva in reservas]
