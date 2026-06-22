from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


def _row_to_dict(row: Any) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row._mapping)


async def listar_usuarios(
    session: AsyncSession,
    *,
    rol: str | None,
    limit: int,
    cursor: int | None,
) -> list[dict[str, Any]]:
    where_parts: list[str] = []
    params: dict[str, Any] = {"limit": limit + 1}

    if rol is not None:
        where_parts.append("rol = :rol")
        params["rol"] = rol

    if cursor is not None:
        where_parts.append("id_usuario > :cursor")
        params["cursor"] = cursor

    where_clause = f"WHERE {' AND '.join(where_parts)}" if where_parts else ""
    result = await session.execute(
        text(
            f"""
            SELECT id_usuario, nombre, email, telefono, rol, creado_en
            FROM usuario
            {where_clause}
            ORDER BY id_usuario
            LIMIT :limit
            """
        ),
        params,
    )
    return [dict(row._mapping) for row in result.all()]


async def crear_usuario(
    session: AsyncSession,
    *,
    nombre: str,
    email: str,
    telefono: str | None,
    password_hash: str,
    rol: str,
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO usuario (nombre, email, telefono, password_hash, rol)
            VALUES (:nombre, :email, :telefono, :password_hash, :rol)
            """
        ),
        {
            "nombre": nombre,
            "email": email,
            "telefono": telefono,
            "password_hash": password_hash,
            "rol": rol,
        },
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID() AS id_usuario"))
    id_usuario = int(result.scalar_one())
    await session.commit()

    usuario = await obtener_usuario(session, id_usuario)
    if usuario is None:
        raise RuntimeError("No se pudo recuperar el usuario creado")
    return usuario


async def obtener_usuario(session: AsyncSession, id_usuario: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT id_usuario, nombre, email, telefono, rol, creado_en
            FROM usuario
            WHERE id_usuario = :id_usuario
            LIMIT 1
            """
        ),
        {"id_usuario": id_usuario},
    )
    return _row_to_dict(result.first())


async def actualizar_usuario(
    session: AsyncSession,
    id_usuario: int,
    cambios: dict[str, Any],
) -> dict[str, Any] | None:
    allowed_columns = {
        "nombre": "nombre",
        "telefono": "telefono",
        "rol": "rol",
    }
    set_parts: list[str] = []
    params: dict[str, Any] = {"id_usuario": id_usuario}

    for field, column in allowed_columns.items():
        if field in cambios:
            set_parts.append(f"{column} = :{field}")
            params[field] = cambios[field]

    if not set_parts:
        return await obtener_usuario(session, id_usuario)

    await session.execute(
        text(
            f"""
            UPDATE usuario
            SET {", ".join(set_parts)}
            WHERE id_usuario = :id_usuario
            """
        ),
        params,
    )
    await session.commit()
    return await obtener_usuario(session, id_usuario)
