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


async def crear_reserva(
    session: AsyncSession,
    *,
    id_usuario: int,
    id_mesa: int,
    hora_reserva: datetime,
    num_personas: int,
    notas: str | None,
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO reserva (id_usuario, id_mesa, hora_reserva, num_personas, notas_especiales)
            VALUES (:id_usuario, :id_mesa, :hora_reserva, :num_personas, :notas)
            """
        ),
        {
            "id_usuario": id_usuario,
            "id_mesa": id_mesa,
            "hora_reserva": hora_reserva,
            "num_personas": num_personas,
            "notas": notas,
        },
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID()"))
    id_reserva = int(result.scalar_one())
    await session.commit()

    reserva_result = await session.execute(
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
            WHERE r.id_reserva = :id_reserva
            LIMIT 1
            """
        ),
        {"id_reserva": id_reserva},
    )
    return dict(reserva_result.one()._mapping)
