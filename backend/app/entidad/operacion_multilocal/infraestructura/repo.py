from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def listar_menu(session: AsyncSession, *, id_sucursal: int | None) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT p.id_platillo,
                   ps.id_sucursal,
                   s.nombre AS sucursal,
                   s.color,
                   c.id_categoria,
                   c.nombre AS categoria,
                   p.nombre,
                   ps.precio,
                   ps.disponible,
                   p.imagen_url,
                   COALESCE(SUM(CASE WHEN DATE(pe.creado_en) = CURRENT_DATE THEN dp.cantidad ELSE 0 END), 0) AS vendidos_hoy
            FROM platillo_sucursal ps
            INNER JOIN platillo p ON p.id_platillo = ps.id_platillo
            INNER JOIN categoria c ON c.id_categoria = p.id_categoria
            INNER JOIN sucursal s ON s.id_sucursal = ps.id_sucursal
            LEFT JOIN mesa m ON m.id_sucursal = ps.id_sucursal
            LEFT JOIN pedido pe ON pe.id_mesa = m.id_mesa AND pe.estado <> 'cancelado'
            LEFT JOIN detalle_pedido dp ON dp.id_pedido = pe.id_pedido AND dp.id_platillo = p.id_platillo
            WHERE ps.activo = TRUE
              AND (:id_sucursal IS NULL OR ps.id_sucursal = :id_sucursal)
            GROUP BY p.id_platillo, ps.id_sucursal, s.nombre, s.color,
                     c.id_categoria, c.nombre, p.nombre, ps.precio, ps.disponible, p.imagen_url
            ORDER BY s.id_sucursal, c.orden, p.nombre
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_item(session: AsyncSession, *, id_platillo: int, id_sucursal: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT p.id_platillo, ps.id_sucursal, s.nombre AS sucursal, s.color,
                   c.id_categoria, c.nombre AS categoria, p.nombre, ps.precio,
                   ps.disponible, p.imagen_url, 0 AS vendidos_hoy
            FROM platillo_sucursal ps
            INNER JOIN platillo p ON p.id_platillo = ps.id_platillo
            INNER JOIN categoria c ON c.id_categoria = p.id_categoria
            INNER JOIN sucursal s ON s.id_sucursal = ps.id_sucursal
            WHERE ps.id_platillo = :id_platillo
              AND ps.id_sucursal = :id_sucursal
              AND ps.activo = TRUE
            LIMIT 1
            """
        ),
        {"id_platillo": id_platillo, "id_sucursal": id_sucursal},
    )
    row = result.first()
    return dict(row._mapping) if row else None


async def existe_sucursal(session: AsyncSession, id_sucursal: int) -> bool:
    result = await session.execute(text("SELECT 1 FROM sucursal WHERE id_sucursal = :id LIMIT 1"), {"id": id_sucursal})
    return result.first() is not None


async def existe_categoria(session: AsyncSession, id_categoria: int) -> bool:
    result = await session.execute(text("SELECT 1 FROM categoria WHERE id_categoria = :id LIMIT 1"), {"id": id_categoria})
    return result.first() is not None


async def crear_platillo(session: AsyncSession, data: dict[str, Any]) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO platillo (id_categoria, nombre, precio, disponible, imagen_url)
            VALUES (:id_categoria, :nombre, :precio, :disponible, :imagen_url)
            """
        ),
        data,
    )
    id_platillo = int((await session.execute(text("SELECT LAST_INSERT_ID()"))).scalar_one())
    await session.execute(
        text(
            """
            INSERT INTO platillo_sucursal (id_sucursal, id_platillo, precio, disponible, activo)
            VALUES (:id_sucursal, :id_platillo, :precio, :disponible, TRUE)
            """
        ),
        {**data, "id_platillo": id_platillo},
    )
    await session.commit()
    row = await obtener_item(session, id_platillo=id_platillo, id_sucursal=int(data["id_sucursal"]))
    if row is None:
        raise RuntimeError("No se pudo recuperar el platillo creado")
    return row


async def actualizar_platillo(
    session: AsyncSession,
    *,
    id_platillo: int,
    id_sucursal: int,
    cambios: dict[str, Any],
) -> dict[str, Any] | None:
    await session.execute(
        text(
            """
            UPDATE platillo_sucursal
            SET precio = COALESCE(:precio, precio),
                disponible = COALESCE(:disponible, disponible)
            WHERE id_platillo = :id_platillo
              AND id_sucursal = :id_sucursal
              AND activo = TRUE
            """
        ),
        {
            "id_platillo": id_platillo,
            "id_sucursal": id_sucursal,
            "precio": cambios.get("precio"),
            "disponible": cambios.get("disponible"),
        },
    )
    await session.commit()
    return await obtener_item(session, id_platillo=id_platillo, id_sucursal=id_sucursal)


async def retirar_platillo(session: AsyncSession, *, id_platillo: int, id_sucursal: int) -> bool:
    result = await session.execute(
        text(
            """
            UPDATE platillo_sucursal
            SET activo = FALSE, disponible = FALSE
            WHERE id_platillo = :id_platillo AND id_sucursal = :id_sucursal AND activo = TRUE
            """
        ),
        {"id_platillo": id_platillo, "id_sucursal": id_sucursal},
    )
    await session.commit()
    return bool(result.rowcount)


async def listar_empleados(session: AsyncSession, *, id_sucursal: int | None) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT u.id_usuario,
                   u.nombre,
                   u.email,
                   u.rol,
                   u.id_sucursal,
                   s.nombre AS sucursal,
                   s.color,
                   ROUND(COALESCE(SUM(CASE
                     WHEN pa.estado = 'verificado' AND DATE(pa.fecha) = CURRENT_DATE
                     THEN pa.monto ELSE 0 END), 0), 2) AS ventas_turno,
                   u.activo
            FROM usuario u
            INNER JOIN sucursal s ON s.id_sucursal = u.id_sucursal
            LEFT JOIN mesa m ON m.id_mesero = u.id_usuario AND m.id_sucursal = u.id_sucursal
            LEFT JOIN pedido p ON p.id_mesa = m.id_mesa
            LEFT JOIN pago pa ON pa.id_pedido = p.id_pedido
            WHERE u.rol IN ('mesero', 'cocina', 'gerente_sucursal')
              AND (:id_sucursal IS NULL OR u.id_sucursal = :id_sucursal)
            GROUP BY u.id_usuario, u.nombre, u.email, u.rol,
                     u.id_sucursal, s.nombre, s.color, u.activo
            ORDER BY s.id_sucursal, u.activo DESC, u.nombre
            """
        ),
        {"id_sucursal": id_sucursal},
    )
    return [dict(row._mapping) for row in result.all()]
