import json
from decimal import Decimal
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def obtener_pedido_pago(session: AsyncSession, id_pedido: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT p.id_pedido, p.id_usuario, p.id_mesa, p.estado, p.total, m.id_mesero
            FROM pedido p
            INNER JOIN mesa m ON m.id_mesa = p.id_mesa
            WHERE p.id_pedido = :id_pedido
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido},
    )
    row = result.first()
    return dict(row._mapping) if row is not None else None


async def registrar_pago(
    session: AsyncSession,
    *,
    id_pedido: int,
    metodo: str,
    monto: Decimal,
    propina: Decimal,
    estado: str,
    recibido: Decimal | None,
    desglose: list[dict[str, object]] | None,
    verificado_por: int | None,
) -> int:
    await session.execute(
        text(
            """
            INSERT INTO pago (
              id_pedido, metodo, monto, propina, estado, recibido,
              detalle_metodos, verificado_por, verificado_en
            )
            VALUES (
              :id_pedido, :metodo, :monto, :propina, :estado, :recibido,
              :detalle_metodos, :verificado_por,
              CASE WHEN :estado = 'verificado' THEN CURRENT_TIMESTAMP ELSE NULL END
            )
            ON DUPLICATE KEY UPDATE
              id_transaccion = LAST_INSERT_ID(id_transaccion),
              metodo = VALUES(metodo),
              monto = VALUES(monto),
              propina = VALUES(propina),
              estado = VALUES(estado),
              recibido = VALUES(recibido),
              detalle_metodos = VALUES(detalle_metodos),
              verificado_por = VALUES(verificado_por),
              verificado_en = VALUES(verificado_en),
              fecha = CURRENT_TIMESTAMP
            """
        ),
        {
            "id_pedido": id_pedido,
            "metodo": metodo,
            "monto": monto,
            "propina": propina,
            "estado": estado,
            "recibido": recibido,
            "detalle_metodos": json.dumps(desglose) if desglose is not None else None,
            "verificado_por": verificado_por,
        },
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID()"))
    id_transaccion = int(result.scalar_one())

    if estado == "verificado":
        await session.execute(
            text(
                """
                UPDATE pedido
                SET estado = 'pagado'
                WHERE id_pedido = :id_pedido
                """
            ),
            {"id_pedido": id_pedido},
        )
        await session.execute(
            text(
                """
                UPDATE mesa m
                INNER JOIN pedido p ON p.id_mesa = m.id_mesa
                SET m.estado = 'libre'
                WHERE p.id_pedido = :id_pedido
                """
            ),
            {"id_pedido": id_pedido},
        )
    await session.commit()
    return id_transaccion


async def listar_pagos_efectivo_pendientes(
    session: AsyncSession,
    *,
    id_mesero: int | None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              pg.id_transaccion,
              pg.id_pedido,
              p.id_mesa,
              m.numero AS numero_mesa,
              COALESCE(NULLIF(u.nombre, ''), CONCAT('Cliente mesa ', m.numero)) AS cliente,
              pg.monto,
              pg.propina,
              pg.monto + pg.propina AS total,
              pg.fecha
            FROM pago pg
            INNER JOIN pedido p ON p.id_pedido = pg.id_pedido
            INNER JOIN mesa m ON m.id_mesa = p.id_mesa
            LEFT JOIN usuario u ON u.id_usuario = p.id_usuario
            WHERE pg.metodo = 'efectivo'
              AND pg.estado = 'pendiente'
              AND (:id_mesero IS NULL OR m.id_mesero = :id_mesero)
            ORDER BY pg.fecha, pg.id_transaccion
            """
        ),
        {"id_mesero": id_mesero},
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_pago_para_verificar(
    session: AsyncSession,
    id_transaccion: int,
) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT
              pg.id_transaccion,
              pg.id_pedido,
              pg.metodo,
              pg.estado,
              pg.monto,
              pg.propina,
              p.id_mesa,
              m.numero AS numero_mesa,
              m.id_mesero
            FROM pago pg
            INNER JOIN pedido p ON p.id_pedido = pg.id_pedido
            INNER JOIN mesa m ON m.id_mesa = p.id_mesa
            WHERE pg.id_transaccion = :id_transaccion
            LIMIT 1
            FOR UPDATE
            """
        ),
        {"id_transaccion": id_transaccion},
    )
    row = result.first()
    return dict(row._mapping) if row is not None else None


async def verificar_pago_efectivo(
    session: AsyncSession,
    *,
    id_transaccion: int,
    recibido: Decimal,
    verificado_por: int,
) -> bool:
    result = await session.execute(
        text(
            """
            UPDATE pago
            SET estado = 'verificado',
                recibido = :recibido,
                verificado_por = :verificado_por,
                verificado_en = CURRENT_TIMESTAMP
            WHERE id_transaccion = :id_transaccion
              AND metodo = 'efectivo'
              AND estado = 'pendiente'
            """
        ),
        {
            "id_transaccion": id_transaccion,
            "recibido": recibido,
            "verificado_por": verificado_por,
        },
    )
    if result.rowcount != 1:
        await session.rollback()
        return False

    await session.execute(
        text(
            """
            UPDATE pedido p
            INNER JOIN pago pg ON pg.id_pedido = p.id_pedido
            SET p.estado = 'pagado'
            WHERE pg.id_transaccion = :id_transaccion
            """
        ),
        {"id_transaccion": id_transaccion},
    )
    await session.execute(
        text(
            """
            UPDATE mesa m
            INNER JOIN pedido p ON p.id_mesa = m.id_mesa
            INNER JOIN pago pg ON pg.id_pedido = p.id_pedido
            SET m.estado = 'libre'
            WHERE pg.id_transaccion = :id_transaccion
            """
        ),
        {"id_transaccion": id_transaccion},
    )
    await session.commit()
    return True
