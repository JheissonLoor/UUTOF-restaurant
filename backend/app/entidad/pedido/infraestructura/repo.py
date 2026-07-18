from decimal import Decimal
from typing import Any

from sqlalchemy import bindparam, text
from sqlalchemy.ext.asyncio import AsyncSession


COCINA_TO_DB_ESTADO = {
    "espera": "creado",
    "cocina": "en_cocina",
    "listo": "listo",
    "entregado": "entregado",
    "pagado": "pagado",
}

DB_TO_COCINA_ESTADO = {value: key for key, value in COCINA_TO_DB_ESTADO.items()}

COCINA_TRANSICIONES = {
    "empezarPreparacion": ("creado", "en_cocina"),
    "marcarTerminado": ("en_cocina", "listo"),
    "marcarListo": ("en_cocina", "listo"),
    "entregarMesa": ("listo", "entregado"),
    "entregar": ("listo", "entregado"),
}


async def listar_pedidos_cocina(
    session: AsyncSession,
    estados: list[str],
    id_pedido: int | None = None,
) -> list[dict[str, Any]]:
    db_estados = [COCINA_TO_DB_ESTADO[estado] for estado in estados]
    params: dict[str, Any] = {"estados": db_estados}
    id_filter = ""
    if id_pedido is not None:
        id_filter = "AND p.id_pedido = :id_pedido"
        params["id_pedido"] = id_pedido

    pedidos_result = await session.execute(
        text(
            f"""
            SELECT
              p.id_pedido,
              p.id_pedido AS num,
              p.id_mesa,
              COALESCE(NULLIF(u.nombre, ''), CONCAT('Cliente mesa ', m.numero)) AS cliente,
              m.numero AS mesa,
              CASE WHEN u.rol = 'cliente' THEN 'app_cliente' ELSE 'mesero' END AS origen,
              COALESCE(NULLIF(mesero.nombre, ''), 'Cocina UTTOF') AS mesero,
              p.estado AS db_estado,
              DATE_FORMAT(p.creado_en, '%Y-%m-%dT%H:%i:%s') AS creado_en,
              GREATEST(TIMESTAMPDIFF(MINUTE, p.creado_en, COALESCE(p.pausado_en, NOW())), 0) AS minutos,
              GREATEST(TIMESTAMPDIFF(SECOND, p.creado_en, COALESCE(p.pausado_en, NOW())), 0) AS elapsed_seg,
              COALESCE(p.pausado, FALSE) AS pausado,
              p.total
            FROM pedido p
            INNER JOIN mesa m ON m.id_mesa = p.id_mesa
            LEFT JOIN usuario u ON u.id_usuario = p.id_usuario
            LEFT JOIN usuario mesero ON mesero.id_usuario = m.id_mesero
            WHERE p.estado IN :estados
              {id_filter}
            ORDER BY FIELD(p.estado, 'creado', 'en_cocina', 'listo', 'entregado', 'pagado'),
                     p.creado_en ASC,
                     p.id_pedido ASC
            """
        ).bindparams(bindparam("estados", expanding=True)),
        params,
    )
    pedido_rows = pedidos_result.all()
    if not pedido_rows:
        return []

    pedidos: list[dict[str, Any]] = []
    pedido_ids: list[int] = []
    for row in pedido_rows:
        data = dict(row._mapping)
        id_actual = int(data["id_pedido"])
        pedido_ids.append(id_actual)
        pedidos.append(
            {
                "id_pedido": id_actual,
                "num": id_actual,
                "id_mesa": int(data["id_mesa"]),
                "cliente": str(data["cliente"]),
                "mesa": int(data["mesa"]),
                "origen": str(data["origen"]),
                "mesero": str(data["mesero"]),
                "estado": DB_TO_COCINA_ESTADO[str(data["db_estado"])],
                "creado_en": str(data["creado_en"]),
                "minutos": int(data["minutos"] or 0),
                "elapsed_seg": int(data["elapsed_seg"] or 0),
                "target_seg": 18 * 60,
                "pausado": bool(data["pausado"]),
                "total": float(data["total"] or 0),
                "items": [],
            }
        )

    items_result = await session.execute(
        text(
            """
            SELECT
              dp.id_pedido,
              dp.id_detalle,
              dp.cantidad AS qty,
              pl.nombre,
              dp.notas AS nota,
              dp.estado_item
            FROM detalle_pedido dp
            INNER JOIN platillo pl ON pl.id_platillo = dp.id_platillo
            WHERE dp.id_pedido IN :pedido_ids
            ORDER BY dp.id_pedido, dp.id_detalle
            """
        ).bindparams(bindparam("pedido_ids", expanding=True)),
        {"pedido_ids": pedido_ids},
    )

    items_by_pedido: dict[int, list[dict[str, Any]]] = {id_actual: [] for id_actual in pedido_ids}
    for row in items_result.all():
        data = dict(row._mapping)
        items_by_pedido[int(data["id_pedido"])].append(
            {
                "id_detalle": int(data["id_detalle"]),
                "qty": int(data["qty"]),
                "nombre": str(data["nombre"]),
                "nota": data["nota"],
                "modificadores": [],
                "alergenos": [],
                "estado_item": str(data["estado_item"]),
                "listo": str(data["estado_item"]) in {"ready", "delivered"},
            }
        )

    for pedido in pedidos:
        pedido["items"] = items_by_pedido[pedido["id_pedido"]]

    return pedidos


async def cambiar_estado_pedido_cocina(
    session: AsyncSession,
    id_pedido: int,
    transicion: str,
) -> dict[str, Any] | None:
    expected, next_status = COCINA_TRANSICIONES[transicion]
    current_result = await session.execute(
        text(
            """
            SELECT estado
            FROM pedido
            WHERE id_pedido = :id_pedido
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido},
    )
    current_status = current_result.scalar_one_or_none()
    if current_status is None:
        return None

    if str(current_status) != expected:
        current_label = DB_TO_COCINA_ESTADO.get(str(current_status), str(current_status))
        expected_label = DB_TO_COCINA_ESTADO[expected]
        raise ValueError(f"El pedido esta en {current_label}; se esperaba {expected_label}")

    await session.execute(
        text(
            """
            UPDATE pedido
            SET estado = :next_status
            WHERE id_pedido = :id_pedido
            """
        ),
        {"id_pedido": id_pedido, "next_status": next_status},
    )

    if next_status == "en_cocina":
        await session.execute(
            text(
                """
                UPDATE detalle_pedido
                SET estado_item = 'en_cocina'
                WHERE id_pedido = :id_pedido
                """
            ),
            {"id_pedido": id_pedido},
        )
    elif next_status == "listo":
        await session.execute(
            text(
                """
                UPDATE detalle_pedido
                SET estado_item = 'ready'
                WHERE id_pedido = :id_pedido
                  AND estado_item = 'en_cocina'
                """
            ),
            {"id_pedido": id_pedido},
        )
        await session.execute(
            text(
                """
                UPDATE mesa m
                INNER JOIN pedido p ON p.id_mesa = m.id_mesa
                SET m.estado = 'lista'
                WHERE p.id_pedido = :id_pedido
                """
            ),
            {"id_pedido": id_pedido},
        )
    elif next_status == "entregado":
        await session.execute(
            text(
                """
                UPDATE detalle_pedido
                SET estado_item = 'delivered'
                WHERE id_pedido = :id_pedido
                  AND estado_item = 'ready'
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
    pedidos = await listar_pedidos_cocina(session, list(COCINA_TO_DB_ESTADO.keys()), id_pedido)
    return pedidos[0] if pedidos else None


async def marcar_item_cocina(
    session: AsyncSession,
    id_pedido: int,
    id_detalle: int,
    listo: bool,
) -> dict[str, Any] | None:
    item_result = await session.execute(
        text(
            """
            SELECT dp.estado_item, p.estado
            FROM detalle_pedido dp
            INNER JOIN pedido p ON p.id_pedido = dp.id_pedido
            WHERE dp.id_pedido = :id_pedido
              AND dp.id_detalle = :id_detalle
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido, "id_detalle": id_detalle},
    )
    row = item_result.first()
    if row is None:
        return None

    data = dict(row._mapping)
    if str(data["estado_item"]) == "delivered":
        raise ValueError("El item ya fue entregado y no puede volver a cocina")
    if str(data["estado"]) in {"pagado", "cancelado"}:
        raise ValueError("El pedido ya no acepta cambios de cocina")

    next_item_status = "ready" if listo else "en_cocina"
    await session.execute(
        text(
            """
            UPDATE detalle_pedido
            SET estado_item = :estado_item
            WHERE id_pedido = :id_pedido
              AND id_detalle = :id_detalle
            """
        ),
        {"estado_item": next_item_status, "id_pedido": id_pedido, "id_detalle": id_detalle},
    )

    counts_result = await session.execute(
        text(
            """
            SELECT
              COUNT(*) AS total_items,
              SUM(CASE WHEN estado_item IN ('ready', 'delivered') THEN 1 ELSE 0 END) AS listos
            FROM detalle_pedido
            WHERE id_pedido = :id_pedido
            """
        ),
        {"id_pedido": id_pedido},
    )
    counts = dict(counts_result.one()._mapping)
    total_items = int(counts["total_items"] or 0)
    ready_items = int(counts["listos"] or 0)

    if total_items > 0 and ready_items == total_items:
        await session.execute(
            text("UPDATE pedido SET estado = 'listo' WHERE id_pedido = :id_pedido"),
            {"id_pedido": id_pedido},
        )
        await session.execute(
            text(
                """
                UPDATE mesa m
                INNER JOIN pedido p ON p.id_mesa = m.id_mesa
                SET m.estado = 'lista'
                WHERE p.id_pedido = :id_pedido
                """
            ),
            {"id_pedido": id_pedido},
        )
    else:
        await session.execute(
            text(
                """
                UPDATE pedido
                SET estado = 'en_cocina'
                WHERE id_pedido = :id_pedido
                  AND estado IN ('creado', 'en_cocina', 'listo')
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
    pedidos = await listar_pedidos_cocina(session, list(COCINA_TO_DB_ESTADO.keys()), id_pedido)
    return pedidos[0] if pedidos else None


async def pausar_pedido_cocina(session: AsyncSession, id_pedido: int, pausado: bool) -> dict[str, Any] | None:
    current_result = await session.execute(
        text("SELECT estado FROM pedido WHERE id_pedido = :id_pedido LIMIT 1"),
        {"id_pedido": id_pedido},
    )
    current_status = current_result.scalar_one_or_none()
    if current_status is None:
        return None
    if str(current_status) in {"pagado", "cancelado"}:
        raise ValueError("El pedido ya no puede pausarse")

    await session.execute(
        text(
            """
            UPDATE pedido
            SET pausado = :pausado,
                pausado_en = CASE WHEN :pausado THEN COALESCE(pausado_en, NOW()) ELSE NULL END
            WHERE id_pedido = :id_pedido
            """
        ),
        {"id_pedido": id_pedido, "pausado": pausado},
    )
    await session.commit()
    pedidos = await listar_pedidos_cocina(session, list(COCINA_TO_DB_ESTADO.keys()), id_pedido)
    return pedidos[0] if pedidos else None


async def reportar_insumo(
    session: AsyncSession,
    *,
    id_pedido: int,
    id_detalle: int,
    id_usuario: int,
    nota: str,
) -> dict[str, Any] | None:
    exists_result = await session.execute(
        text(
            """
            SELECT 1
            FROM detalle_pedido
            WHERE id_pedido = :id_pedido
              AND id_detalle = :id_detalle
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido, "id_detalle": id_detalle},
    )
    if exists_result.first() is None:
        return None

    await session.execute(
        text(
            """
            INSERT INTO pedido_insumo_alerta (id_pedido, id_detalle, id_usuario, nota)
            VALUES (:id_pedido, :id_detalle, :id_usuario, :nota)
            """
        ),
        {
            "id_pedido": id_pedido,
            "id_detalle": id_detalle,
            "id_usuario": id_usuario,
            "nota": nota,
        },
    )
    await session.commit()
    pedidos = await listar_pedidos_cocina(session, list(COCINA_TO_DB_ESTADO.keys()), id_pedido)
    return pedidos[0] if pedidos else None


async def obtener_pedido(session: AsyncSession, id_pedido: int) -> dict[str, Any] | None:
    pedido_result = await session.execute(
        text(
            """
            SELECT p.id_pedido, p.id_mesa, p.estado, p.comensales, p.total,
                   pg.estado AS pago_estado
            FROM pedido p
            LEFT JOIN pago pg ON pg.id_pedido = p.id_pedido
            WHERE p.id_pedido = :id_pedido
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


async def pertenece_a_cliente(session: AsyncSession, id_pedido: int, id_cliente: int) -> bool:
    result = await session.execute(
        text(
            """
            SELECT 1
            FROM pedido
            WHERE id_pedido = :id_pedido
              AND id_usuario = :id_cliente
            LIMIT 1
            """
        ),
        {"id_pedido": id_pedido, "id_cliente": id_cliente},
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


async def obtener_pedido_abierto_por_mesa(session: AsyncSession, id_mesa: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT p.id_pedido, p.id_mesa, p.estado, p.total, m.id_mesero
            FROM pedido p
            INNER JOIN mesa m ON m.id_mesa = p.id_mesa
            WHERE p.id_mesa = :id_mesa
              AND p.estado IN ('creado', 'en_cocina', 'listo', 'entregado')
            ORDER BY p.creado_en DESC, p.id_pedido DESC
            LIMIT 1
            """
        ),
        {"id_mesa": id_mesa},
    )
    row = result.first()
    return dict(row._mapping) if row is not None else None


async def crear_pedido_base_cliente(session: AsyncSession, id_cliente: int, id_mesa: int) -> int:
    await session.execute(
        text(
            """
            UPDATE mesa
            SET estado = 'ocupada'
            WHERE id_mesa = :id_mesa
            """
        ),
        {"id_mesa": id_mesa},
    )
    await session.execute(
        text(
            """
            INSERT INTO pedido (id_usuario, id_mesa, comensales, estado, total)
            VALUES (:id_cliente, :id_mesa, 1, 'creado', 0)
            """
        ),
        {"id_cliente": id_cliente, "id_mesa": id_mesa},
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID()"))
    return int(result.scalar_one())


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
