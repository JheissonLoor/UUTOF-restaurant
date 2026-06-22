from app.utilidad.configuracion.infraestructura import repo
from app.utilidad.configuracion.infraestructura.schemas import ConfiguracionResponse


async def obtener_configuracion() -> ConfiguracionResponse:
    return await repo.obtener_configuracion()
