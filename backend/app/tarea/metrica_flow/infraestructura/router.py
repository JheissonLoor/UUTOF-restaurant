from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.tarea.metrica_flow.aplicacion.obtener_consolidado import obtener_consolidado
from app.tarea.metrica_flow.infraestructura.schemas import MetricasConsolidadoResponse
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/metricas", tags=["Métricas multilocales"])


@router.get("/consolidado", response_model=MetricasConsolidadoResponse)
async def get_metricas_consolidado(
    rango: Literal["hoy", "7d", "30d"] = Query(default="hoy"),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> MetricasConsolidadoResponse:
    id_sucursal: int | None = None
    if actor["rol"] == "gerente_sucursal":
        actor_branch = actor.get("id_sucursal")
        if actor_branch is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El gerente no tiene una sucursal asignada",
            )
        id_sucursal = int(actor_branch)

    return await obtener_consolidado(session, rango, id_sucursal=id_sucursal)
