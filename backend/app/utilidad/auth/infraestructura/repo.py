from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


def _row_to_dict(row: Any) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row._mapping)


async def obtener_por_email(session: AsyncSession, email: str) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT id_usuario, nombre, email, password_hash, telefono, rol, es_invitado,
                   expira_en, id_sucursal, activo
            FROM usuario
            WHERE email = :email
            LIMIT 1
            """
        ),
        {"email": email},
    )
    return _row_to_dict(result.first())


async def obtener_por_id(session: AsyncSession, id_usuario: int) -> dict[str, Any] | None:
    result = await session.execute(
        text(
            """
            SELECT id_usuario, nombre, email, password_hash, telefono, rol, es_invitado,
                   expira_en, id_sucursal, activo
            FROM usuario
            WHERE id_usuario = :id_usuario
            LIMIT 1
            """
        ),
        {"id_usuario": id_usuario},
    )
    return _row_to_dict(result.first())


async def crear_usuario_cliente(
    session: AsyncSession,
    *,
    email: str,
    password_hash: str,
    nombre: str,
    telefono: str | None,
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO usuario (email, password_hash, nombre, telefono, rol)
            VALUES (:email, :password_hash, :nombre, :telefono, 'cliente')
            """
        ),
        {
            "email": email,
            "password_hash": password_hash,
            "nombre": nombre,
            "telefono": telefono,
        },
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID() AS id_usuario"))
    id_usuario = int(result.scalar_one())
    await session.commit()

    usuario = await obtener_por_id(session, id_usuario)
    if usuario is None:
        raise RuntimeError("No se pudo recuperar el usuario creado")
    return usuario


async def crear_usuario_invitado(
    session: AsyncSession,
    *,
    email: str,
    password_hash: str,
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO usuario
              (nombre, email, password_hash, telefono, rol, es_invitado, expira_en)
            VALUES
              ('Invitado UTTOF', :email, :password_hash, NULL, 'cliente', TRUE,
               TIMESTAMPADD(DAY, 7, NOW()))
            """
        ),
        {"email": email, "password_hash": password_hash},
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID()"))
    id_usuario = int(result.scalar_one())
    await session.commit()
    usuario = await obtener_por_id(session, id_usuario)
    if usuario is None:
        raise RuntimeError("No se pudo recuperar la sesion invitada")
    return usuario


async def convertir_invitado(
    session: AsyncSession,
    *,
    id_usuario: int,
    nombre: str,
    email: str,
    password_hash: str,
    telefono: str | None,
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            UPDATE usuario
            SET nombre = :nombre,
                email = :email,
                password_hash = :password_hash,
                telefono = :telefono,
                es_invitado = FALSE,
                expira_en = NULL
            WHERE id_usuario = :id_usuario
              AND es_invitado = TRUE
            """
        ),
        {
            "id_usuario": id_usuario,
            "nombre": nombre,
            "email": email,
            "password_hash": password_hash,
            "telefono": telefono,
        },
    )
    await session.commit()
    usuario = await obtener_por_id(session, id_usuario)
    if usuario is None:
        raise RuntimeError("No se pudo recuperar el usuario convertido")
    return usuario
