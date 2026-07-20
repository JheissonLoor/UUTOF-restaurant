import secrets
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.sucursal.infraestructura.schemas import NuevaSucursalRequest


async def listar_sucursales(
    session: AsyncSession,
    *,
    id_sucursal: int | None = None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT
              s.id_sucursal,
              s.nombre,
              s.direccion,
              s.color,
              COUNT(m.id_mesa) AS mesas,
              s.activa
            FROM sucursal s
            LEFT JOIN mesa m ON m.id_sucursal = s.id_sucursal
            WHERE (:id_sucursal IS NULL OR s.id_sucursal = :id_sucursal)
            GROUP BY s.id_sucursal, s.nombre, s.direccion, s.color, s.activa
            ORDER BY s.id_sucursal
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_sucursal(session: AsyncSession, id_sucursal: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT
              s.id_sucursal,
              s.nombre,
              s.direccion,
              s.color,
              COUNT(DISTINCT m.id_mesa) AS mesas,
              s.activa,
              COUNT(DISTINCT CASE WHEN m.estado = 'ocupada' THEN m.id_mesa END) AS mesas_ocupadas,
              COALESCE(SUM(CASE
                WHEN pa.estado = 'verificado' AND pa.fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                THEN pa.monto + COALESCE(pa.propina, 0) ELSE 0 END), 0) AS ingresos_semana,
              COUNT(DISTINCT CASE
                WHEN pe.creado_en >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN pe.id_pedido END
              ) AS pedidos_semana
            FROM sucursal s
            LEFT JOIN mesa m ON m.id_sucursal = s.id_sucursal
            LEFT JOIN pedido pe ON pe.id_mesa = m.id_mesa
            LEFT JOIN pago pa ON pa.id_pedido = pe.id_pedido
            WHERE s.id_sucursal = :id_sucursal
            GROUP BY s.id_sucursal, s.nombre, s.direccion, s.color, s.activa
            LIMIT 1
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    row = result.first()
    return dict(row._mapping) if row else None


async def existe_nombre(session: AsyncSession, nombre: str) -> bool:
    result = await session.execute(
        text("SELECT EXISTS(SELECT 1 FROM sucursal WHERE LOWER(nombre) = LOWER(:nombre))"),
        {"nombre": nombre},
    )
    return bool(result.scalar_one())


async def crear_sucursal(session: AsyncSession, data: NuevaSucursalRequest) -> int:
    await session.execute(
        text(
            """
            INSERT INTO sucursal (nombre, direccion, color, activa)
            VALUES (:nombre, :direccion, :color, TRUE)
            """
        ),
        data.model_dump(exclude={"mesas"}),
    )
    id_sucursal = int((await session.execute(text("SELECT LAST_INSERT_ID()"))).scalar_one())

    for numero in range(1, data.mesas + 1):
        await session.execute(
            text(
                """
                INSERT INTO mesa
                  (id_sucursal, id_mesero, numero, zona, capacidad, estado, qr_token, qr_codigo_corto)
                VALUES
                  (:id_sucursal, NULL, :numero, 'salon', 4, 'libre', :qr_token, :qr_codigo)
                """
            ),
            {
                "id_sucursal": id_sucursal,
                "numero": numero,
                "qr_token": secrets.token_hex(32),
                "qr_codigo": secrets.token_hex(5).upper(),
            },
        )
    await session.commit()
    return id_sucursal


async def comparar_sucursales(
    session: AsyncSession,
    *,
    id_sucursal: int | None = None,
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            WITH ventas AS (
              SELECT
                m.id_sucursal,
                COALESCE(SUM(pa.monto + COALESCE(pa.propina, 0)), 0) AS ingresos_semana,
                COALESCE(AVG(pa.monto + COALESCE(pa.propina, 0)), 0) AS ticket_promedio
              FROM mesa m
              LEFT JOIN pedido pe ON pe.id_mesa = m.id_mesa
              LEFT JOIN pago pa
                ON pa.id_pedido = pe.id_pedido
               AND pa.estado = 'verificado'
               AND pa.fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              GROUP BY m.id_sucursal
            ),
            opiniones AS (
              SELECT m.id_sucursal, AVG(r.calificacion) AS resenas_promedio
              FROM resena r
              INNER JOIN pedido pe ON pe.id_pedido = r.id_pedido
              INNER JOIN mesa m ON m.id_mesa = pe.id_mesa
              GROUP BY m.id_sucursal
            ),
            personal AS (
              SELECT id_sucursal, COUNT(*) AS empleados
              FROM usuario
              WHERE rol IN ('mesero', 'cocina', 'gerente_sucursal')
              GROUP BY id_sucursal
            )
            SELECT
              s.id_sucursal,
              s.nombre,
              s.color,
              COALESCE(v.ingresos_semana, 0) AS ingresos_semana,
              COALESCE(v.ticket_promedio, 0) AS ticket_promedio,
              ROUND(o.resenas_promedio, 1) AS resenas_promedio,
              COALESCE(p.empleados, 0) AS empleados,
              NULL AS margen_pct
            FROM sucursal s
            LEFT JOIN ventas v ON v.id_sucursal = s.id_sucursal
            LEFT JOIN opiniones o ON o.id_sucursal = s.id_sucursal
            LEFT JOIN personal p ON p.id_sucursal = s.id_sucursal
            WHERE s.activa = TRUE
              AND (:id_sucursal IS NULL OR s.id_sucursal = :id_sucursal)
            ORDER BY s.id_sucursal
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    return [dict(row._mapping) for row in result.all()]
