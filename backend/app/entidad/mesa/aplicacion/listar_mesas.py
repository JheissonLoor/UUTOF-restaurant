from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.mesa.infraestructura import repo
from app.entidad.mesa.infraestructura.schemas import MesaPublica


async def listar_mesas(session: AsyncSession, *, id_mesero: int | None = None) -> list[MesaPublica]:
    mesas = await repo.listar_mesas(session, id_mesero=id_mesero)
    return [MesaPublica(**mesa) for mesa in mesas]
