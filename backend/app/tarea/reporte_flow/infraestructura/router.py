from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.tarea.reporte_flow.aplicacion.obtener_dashboard import obtener_dashboard
from app.tarea.reporte_flow.aplicacion.obtener_ventas import obtener_ventas
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
