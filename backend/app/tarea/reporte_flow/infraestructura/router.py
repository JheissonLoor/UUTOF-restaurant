from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.tarea.reporte_flow.aplicacion.obtener_dashboard import obtener_dashboard
from app.tarea.reporte_flow.aplicacion.obtener_ventas import obtener_ventas
from app.tarea.reporte_flow.aplicacion.exportar_reporte import exportar_reporte
from app.tarea.reporte_flow.dominio.exportacion import FormatoReporte, RangoReporte, TipoReporte
from app.tarea.reporte_flow.infraestructura.schemas import DashboardResponse, ReporteVentasResponse
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/reportes", tags=["Reportes"])


@router.get("/ventas", response_model=ReporteVentasResponse)
async def get_reporte_ventas(
    from_date: date = Query(alias="from"),
    to_date: date = Query(alias="to"),
    granularidad: Literal["dia", "semana", "mes"] = Query(default="dia"),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin")),
) -> ReporteVentasResponse:
    return await obtener_ventas(session, from_date, to_date, granularidad)


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin")),
) -> DashboardResponse:
    return await obtener_dashboard(session)


def _scope(actor: dict, requested: int | None) -> int | None:
    if actor["rol"] != "gerente_sucursal":
        return requested
    assigned = actor.get("id_sucursal")
    if assigned is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sucursal no asignada")
    return int(assigned)


@router.get("/{tipo}")
async def get_reporte_exportable(
    tipo: TipoReporte,
    rango: RangoReporte = Query(default="7d"),
    formato: FormatoReporte = Query(default="pdf"),
    id_sucursal: int | None = Query(default=None, gt=0),
    from_date: date | None = Query(default=None, alias="from"),
    to_date: date | None = Query(default=None, alias="to"),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin", "dueno", "gerente_sucursal")),
) -> StreamingResponse:
    try:
        content, filename, media_type = await exportar_reporte(
            session,
            tipo=tipo,
            rango=rango,
            formato=formato,
            desde=from_date,
            hasta=to_date,
            id_sucursal=_scope(actor, id_sucursal),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc
    return StreamingResponse(
        iter([content]),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
