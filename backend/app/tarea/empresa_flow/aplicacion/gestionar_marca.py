from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.empresa_flow.infraestructura import repo
from app.tarea.empresa_flow.infraestructura.schemas import MarcaConfig, MarcaConfigUpdate


async def obtener_marca(session: AsyncSession) -> MarcaConfig:
    return MarcaConfig(**await repo.obtener_marca(session))


async def guardar_marca(session: AsyncSession, data: MarcaConfigUpdate) -> MarcaConfig:
    return MarcaConfig(**await repo.guardar_marca(session, data.model_dump()))
