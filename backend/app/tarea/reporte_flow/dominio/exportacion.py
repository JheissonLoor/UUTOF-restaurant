from datetime import date, timedelta
from typing import Literal


TipoReporte = Literal["ventas", "productos", "empleados", "inventario"]
FormatoReporte = Literal["pdf", "xlsx"]
RangoReporte = Literal["hoy", "7d", "30d", "personalizado"]


def resolver_rango(
    rango: RangoReporte,
    *,
    desde: date | None,
    hasta: date | None,
) -> tuple[date, date]:
    hoy = date.today()
    if rango == "hoy":
        return hoy, hoy
    if rango == "7d":
        return hoy - timedelta(days=6), hoy
    if rango == "30d":
        return hoy - timedelta(days=29), hoy
    if desde is None or hasta is None:
        raise ValueError("El rango personalizado requiere las fechas 'from' y 'to'")
    if desde > hasta:
        raise ValueError("La fecha 'from' no puede ser mayor que 'to'")
    if (hasta - desde).days > 366:
        raise ValueError("El rango no puede superar 366 días")
    return desde, hasta
