from datetime import date
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


def _one(row: Any) -> dict[str, Any]:
    return dict(row._mapping)


async def resumen_ventas(session: AsyncSession, from_date: date, to_date: date) -> dict[str, Any]:
    result = await session.execute(
        text(
            """
            SELECT
              COALESCE(SUM(monto + COALESCE(propina, 0)), 0) AS ingresos_total,
              COUNT(DISTINCT id_pedido) AS pedidos_total,
              COALESCE(AVG(monto + COALESCE(propina, 0)), 0) AS ticket_promedio
            FROM pago
            WHERE fecha >= :from_date
              AND fecha < DATE_ADD(:to_date, INTERVAL 1 DAY)
            """
        ),
        {"from_date": from_date, "to_date": to_date},
    )
    return _one(result.one())


_PERIODO_SQL = {
    "dia": "DATE_FORMAT(pa.fecha, '%Y-%m-%d')",
    "semana": "DATE_FORMAT(DATE_SUB(DATE(pa.fecha), INTERVAL WEEKDAY(pa.fecha) DAY), '%Y-%m-%d')",
    "mes": "DATE_FORMAT(pa.fecha, '%Y-%m')",
}


async def ventas_por_periodo(
    session: AsyncSession,
    from_date: date,
    to_date: date,
    granularidad: str,
) -> list[dict[str, Any]]:
    periodo_sql = _PERIODO_SQL[granularidad]
    result = await session.execute(
        text(
            f"""
            SELECT
              {periodo_sql} AS periodo,
              COALESCE(SUM(pa.monto + COALESCE(pa.propina, 0)), 0) AS ingresos,
              COUNT(DISTINCT pa.id_pedido) AS pedidos,
              COALESCE(AVG(pa.monto + COALESCE(pa.propina, 0)), 0) AS ticket_promedio
            FROM pago pa
            WHERE pa.fecha >= :from_date
              AND pa.fecha < DATE_ADD(:to_date, INTERVAL 1 DAY)
            GROUP BY {periodo_sql}
            ORDER BY MIN(pa.fecha)
            """
        ),
        {"from_date": from_date, "to_date": to_date},
    )
    return [dict(row._mapping) for row in result.all()]


async def top_platillos_ventas(session: AsyncSession, from_date: date, to_date: date) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              pl.id_platillo,
              pl.nombre,
              COALESCE(SUM(dp.cantidad), 0) AS cantidad,
              COALESCE(SUM(dp.subtotal), 0) AS ingresos
            FROM pago pa
            INNER JOIN pedido pe ON pe.id_pedido = pa.id_pedido
            INNER JOIN detalle_pedido dp ON dp.id_pedido = pe.id_pedido
            INNER JOIN platillo pl ON pl.id_platillo = dp.id_platillo
            WHERE pa.fecha >= :from_date
              AND pa.fecha < DATE_ADD(:to_date, INTERVAL 1 DAY)
            GROUP BY pl.id_platillo, pl.nombre
            ORDER BY cantidad DESC, pl.nombre
            LIMIT 5
            """
        ),
        {"from_date": from_date, "to_date": to_date},
    )
    return [dict(row._mapping) for row in result.all()]


async def dashboard_resumen(session: AsyncSession) -> dict[str, Any]:
    result = await session.execute(
        text(
            """
            SELECT
              (SELECT COALESCE(SUM(monto + COALESCE(propina, 0)), 0)
                 FROM pago WHERE DATE(fecha) = CURRENT_DATE) AS ingresos_hoy,
              (SELECT COALESCE(SUM(monto + COALESCE(propina, 0)), 0)
                 FROM pago WHERE DATE(fecha) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)) AS ingresos_ayer,
              (SELECT COUNT(*)
                 FROM pedido WHERE DATE(creado_en) = CURRENT_DATE) AS pedidos_hoy,
              (SELECT COUNT(*)
                 FROM pedido WHERE DATE(creado_en) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)) AS pedidos_ayer,
              (SELECT COALESCE(AVG(monto + COALESCE(propina, 0)), 0)
                 FROM pago WHERE DATE(fecha) = CURRENT_DATE) AS ticket_promedio,
              (SELECT COALESCE(AVG(monto + COALESCE(propina, 0)), 0)
                 FROM pago WHERE DATE(fecha) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)) AS ticket_promedio_ayer,
              (SELECT COUNT(*)
                 FROM mesa WHERE estado = 'ocupada') AS mesas_ocupadas,
              (SELECT COUNT(*)
                 FROM mesa) AS mesas_totales,
              (SELECT COUNT(*)
                 FROM pedido WHERE estado IN ('creado', 'en_cocina', 'listo', 'entregado')) AS pedidos_pendientes
            """
        )
    )
    return _one(result.one())


async def dashboard_distribucion(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT estados.`key`, estados.label, COUNT(p.id_pedido) AS count
            FROM (
              SELECT 'espera' AS `key`, 'En Espera' AS label, 'creado' AS db_estado
              UNION ALL SELECT 'preparacion', 'En Preparación', 'en_cocina'
              UNION ALL SELECT 'terminado', 'Terminado', 'listo'
              UNION ALL SELECT 'falta_pagar', 'Falta Pagar', 'entregado'
              UNION ALL SELECT 'pagado', 'Pagado', 'pagado'
              UNION ALL SELECT 'cancelado', 'Cancelado', 'cancelado'
            ) estados
            LEFT JOIN pedido p
              ON p.estado = estados.db_estado
             AND DATE(p.creado_en) = CURRENT_DATE
            GROUP BY estados.`key`, estados.label
            ORDER BY FIELD(estados.`key`, 'espera', 'preparacion', 'terminado', 'falta_pagar', 'pagado', 'cancelado')
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def dashboard_ingresos_14_dias(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            WITH RECURSIVE offsets(n) AS (
              SELECT 0
              UNION ALL
              SELECT n + 1 FROM offsets WHERE n < 13
            )
            SELECT
              DATE_FORMAT(DATE_ADD(DATE_SUB(CURRENT_DATE, INTERVAL 13 DAY), INTERVAL n DAY), '%d') AS label,
              COALESCE((
                SELECT SUM(p.monto + COALESCE(p.propina, 0))
                FROM pago p
                WHERE DATE(p.fecha) = DATE_ADD(DATE_SUB(CURRENT_DATE, INTERVAL 13 DAY), INTERVAL n DAY)
              ), 0) AS actual,
              COALESCE((
                SELECT SUM(pa.monto + COALESCE(pa.propina, 0))
                FROM pago pa
                WHERE DATE(pa.fecha) = DATE_ADD(DATE_SUB(CURRENT_DATE, INTERVAL 27 DAY), INTERVAL n DAY)
              ), 0) AS anterior
            FROM offsets
            ORDER BY n
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def dashboard_top_platillos(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              pl.id_platillo,
              pl.nombre,
              c.nombre AS categoria,
              COALESCE(SUM(dp.cantidad), 0) AS cantidad
            FROM pedido pe
            INNER JOIN detalle_pedido dp ON dp.id_pedido = pe.id_pedido
            INNER JOIN platillo pl ON pl.id_platillo = dp.id_platillo
            LEFT JOIN categoria c ON c.id_categoria = pl.id_categoria
            WHERE DATE(pe.creado_en) = CURRENT_DATE
            GROUP BY pl.id_platillo, pl.nombre, c.nombre
            ORDER BY cantidad DESC, pl.nombre
            LIMIT 6
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def dashboard_mesas(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              m.id_mesa,
              m.numero,
              m.capacidad,
              m.estado,
              active.ticket,
              active.minutos_abierto,
              DATE_FORMAT(next_res.hora_reserva, '%H:%i') AS hora_reserva,
              next_res.num_personas AS guests_reserva
            FROM mesa m
            LEFT JOIN (
              SELECT
                id_mesa,
                SUM(total) AS ticket,
                TIMESTAMPDIFF(MINUTE, MIN(creado_en), NOW()) AS minutos_abierto
              FROM pedido
              WHERE estado IN ('creado', 'en_cocina', 'listo', 'entregado')
              GROUP BY id_mesa
            ) active ON active.id_mesa = m.id_mesa
            LEFT JOIN (
              SELECT r1.id_mesa, r1.hora_reserva, r1.num_personas
              FROM reserva r1
              INNER JOIN (
                SELECT id_mesa, MIN(hora_reserva) AS hora_reserva
                FROM reserva
                WHERE hora_reserva >= NOW()
                GROUP BY id_mesa
              ) r2
                ON r2.id_mesa = r1.id_mesa
               AND r2.hora_reserva = r1.hora_reserva
            ) next_res ON next_res.id_mesa = m.id_mesa
            ORDER BY m.numero
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def dashboard_actividad_reciente(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              events.tipo AS type,
              events.quien AS who,
              events.detalle AS what,
              DATE_FORMAT(events.fecha_evento, '%Y-%m-%dT%H:%i:%s') AS `when`,
              events.actor
            FROM (
              SELECT
                'order' AS tipo,
                CONCAT('Mesa ', COALESCE(m.numero, '?')) AS quien,
                CONCAT('pedido #', pe.id_pedido, ' · ', pe.estado) AS detalle,
                pe.creado_en AS fecha_evento,
                UPPER(LEFT(COALESCE(u.nombre, 'UT'), 2)) AS actor
              FROM pedido pe
              LEFT JOIN mesa m ON m.id_mesa = pe.id_mesa
              LEFT JOIN usuario u ON u.id_usuario = pe.id_usuario
              UNION ALL
              SELECT
                'pay' AS tipo,
                CONCAT('Pedido #', pa.id_pedido) AS quien,
                CONCAT('pago ', pa.metodo, ' · S/ ', FORMAT(pa.monto + COALESCE(pa.propina, 0), 2)) AS detalle,
                pa.fecha AS fecha_evento,
                'CA' AS actor
              FROM pago pa
              UNION ALL
              SELECT
                'reserve' AS tipo,
                'Reserva' AS quien,
                CONCAT(COALESCE(u.nombre, 'Cliente'), ' · ', r.num_personas, ' personas') AS detalle,
                r.hora_reserva AS fecha_evento,
                UPPER(LEFT(COALESCE(u.nombre, 'CL'), 2)) AS actor
              FROM reserva r
              LEFT JOIN usuario u ON u.id_usuario = r.id_usuario
            ) events
            ORDER BY events.fecha_evento DESC
            LIMIT 8
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def dashboard_pagos_por_tipo(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              grupos.name,
              grupos.sub,
              COALESCE(SUM(p.monto + COALESCE(p.propina, 0)), 0) AS amount
            FROM (
              SELECT 'Pagos Online' AS name, 'Tarjeta · transferencia' AS sub, 'tarjeta' AS metodo
              UNION ALL SELECT 'Pagos Online', 'Tarjeta · transferencia', 'yape'
              UNION ALL SELECT 'Pagos en Efectivo', 'Caja · efectivo', 'efectivo'
              UNION ALL SELECT 'Pagos Mixtos', 'Combinados', 'mixto'
            ) grupos
            LEFT JOIN pago p
              ON p.metodo = grupos.metodo
             AND DATE(p.fecha) = CURRENT_DATE
            GROUP BY grupos.name, grupos.sub
            ORDER BY FIELD(grupos.name, 'Pagos Online', 'Pagos en Efectivo', 'Pagos Mixtos')
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def dashboard_heatmap_pedidos(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              DATEDIFF(DATE(creado_en), DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)) AS dia,
              HOUR(creado_en) AS hora,
              COUNT(*) AS cantidad
            FROM pedido
            WHERE creado_en >= DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)
              AND creado_en < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)
            GROUP BY dia, hora
            ORDER BY dia, hora
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def dashboard_alertas(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              'warn' AS level,
              CONCAT('Stock bajo: ', nombre) AS title,
              CONCAT('Quedan ', FORMAT(stock, 2), ' ', COALESCE(unidad, '')) AS sub,
              FALSE AS accionable,
              NULL AS accion_url
            FROM insumo
            WHERE stock IS NOT NULL
              AND stock <= 5
            ORDER BY stock ASC, nombre
            LIMIT 3
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]
