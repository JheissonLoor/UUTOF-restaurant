from decimal import Decimal
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def obtener_pedido_pago(session: AsyncSession, id_pedido: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT p.id_pedido, p.id_mesa, p.estado, p.total, m.id_mesero
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
) -> int:
    await session.execute(
        text(
            """
            INSERT INTO pago (id_pedido, metodo, monto, propina)
            VALUES (:id_pedido, :metodo, :monto, :propina)
            ON DUPLICATE KEY UPDATE
              id_transaccion = LAST_INSERT_ID(id_transaccion),
              metodo = VALUES(metodo),
              monto = VALUES(monto),
              propina = VALUES(propina),
              fecha = CURRENT_TIMESTAMP
            """
        ),
        {
            "id_pedido": id_pedido,
            "metodo": metodo,
            "monto": monto,
            "propina": propina,
        },
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID()"))
    id_transaccion = int(result.scalar_one())

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
