from app.utilidad.configuracion.infraestructura import repo
from app.utilidad.configuracion.infraestructura.schemas import ConfiguracionPatch, ConfiguracionResponse


async def guardar_configuracion(data: ConfiguracionPatch) -> ConfiguracionResponse:
    changes = data.model_dump(exclude_unset=True, exclude_none=True)
    return await repo.guardar_configuracion(changes)
