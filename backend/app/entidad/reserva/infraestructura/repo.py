from datetime import datetime
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


RESERVA_SELECT = """
SELECT
  r.id_reserva,
  r.id_usuario,
  COALESCE(u.nombre, 'Cliente') AS nombre_cliente,
  r.id_mesa,
  r.hora_reserva,
  r.num_personas,
  r.notas_especiales,
  r.estado,
  r.qr_token,
  r.creado_en
FROM reserva AS r
LEFT JOIN usuario AS u ON u.id_usuario = r.id_usuario
"""


async def listar_reservas_por_rango(
    session: AsyncSession,
    *,
    inicio: datetime,
    fin: datetime,
    id_usuario: int | None = None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            RESERVA_SELECT
            + """
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
            FOR UPDATE
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
                AND estado <> 'cancelada'
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
    qr_token: str,
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO reserva
              (id_usuario, id_mesa, hora_reserva, num_personas, notas_especiales, estado, qr_token)
            VALUES
              (:id_usuario, :id_mesa, :hora_reserva, :num_personas, :notas, 'confirmada', :qr_token)
            """
        ),
        {
            "id_usuario": id_usuario,
            "id_mesa": id_mesa,
            "hora_reserva": hora_reserva,
            "num_personas": num_personas,
            "notas": notas,
            "qr_token": qr_token,
        },
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID()"))
    id_reserva = int(result.scalar_one())
    await session.commit()
    reserva = await obtener_reserva(session, id_reserva)
    if reserva is None:
        raise RuntimeError("No se pudo recuperar la reserva creada")
    return reserva


async def listar_disponibilidad(
    session: AsyncSession,
    *,
    inicio: datetime,
    fin: datetime,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT id_mesa, hora_reserva
            FROM reserva
            WHERE hora_reserva >= :inicio
              AND hora_reserva < :fin
              AND estado IN ('confirmada', 'validada')
            ORDER BY hora_reserva, id_mesa
            """
        ),
        {"inicio": inicio, "fin": fin},
    )
    return [dict(row._mapping) for row in result.all()]


async def listar_reservas_propias(session: AsyncSession, id_usuario: int) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            RESERVA_SELECT
            + """
            WHERE r.id_usuario = :id_usuario
              AND r.hora_reserva >= TIMESTAMPADD(DAY, -1, NOW())
            ORDER BY r.hora_reserva, r.id_reserva
            """
        ),
        {"id_usuario": id_usuario},
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_reserva(session: AsyncSession, id_reserva: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            RESERVA_SELECT
            + """
            WHERE r.id_reserva = :id_reserva
            LIMIT 1
            """
        ),
        {"id_reserva": id_reserva},
    )
    row = result.first()
    return dict(row._mapping) if row is not None else None


async def obtener_reserva_por_qr_o_folio(
    session: AsyncSession,
    *,
    valor: str,
    id_reserva: int | None,
) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT id_reserva
            FROM reserva
            WHERE qr_token = :valor
               OR (:id_reserva IS NOT NULL AND id_reserva = :id_reserva)
            LIMIT 1
            """
        ),
        {"valor": valor.strip(), "id_reserva": id_reserva},
    )
    found = result.scalar_one_or_none()
    return await obtener_reserva(session, int(found)) if found is not None else None


async def actualizar_estado_reserva(
    session: AsyncSession,
    id_reserva: int,
    estado: str,
) -> dict[str, Any]:
    await session.execute(
        text("UPDATE reserva SET estado = :estado WHERE id_reserva = :id_reserva"),
        {"id_reserva": id_reserva, "estado": estado},
    )
    await session.commit()
    reserva = await obtener_reserva(session, id_reserva)
    if reserva is None:
        raise RuntimeError("No se pudo recuperar la reserva actualizada")
    return reserva
