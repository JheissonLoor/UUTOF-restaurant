from decimal import Decimal
from typing import Any

from sqlalchemy import bindparam, text
from sqlalchemy.ext.asyncio import AsyncSession


async def obtener_pedido(session: AsyncSession, id_pedido: int) -> dict[str, Any] | None:
    pedido_result = await session.execute(
        text(
            """
            SELECT id_pedido, id_mesa, estado, comensales, total
            FROM pedido
            WHERE id_pedido = :id_pedido
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido},
    )
    pedido_row = pedido_result.first()
    if pedido_row is None:
        return None

    items_result = await session.execute(
        text(
            """
            SELECT
              dp.id_detalle,
              dp.id_platillo,
              pl.nombre,
              dp.cantidad AS qty,
              ROUND(dp.subtotal / dp.cantidad, 2) AS price,
              dp.notas AS nota,
              dp.curso,
              dp.estado_item
            FROM detalle_pedido dp
            INNER JOIN platillo pl ON pl.id_platillo = dp.id_platillo
            WHERE dp.id_pedido = :id_pedido
            ORDER BY dp.id_detalle
            """
        ),
        {"id_pedido": id_pedido},
    )

    pedido = dict(pedido_row._mapping)
    pedido["id_pedido"] = int(pedido["id_pedido"])
    pedido["id_mesa"] = int(pedido["id_mesa"])
    pedido["comensales"] = int(pedido["comensales"])
    pedido["total"] = float(pedido["total"])
    pedido["items"] = [
        {
            **dict(row._mapping),
            "id_detalle": int(row._mapping["id_detalle"]),
            "id_platillo": int(row._mapping["id_platillo"]),
            "qty": int(row._mapping["qty"]),
            "price": float(row._mapping["price"]),
        }
        for row in items_result.all()
    ]
    return pedido


async def pertenece_a_mesero(session: AsyncSession, id_pedido: int, id_mesero: int) -> bool:
    result = await session.execute(
        text(
            """
            SELECT 1
            FROM pedido p
            INNER JOIN mesa m ON m.id_mesa = p.id_mesa
            WHERE p.id_pedido = :id_pedido
              AND m.id_mesero = :id_mesero
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido, "id_mesero": id_mesero},
    )
    return result.first() is not None


async def obtener_estado_item(session: AsyncSession, id_pedido: int, id_detalle: int) -> str | None:
    result = await session.execute(
        text(
            """
            SELECT estado_item
            FROM detalle_pedido
            WHERE id_pedido = :id_pedido
              AND id_detalle = :id_detalle
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido, "id_detalle": id_detalle},
    )
    value = result.scalar_one_or_none()
    return str(value) if value is not None else None


async def entregar_item(session: AsyncSession, id_pedido: int, id_detalle: int) -> dict[str, Any]:
    await session.execute(
        text(
            """
            UPDATE detalle_pedido
            SET estado_item = 'delivered'
            WHERE id_pedido = :id_pedido
              AND id_detalle = :id_detalle
              AND estado_item = 'ready'
            """
        ),
        {"id_pedido": id_pedido, "id_detalle": id_detalle},
    )

    pending_result = await session.execute(
        text(
            """
            SELECT
              SUM(CASE WHEN estado_item = 'ready' THEN 1 ELSE 0 END) AS listos,
              SUM(CASE WHEN estado_item = 'en_cocina' THEN 1 ELSE 0 END) AS en_cocina
            FROM detalle_pedido
            WHERE id_pedido = :id_pedido
            """
        ),
        {"id_pedido": id_pedido},
    )
    pending = dict(pending_result.one()._mapping)

    if int(pending["listos"] or 0) == 0:
        await session.execute(
            text(
                """
                UPDATE mesa m
                INNER JOIN pedido p ON p.id_mesa = m.id_mesa
                SET m.estado = 'ocupada'
                WHERE p.id_pedido = :id_pedido
                  AND m.estado = 'lista'
                """
            ),
            {"id_pedido": id_pedido},
        )

    if int(pending["listos"] or 0) == 0 and int(pending["en_cocina"] or 0) == 0:
        await session.execute(
            text("UPDATE pedido SET estado = 'entregado' WHERE id_pedido = :id_pedido"),
            {"id_pedido": id_pedido},
        )

    await session.commit()
    pedido = await obtener_pedido(session, id_pedido)
    if pedido is None:
        raise RuntimeError("El pedido desaparecio despues de entregar el item")
    return pedido


async def obtener_pedido_base(session: AsyncSession, id_pedido: int) -> dict[str, Any] | None:
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


async def obtener_platillos_para_items(session: AsyncSession, ids_platillos: list[int]) -> dict[int, dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT id_platillo, nombre, precio, disponible
            FROM platillo
            WHERE id_platillo IN :ids_platillos
            """
        ).bindparams(bindparam("ids_platillos", expanding=True)),
        {"ids_platillos": ids_platillos},
    )
    platillos: dict[int, dict[str, Any]] = {}
    for row in result.all():
        data = dict(row._mapping)
        platillos[int(data["id_platillo"])] = data
    return platillos


async def agregar_items(
    session: AsyncSession,
    *,
    id_pedido: int,
    items: list[dict[str, Any]],
) -> dict[str, Any]:
    ids_platillos = sorted({int(item["id_platillo"]) for item in items})
    platillos = await obtener_platillos_para_items(session, ids_platillos)

    for item in items:
        id_platillo = int(item["id_platillo"])
        platillo = platillos.get(id_platillo)
        if platillo is None or not bool(platillo["disponible"]):
            raise ValueError(f"Platillo no disponible: {id_platillo}")

        qty = int(item["qty"])
        precio = Decimal(str(platillo["precio"]))
        subtotal = precio * qty
        nota = item.get("nota")
        modificadores = item.get("modificadores") or {}
        if modificadores:
            extras = ", ".join(f"{key}: {value}" for key, value in sorted(modificadores.items()) if value)
            nota = f"{nota}; {extras}" if nota else extras

        await session.execute(
            text(
                """
                INSERT INTO detalle_pedido
                  (id_pedido, id_platillo, cantidad, subtotal, notas, curso, estado_item)
                VALUES
                  (:id_pedido, :id_platillo, :cantidad, :subtotal, :notas, 'Plato fuerte', 'en_cocina')
                """
            ),
            {
                "id_pedido": id_pedido,
                "id_platillo": id_platillo,
                "cantidad": qty,
                "subtotal": subtotal,
                "notas": nota,
            },
        )

    await session.execute(
        text(
            """
            UPDATE pedido p
            SET p.total = (
                SELECT COALESCE(SUM(dp.subtotal), 0)
                FROM detalle_pedido dp
                WHERE dp.id_pedido = :id_pedido
            ),
            p.estado = 'en_cocina'
            WHERE p.id_pedido = :id_pedido
            """
        ),
        {"id_pedido": id_pedido},
    )
    await session.execute(
        text(
            """
            UPDATE mesa m
            INNER JOIN pedido p ON p.id_mesa = m.id_mesa
            SET m.estado = 'ocupada'
            WHERE p.id_pedido = :id_pedido
            """
        ),
        {"id_pedido": id_pedido},
    )
    await session.commit()
    pedido = await obtener_pedido(session, id_pedido)
    if pedido is None:
        raise RuntimeError("No se pudo recuperar el pedido actualizado")
    return pedido


async def obtener_total_pedido(session: AsyncSession, id_pedido: int) -> Decimal | None:
    result = await session.execute(
        text(
            """
            SELECT total
            FROM pedido
            WHERE id_pedido = :id_pedido
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido},
    )
    total = result.scalar_one_or_none()
    return Decimal(str(total)) if total is not None else None
