from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.empresa_flow.infraestructura import repo
from app.tarea.empresa_flow.infraestructura.schemas import (
    FacturacionConfig,
    GeneralConfig,
    GeneralConfigUpdate,
)


async def obtener_config_general(session: AsyncSession) -> GeneralConfig:
    return GeneralConfig(**await repo.obtener_config_general(session))


async def guardar_config_general(session: AsyncSession, data: GeneralConfigUpdate) -> GeneralConfig:
    return GeneralConfig(**await repo.guardar_config_general(session, data.model_dump()))


async def obtener_facturacion(session: AsyncSession) -> FacturacionConfig:
    row = await repo.obtener_facturacion(session)
    row["total_mensual"] = float(row["precio_por_local"]) * int(row["sucursales_facturadas"])
    return FacturacionConfig(**row)
