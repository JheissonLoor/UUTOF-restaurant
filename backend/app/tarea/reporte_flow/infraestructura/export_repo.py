from datetime import date
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.tarea.reporte_flow.dominio.exportacion import TipoReporte


REPORT_SQL: dict[TipoReporte, str] = {
    "ventas": """
        SELECT s.nombre AS sucursal,
               DATE_FORMAT(pa.fecha, '%Y-%m-%d') AS fecha,
               ROUND(SUM(pa.monto + COALESCE(pa.propina, 0)), 2) AS ingresos,
               COUNT(DISTINCT pa.id_pedido) AS pedidos,
               ROUND(AVG(pa.monto + COALESCE(pa.propina, 0)), 2) AS ticket_promedio
        FROM pago pa
        INNER JOIN pedido p ON p.id_pedido = pa.id_pedido
        INNER JOIN mesa m ON m.id_mesa = p.id_mesa
        INNER JOIN sucursal s ON s.id_sucursal = m.id_sucursal
        WHERE pa.estado = 'verificado'
          AND pa.fecha >= :desde
          AND pa.fecha < DATE_ADD(:hasta, INTERVAL 1 DAY)
          AND (:id_sucursal IS NULL OR m.id_sucursal = :id_sucursal)
        GROUP BY s.id_sucursal, s.nombre, DATE(pa.fecha)
        ORDER BY DATE(pa.fecha), s.nombre
    """,
    "productos": """
        SELECT s.nombre AS sucursal,
               pl.nombre AS platillo,
               COALESCE(c.nombre, 'Sin categoría') AS categoria,
               SUM(dp.cantidad) AS unidades,
               ROUND(SUM(dp.subtotal), 2) AS ingresos
        FROM detalle_pedido dp
        INNER JOIN pedido p ON p.id_pedido = dp.id_pedido
        INNER JOIN mesa m ON m.id_mesa = p.id_mesa
        INNER JOIN sucursal s ON s.id_sucursal = m.id_sucursal
        INNER JOIN platillo pl ON pl.id_platillo = dp.id_platillo
        LEFT JOIN categoria c ON c.id_categoria = pl.id_categoria
        WHERE p.creado_en >= :desde
          AND p.creado_en < DATE_ADD(:hasta, INTERVAL 1 DAY)
          AND p.estado <> 'cancelado'
          AND (:id_sucursal IS NULL OR m.id_sucursal = :id_sucursal)
        GROUP BY s.id_sucursal, s.nombre, pl.id_platillo, pl.nombre, c.nombre
        ORDER BY unidades DESC, pl.nombre
    """,
    "empleados": """
        SELECT u.nombre AS empleado,
               u.rol,
               COALESCE(s.nombre, 'Sin sucursal') AS sucursal,
               COUNT(DISTINCT p.id_pedido) AS pedidos_atendidos,
               ROUND(COALESCE(SUM(pa.monto), 0), 2) AS ventas,
               ROUND(COALESCE(SUM(pa.propina), 0), 2) AS propinas
        FROM usuario u
        LEFT JOIN sucursal s ON s.id_sucursal = u.id_sucursal
        LEFT JOIN mesa m ON m.id_mesero = u.id_usuario
        LEFT JOIN pedido p ON p.id_mesa = m.id_mesa
          AND p.creado_en >= :desde
          AND p.creado_en < DATE_ADD(:hasta, INTERVAL 1 DAY)
        LEFT JOIN pago pa ON pa.id_pedido = p.id_pedido AND pa.estado = 'verificado'
        WHERE u.rol IN ('mesero', 'cocina', 'gerente_sucursal')
          AND (:id_sucursal IS NULL OR u.id_sucursal = :id_sucursal)
        GROUP BY u.id_usuario, u.nombre, u.rol, s.nombre
        ORDER BY ventas DESC, u.nombre
    """,
    "inventario": """
        SELECT s.nombre AS sucursal,
               i.nombre AS insumo,
               CONCAT(ROUND(inv.stock_actual, 2), ' ', inv.unidad) AS stock,
               CONCAT(ROUND(inv.stock_maximo, 2), ' ', inv.unidad) AS capacidad,
               ROUND(inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100, 1) AS nivel_pct,
               CASE
                 WHEN inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100 < 15 THEN 'Crítico'
                 WHEN inv.stock_actual / NULLIF(inv.stock_maximo, 0) * 100 < 35 THEN 'Bajo'
                 ELSE 'Saludable'
               END AS estado
        FROM inventario_sucursal inv
        INNER JOIN sucursal s ON s.id_sucursal = inv.id_sucursal
        INNER JOIN insumo i ON i.id_insumo = inv.id_insumo
        WHERE (:id_sucursal IS NULL OR inv.id_sucursal = :id_sucursal)
        ORDER BY nivel_pct, s.nombre, i.nombre
    """,
}


async def consultar_reporte(
    session: AsyncSession,
    *,
    tipo: TipoReporte,
    desde: date,
    hasta: date,
    id_sucursal: int | None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(REPORT_SQL[tipo]),
        {"desde": desde, "hasta": hasta, "id_sucursal": id_sucursal},
    )
    return [dict(row._mapping) for row in result.all()]
