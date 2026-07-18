from datetime import datetime
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def listar_reservas_por_rango(
    session: AsyncSession,
    *,
    inicio: datetime,
    fin: datetime,
    id_usuario: int | None = None,
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
              AND (:id_usuario IS NULL OR r.id_usuario = :id_usuario)
            ORDER BY r.hora_reserva, r.id_reserva
            """
        ),
        {"inicio": inicio, "fin": fin, "id_usuario": id_usuario},
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_mesa_para_reserva(session: AsyncSession, id_mesa: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT id_mesa, capacidad
            FROM mesa
            WHERE id_mesa = :id_mesa
            LIMIT 1
            """
        ),
        {"id_mesa": id_mesa},
    )
    row = result.first()
    return dict(row._mapping) if row is not None else None


async def existe_conflicto_reserva(
    session: AsyncSession,
    *,
    id_mesa: int,
    hora_reserva: datetime,
) -> bool:
    result = await session.execute(
        text(
            """
            SELECT EXISTS(
              SELECT 1
              FROM reserva
              WHERE id_mesa = :id_mesa
                AND ABS(TIMESTAMPDIFF(MINUTE, hora_reserva, :hora_reserva)) < 120
            )
            """
        ),
        {"id_mesa": id_mesa, "hora_reserva": hora_reserva},
    )
    return bool(result.scalar_one())


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
