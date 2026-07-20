from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.tarea.empresa_flow.aplicacion.gestionar_integraciones import (
    conectar_integracion,
    crear_api_key,
    desconectar_integracion,
    listar_api_keys,
    listar_integraciones,
    revocar_api_key,
)
from app.tarea.empresa_flow.infraestructura.schemas import (
    ApiKeyCreada,
    ApiKeyCrearRequest,
    ApiKeyResumen,
    ConectarIntegracionRequest,
    IntegracionResumen,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1", tags=["Configuración empresarial"])
owner = requires("admin", "dueno")


@router.get("/integraciones", response_model=list[IntegracionResumen])
async def get_integraciones(
    session: AsyncSession = Depends(get_session), actor: dict = Depends(owner),
) -> list[IntegracionResumen]:
    return await listar_integraciones(session)


@router.post("/integraciones/{id_integracion}/conectar", response_model=IntegracionResumen)
async def post_conectar_integracion(
    id_integracion: int,
    data: ConectarIntegracionRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(owner),
) -> IntegracionResumen:
    return await conectar_integracion(
        session, id_integracion=id_integracion, api_key=data.api_key, id_usuario=int(actor["sub"]),
    )


@router.delete("/integraciones/{id_integracion}/conectar", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conectar_integracion(
    id_integracion: int,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(owner),
) -> Response:
    await desconectar_integracion(session, id_integracion=id_integracion, id_usuario=int(actor["sub"]))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/api-keys", response_model=list[ApiKeyResumen])
async def get_api_keys(
    session: AsyncSession = Depends(get_session), actor: dict = Depends(owner),
) -> list[ApiKeyResumen]:
    return await listar_api_keys(session)


@router.post("/api-keys", response_model=ApiKeyCreada, status_code=status.HTTP_201_CREATED)
async def post_api_key(
    data: ApiKeyCrearRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(owner),
) -> ApiKeyCreada:
    return await crear_api_key(session, nombre=data.nombre, id_usuario=int(actor["sub"]))


@router.delete("/api-keys/{id_api_key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    id_api_key: int,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(owner),
) -> Response:
    await revocar_api_key(session, id_api_key)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
