from datetime import datetime
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def metricas_por_sucursal(
    session: AsyncSession,
    *,
    inicio: datetime,
    fin: datetime,
    inicio_anterior: datetime,
    fin_anterior: datetime,
    id_sucursal: int | None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            WITH pagos_agrupados AS (
              SELECT
                m.id_sucursal,
                COALESCE(SUM(CASE
                  WHEN pa.estado = 'verificado'
                   AND pa.fecha >= :inicio AND pa.fecha < :fin
                  THEN pa.monto + COALESCE(pa.propina, 0) ELSE 0 END), 0) AS ingresos,
                COUNT(DISTINCT CASE
                  WHEN pa.estado = 'verificado'
                   AND pa.fecha >= :inicio AND pa.fecha < :fin
                  THEN pa.id_transaccion END) AS pagos,
                COALESCE(SUM(CASE
                  WHEN pa.estado = 'verificado'
                   AND pa.fecha >= :inicio_anterior AND pa.fecha < :fin_anterior
                  THEN pa.monto + COALESCE(pa.propina, 0) ELSE 0 END), 0) AS ingresos_anteriores,
                COUNT(DISTINCT CASE
                  WHEN pa.estado = 'verificado'
                   AND pa.fecha >= :inicio_anterior AND pa.fecha < :fin_anterior
                  THEN pa.id_transaccion END) AS pagos_anteriores
              FROM mesa m
              LEFT JOIN pedido pe ON pe.id_mesa = m.id_mesa
              LEFT JOIN pago pa ON pa.id_pedido = pe.id_pedido
              GROUP BY m.id_sucursal
            ),
            pedidos_agrupados AS (
              SELECT
                m.id_sucursal,
                COUNT(DISTINCT CASE
                  WHEN pe.creado_en >= :inicio AND pe.creado_en < :fin
                  THEN pe.id_pedido END) AS pedidos,
                COUNT(DISTINCT CASE
                  WHEN pe.creado_en >= :inicio_anterior AND pe.creado_en < :fin_anterior
                  THEN pe.id_pedido END) AS pedidos_anteriores
              FROM mesa m
              LEFT JOIN pedido pe ON pe.id_mesa = m.id_mesa
              GROUP BY m.id_sucursal
            ),
            mesas_agrupadas AS (
              SELECT
                id_sucursal,
                COUNT(*) AS mesas,
                SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) AS mesas_ocupadas
              FROM mesa
              GROUP BY id_sucursal
            ),
            inventario_agrupado AS (
              SELECT
                id_sucursal,
                CASE
                  WHEN MIN(stock) <= 0 THEN 'critico'
                  WHEN MIN(stock) <= 5 THEN 'bajo'
                  ELSE 'ok'
                END AS inventario_estado
              FROM insumo
              WHERE id_sucursal IS NOT NULL
              GROUP BY id_sucursal
            )
            SELECT
              s.id_sucursal,
              s.nombre,
              s.color,
              COALESCE(pa.ingresos, 0) AS ingresos,
              COALESCE(pa.pagos, 0) AS pagos,
              COALESCE(pa.ingresos_anteriores, 0) AS ingresos_anteriores,
              COALESCE(pa.pagos_anteriores, 0) AS pagos_anteriores,
              COALESCE(pe.pedidos, 0) AS pedidos,
              COALESCE(pe.pedidos_anteriores, 0) AS pedidos_anteriores,
              COALESCE(me.mesas, 0) AS mesas,
              COALESCE(me.mesas_ocupadas, 0) AS mesas_ocupadas,
              COALESCE(inv.inventario_estado, 'ok') AS inventario_estado
            FROM sucursal s
            LEFT JOIN pagos_agrupados pa ON pa.id_sucursal = s.id_sucursal
            LEFT JOIN pedidos_agrupados pe ON pe.id_sucursal = s.id_sucursal
            LEFT JOIN mesas_agrupadas me ON me.id_sucursal = s.id_sucursal
            LEFT JOIN inventario_agrupado inv ON inv.id_sucursal = s.id_sucursal
            WHERE s.activa = TRUE
              AND (:id_sucursal IS NULL OR s.id_sucursal = :id_sucursal)
            ORDER BY s.id_sucursal
            """
        ),
        {
            "inicio": inicio.replace(tzinfo=None),
            "fin": fin.replace(tzinfo=None),
            "inicio_anterior": inicio_anterior.replace(tzinfo=None),
            "fin_anterior": fin_anterior.replace(tzinfo=None),
            "id_sucursal": id_sucursal,
        },
    )
    return [dict(row._mapping) for row in result.all()]
