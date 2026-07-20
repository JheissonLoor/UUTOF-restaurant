from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Literal
from zoneinfo import ZoneInfo


RangoMetricas = Literal["hoy", "7d", "30d"]


@dataclass(frozen=True)
class PeriodoMetricas:
    inicio: datetime
    fin: datetime
    inicio_anterior: datetime
    fin_anterior: datetime


def resolver_periodo(rango: RangoMetricas) -> PeriodoMetricas:
    ahora = datetime.now(ZoneInfo("America/Lima"))
    hoy = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
    dias = {"hoy": 1, "7d": 7, "30d": 30}[rango]
    fin = hoy + timedelta(days=1)
    inicio = fin - timedelta(days=dias)
    duracion = fin - inicio
    return PeriodoMetricas(
        inicio=inicio,
        fin=fin,
        inicio_anterior=inicio - duracion,
        fin_anterior=inicio,
    )
