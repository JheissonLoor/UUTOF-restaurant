from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def listar_inventario(
    session: AsyncSession,
    *,
    id_sucursal: int | None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              i.id_insumo,
              i.nombre,
              inv.descripcion,
              inv.id_sucursal,
              s.nombre AS sucursal,
              ROUND(LEAST(inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100, 100), 1) AS nivel_pct,
              CONCAT(ROUND(inv.stock_actual, 1), ' ', inv.unidad) AS stock,
              CASE
                WHEN inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100 < 15 THEN 'critico'
                WHEN inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100 < 35 THEN 'bajo'
                ELSE 'ok'
              END AS estado,
              CONCAT(ROUND(GREATEST(inv.stock_maximo - inv.stock_actual, 0), 1), ' ', inv.unidad) AS sugerido
            FROM inventario_sucursal inv
            INNER JOIN insumo i ON i.id_insumo = inv.id_insumo
            INNER JOIN sucursal s ON s.id_sucursal = inv.id_sucursal
            WHERE (:id_sucursal IS NULL OR inv.id_sucursal = :id_sucursal)
            ORDER BY
              FIELD(
                CASE
                  WHEN inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100 < 15 THEN 'critico'
                  WHEN inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100 < 35 THEN 'bajo'
                  ELSE 'ok'
                END,
                'critico', 'bajo', 'ok'
              ),
              s.id_sucursal,
              i.nombre
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_inventario_insumo(
    session: AsyncSession,
    *,
    id_sucursal: int,
    id_insumo: int,
) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT id_insumo, unidad
            FROM inventario_sucursal
            WHERE id_sucursal = :id_sucursal AND id_insumo = :id_insumo
            LIMIT 1
            """
        ),
        {"id_sucursal": id_sucursal, "id_insumo": id_insumo},
    )
    row = result.first()
    return dict(row._mapping) if row else None


async def crear_orden_compra(
    session: AsyncSession,
    *,
    id_sucursal: int,
    id_usuario: int,
    items: list[dict[str, object]],
) -> int:
    await session.execute(
        text(
            """
            INSERT INTO orden_compra (id_sucursal, creado_por, estado)
            VALUES (:id_sucursal, :id_usuario, 'generada')
            """
        ),
        {"id_sucursal": id_sucursal, "id_usuario": id_usuario},
    )
    id_orden = int((await session.execute(text("SELECT LAST_INSERT_ID()"))).scalar_one())
    for item in items:
        await session.execute(
            text(
                """
                INSERT INTO orden_compra_detalle (id_orden, id_insumo, cantidad, unidad)
                VALUES (:id_orden, :id_insumo, :cantidad, :unidad)
                """
            ),
            {"id_orden": id_orden, **item},
        )
    await session.commit()
    return id_orden
