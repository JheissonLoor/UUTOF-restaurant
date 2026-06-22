from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

async def listar_mesas(
    session: AsyncSession,
    *,
    id_mesero: int | None = None,
    id_mesa: int | None = None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              m.id_mesa,
              m.numero,
              m.zona,
              m.capacidad,
              m.estado,
              p.id_pedido,
              p.comensales,
              DATE_FORMAT(p.creado_en, '%Y-%m-%dT%H:%i:%s') AS abierto_en,
              GREATEST(TIMESTAMPDIFF(MINUTE, p.creado_en, NOW()), 0) AS minutos,
              p.total,
              COALESCE((
                SELECT dp2.curso
                FROM detalle_pedido dp2
                WHERE dp2.id_pedido = p.id_pedido
                  AND dp2.estado_item <> 'delivered'
                ORDER BY dp2.id_detalle
                LIMIT 1
              ), 'Sin curso') AS curso_actual,
              COALESCE(items.items_count, 0) AS items_count,
              COALESCE(items.en_cocina, 0) AS en_cocina,
              CASE
                WHEN m.estado = 'lista' OR COALESCE(items.listo, 0) > 0 THEN 1
                WHEN p.id_pedido IS NOT NULL AND TIMESTAMPDIFF(MINUTE, p.creado_en, NOW()) >= 45 THEN 1
                ELSE 0
              END AS alerta,
              CASE
                WHEN m.estado = 'lista' OR COALESCE(items.listo, 0) > 0 THEN 'Plato listo en pase'
                WHEN p.id_pedido IS NULL THEN NULL
                WHEN COALESCE(items.items_count, 0) = 0 THEN 'Esperando orden'
                WHEN COALESCE(items.en_cocina, 0) > 0 THEN 'En preparacion'
                ELSE 'Listo para cuenta'
              END AS progreso
            FROM mesa m
            LEFT JOIN pedido p
              ON p.id_pedido = (
                SELECT p2.id_pedido
                FROM pedido p2
                WHERE p2.id_mesa = m.id_mesa
                  AND p2.estado IN ('creado', 'en_cocina', 'listo', 'entregado')
                ORDER BY p2.creado_en DESC, p2.id_pedido DESC
                LIMIT 1
              )
            LEFT JOIN (
              SELECT
                id_pedido,
                COALESCE(SUM(cantidad), 0) AS items_count,
                COALESCE(SUM(CASE WHEN estado_item = 'en_cocina' THEN cantidad ELSE 0 END), 0) AS en_cocina,
                COALESCE(SUM(CASE WHEN estado_item = 'ready' THEN cantidad ELSE 0 END), 0) AS listo
              FROM detalle_pedido
              GROUP BY id_pedido
            ) items ON items.id_pedido = p.id_pedido
            WHERE (:id_mesero IS NULL OR m.id_mesero = :id_mesero)
              AND (:id_mesa IS NULL OR m.id_mesa = :id_mesa)
            ORDER BY m.numero
            """
        ),
        {"id_mesero": id_mesero, "id_mesa": id_mesa},
    )
    mesas: list[dict[str, Any]] = []
    for row in result.all():
        data = dict(row._mapping)
        pedido_activo = None
        if data["id_pedido"] is not None:
            pedido_activo = {
                "id_pedido": int(data["id_pedido"]),
                "comensales": int(data["comensales"]),
                "abierto_en": data["abierto_en"],
                "minutos": int(data["minutos"]),
                "total": float(data["total"]),
                "curso_actual": data["curso_actual"],
                "items_count": int(data["items_count"]),
                "en_cocina": int(data["en_cocina"]),
                "alerta": int(data["alerta"]),
                "progreso": data["progreso"],
            }
        mesas.append(
            {
                "id_mesa": int(data["id_mesa"]),
                "numero": int(data["numero"]),
                "zona": data["zona"],
                "capacidad": int(data["capacidad"]),
                "estado": data["estado"],
                "pedido_activo": pedido_activo,
            }
        )
    return mesas


async def obtener_mesa(session: AsyncSession, id_mesa: int) -> dict[str, Any] | None:
    mesas = await listar_mesas(session, id_mesa=id_mesa)
    return mesas[0] if mesas else None


async def actualizar_estado_mesa(
    session: AsyncSession,
    id_mesa: int,
    estado: str,
) -> dict[str, Any] | None:
    await session.execute(
        text(
            """
            UPDATE mesa
            SET estado = :estado
            WHERE id_mesa = :id_mesa
            """
        ),
        {"id_mesa": id_mesa, "estado": estado},
    )
    await session.commit()
    return await obtener_mesa(session, id_mesa)
