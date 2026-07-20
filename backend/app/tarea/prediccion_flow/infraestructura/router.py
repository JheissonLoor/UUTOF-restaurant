from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.tarea.prediccion_flow.aplicacion.gestionar_prediccion import (
    aplicar_recomendacion,
    obtener_prediccion,
)
from app.tarea.prediccion_flow.infraestructura.schemas import (
    AccionRecomendacionRequest,
    AccionRecomendacionResponse,
    PrediccionResponse,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/ia", tags=["Predicción multilocal"])


def _scope(actor: dict, requested: int | None) -> int | None:
    if actor["rol"] != "gerente_sucursal":
        return requested
    assigned = actor.get("id_sucursal")
    if assigned is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sucursal no asignada")
    return int(assigned)


@router.get("/prediccion", response_model=PrediccionResponse)
async def get_prediccion(
    id_sucursal: int | None = Query(default=None, gt=0),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> PrediccionResponse:
    return await obtener_prediccion(session, id_sucursal=_scope(actor, id_sucursal))


@router.post(
    "/recomendaciones/{id_recomendacion}/aplicar",
    response_model=AccionRecomendacionResponse,
)
async def post_aplicar_recomendacion(
    id_recomendacion: str,
    data: AccionRecomendacionRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> AccionRecomendacionResponse:
    effective_branch = _scope(actor, data.id_sucursal)
    if actor["rol"] == "gerente_sucursal" and effective_branch != data.id_sucursal:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sucursal no autorizada")
    return await aplicar_recomendacion(
        session,
        id_recomendacion=id_recomendacion,
        accion=data.accion,
        id_sucursal=effective_branch,
        id_usuario=int(actor["sub"]),
    )
