from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def demanda_por_hora(
    session: AsyncSession,
    *,
    id_sucursal: int | None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT muestra.hora,
                   ROUND(AVG(muestra.cantidad), 1) AS demanda,
                   SUM(muestra.cantidad) AS muestras
            FROM (
              SELECT DATE(p.creado_en) AS dia,
                     HOUR(p.creado_en) AS hora,
                     COUNT(*) AS cantidad
              FROM pedido p
              INNER JOIN mesa m ON m.id_mesa = p.id_mesa
              WHERE p.creado_en >= DATE_SUB(CURRENT_DATE, INTERVAL 28 DAY)
                AND p.estado <> 'cancelado'
                AND HOUR(p.creado_en) BETWEEN 11 AND 22
                AND (:id_sucursal IS NULL OR m.id_sucursal = :id_sucursal)
              GROUP BY DATE(p.creado_en), HOUR(p.creado_en)
            ) muestra
            GROUP BY muestra.hora
            ORDER BY muestra.hora
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    return [dict(row._mapping) for row in result.all()]


async def insumo_prioritario(
    session: AsyncSession,
    *,
    id_sucursal: int | None,
) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT inv.id_insumo,
                   i.nombre,
                   s.nombre AS sucursal,
                   inv.unidad,
                   GREATEST(inv.stock_maximo - inv.stock_actual, 0) AS sugerido,
                   inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100 AS nivel_pct
            FROM inventario_sucursal inv
            INNER JOIN insumo i ON i.id_insumo = inv.id_insumo
            INNER JOIN sucursal s ON s.id_sucursal = inv.id_sucursal
            WHERE (:id_sucursal IS NULL OR inv.id_sucursal = :id_sucursal)
              AND inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100 < 35
            ORDER BY nivel_pct ASC, inv.actualizado_en ASC
            LIMIT 1
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    row = result.first()
    return dict(row._mapping) if row else None


async def platillo_destacado(
    session: AsyncSession,
    *,
    id_sucursal: int | None,
) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT pl.id_platillo, pl.nombre, SUM(dp.cantidad) AS cantidad
            FROM detalle_pedido dp
            INNER JOIN pedido p ON p.id_pedido = dp.id_pedido
            INNER JOIN mesa m ON m.id_mesa = p.id_mesa
            INNER JOIN platillo pl ON pl.id_platillo = dp.id_platillo
            WHERE p.creado_en >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
              AND p.estado <> 'cancelado'
              AND (:id_sucursal IS NULL OR m.id_sucursal = :id_sucursal)
            GROUP BY pl.id_platillo, pl.nombre
            ORDER BY cantidad DESC, pl.nombre
            LIMIT 1
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    row = result.first()
    return dict(row._mapping) if row else None


async def registrar_accion(
    session: AsyncSession,
    *,
    id_recomendacion: str,
    id_sucursal: int | None,
    tipo: str,
    accion: str,
    id_usuario: int,
) -> None:
    await session.execute(
        text(
            """
            INSERT INTO ia_recomendacion_accion
              (id_recomendacion, id_sucursal, tipo, accion, id_usuario)
            VALUES
              (:id_recomendacion, :id_sucursal, :tipo, :accion, :id_usuario)
            ON DUPLICATE KEY UPDATE
              accion = VALUES(accion),
              id_usuario = VALUES(id_usuario),
              actualizado_en = CURRENT_TIMESTAMP
            """
        ),
        {
            "id_recomendacion": id_recomendacion,
            "id_sucursal": id_sucursal,
            "tipo": tipo,
            "accion": accion,
            "id_usuario": id_usuario,
        },
    )
    await session.commit()
