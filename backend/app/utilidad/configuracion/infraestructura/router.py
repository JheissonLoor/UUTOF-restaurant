from fastapi import APIRouter, Depends

from app.utilidad.configuracion.aplicacion.guardar_configuracion import guardar_configuracion
from app.utilidad.configuracion.aplicacion.obtener_configuracion import obtener_configuracion
from app.utilidad.configuracion.infraestructura.schemas import ConfiguracionPatch, ConfiguracionResponse
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/configuracion", tags=["Configuracion"])


@router.get("", response_model=ConfiguracionResponse)
async def get_configuracion(actor: dict = Depends(requires("admin"))) -> ConfiguracionResponse:
    return await obtener_configuracion()


@router.patch("", response_model=ConfiguracionResponse)
async def patch_configuracion(
    data: ConfiguracionPatch,
    actor: dict = Depends(requires("admin")),
) -> ConfiguracionResponse:
    return await guardar_configuracion(data)
