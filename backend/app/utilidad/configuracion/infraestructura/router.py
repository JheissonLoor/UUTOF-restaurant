from fastapi import APIRouter, Depends

from app.utilidad.configuracion.aplicacion.guardar_configuracion import guardar_configuracion
from app.utilidad.configuracion.aplicacion.obtener_configuracion import obtener_configuracion
from app.utilidad.configuracion.infraestructura.schemas import (
    ConfiguracionPatch,
    ConfiguracionPublicaResponse,
    ConfiguracionResponse,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/configuracion", tags=["Configuracion"])


@router.get("/publica", response_model=ConfiguracionPublicaResponse)
async def get_configuracion_publica() -> ConfiguracionPublicaResponse:
    configuracion = await obtener_configuracion()
    return ConfiguracionPublicaResponse(
        restaurante=configuracion.restaurante.model_dump(),
        pagos=configuracion.pagos.model_dump(),
    )


@router.get("", response_model=ConfiguracionResponse)
async def get_configuracion(actor: dict = Depends(requires("admin"))) -> ConfiguracionResponse:
    return await obtener_configuracion()


@router.patch("", response_model=ConfiguracionResponse)
async def patch_configuracion(
    data: ConfiguracionPatch,
    actor: dict = Depends(requires("admin")),
) -> ConfiguracionResponse:
    return await guardar_configuracion(data)
