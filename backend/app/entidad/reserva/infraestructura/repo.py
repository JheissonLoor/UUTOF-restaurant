from datetime import datetime
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def listar_reservas_por_rango(
    session: AsyncSession,
    *,
    inicio: datetime,
    fin: datetime,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              r.id_reserva,
              r.id_usuario,
              COALESCE(u.nombre, 'Cliente sin registro') AS nombre_cliente,
              r.id_mesa,
              r.hora_reserva,
              r.num_personas,
              r.notas_especiales
            FROM reserva AS r
            LEFT JOIN usuario AS u ON u.id_usuario = r.id_usuario
            WHERE r.hora_reserva >= :inicio
              AND r.hora_reserva < :fin
            ORDER BY r.hora_reserva, r.id_reserva
            """
        ),
        {"inicio": inicio, "fin": fin},
    )
    return [dict(row._mapping) for row in result.all()]
