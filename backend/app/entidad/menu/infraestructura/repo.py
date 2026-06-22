from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


def _row_to_dict(row: Any) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row._mapping)


async def listar_categorias(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT id_categoria, nombre, orden
            FROM categoria
            ORDER BY orden, id_categoria
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_categoria(session: AsyncSession, id_categoria: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT id_categoria, nombre, orden
            FROM categoria
            WHERE id_categoria = :id_categoria
            LIMIT 1
            """
        ),
        {"id_categoria": id_categoria},
    )
    return _row_to_dict(result.first())


async def listar_platillos(
    session: AsyncSession,
    *,
    categoria_id: int | None,
    limit: int,
    cursor: int | None,
) -> list[dict[str, Any]]:
    where_parts: list[str] = []
    params: dict[str, Any] = {"limit": limit}

    if categoria_id is not None:
        where_parts.append("id_categoria = :categoria_id")
        params["categoria_id"] = categoria_id

    if cursor is not None:
        where_parts.append("id_platillo > :cursor")
        params["cursor"] = cursor

    where_sql = f"WHERE {' AND '.join(where_parts)}" if where_parts else ""
    result = await session.execute(
        text(
            f"""
            SELECT id_platillo, id_categoria, nombre, precio, disponible, imagen_url
            FROM platillo
            {where_sql}
            ORDER BY id_platillo
            LIMIT :limit
            """
        ),
        params,
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_platillo(session: AsyncSession, id_platillo: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT id_platillo, id_categoria, nombre, precio, disponible, imagen_url
            FROM platillo
            WHERE id_platillo = :id_platillo
            LIMIT 1
            """
        ),
        {"id_platillo": id_platillo},
    )
    return _row_to_dict(result.first())


async def crear_platillo(
    session: AsyncSession,
    data: dict[str, Any],
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO platillo (id_categoria, nombre, precio, disponible, imagen_url)
            VALUES (:id_categoria, :nombre, :precio, :disponible, :imagen_url)
            """
        ),
        data,
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID() AS id_platillo"))
    id_platillo = int(result.scalar_one())
    await session.commit()
    platillo = await obtener_platillo(session, id_platillo)
    if platillo is None:
        raise RuntimeError("No se pudo recuperar el platillo creado")
    return platillo


async def actualizar_platillo(
    session: AsyncSession,
    id_platillo: int,
    cambios: dict[str, Any],
) -> dict[str, Any] | None:
    allowed_columns = {
        "id_categoria": "id_categoria",
        "nombre": "nombre",
        "precio": "precio",
        "disponible": "disponible",
        "imagen_url": "imagen_url",
    }
    set_parts: list[str] = []
    params: dict[str, Any] = {"id_platillo": id_platillo}

    for field, column in allowed_columns.items():
        if field in cambios:
            set_parts.append(f"{column} = :{field}")
            params[field] = cambios[field]

    if not set_parts:
        return await obtener_platillo(session, id_platillo)

    await session.execute(
        text(
            f"""
            UPDATE platillo
            SET {", ".join(set_parts)}
            WHERE id_platillo = :id_platillo
            """
        ),
        params,
    )
    await session.commit()
    return await obtener_platillo(session, id_platillo)
