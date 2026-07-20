from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def listar_integraciones(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT i.id_integracion AS id, i.nombre, i.categoria, i.descripcion, i.color,
                   COALESCE(e.conectado, FALSE) AS conectado, e.credencial_hint
            FROM integracion i
            LEFT JOIN integracion_estado e ON e.id_integracion = i.id_integracion
            WHERE i.activa = TRUE
            ORDER BY i.id_integracion
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def obtener_integracion(session: AsyncSession, id_integracion: int) -> dict[str, Any]:
    result = await session.execute(
        text(
            """
            SELECT i.id_integracion AS id, i.nombre, i.categoria, i.descripcion, i.color,
                   COALESCE(e.conectado, FALSE) AS conectado, e.credencial_hint
            FROM integracion i
            LEFT JOIN integracion_estado e ON e.id_integracion = i.id_integracion
            WHERE i.id_integracion = :id_integracion
            """
        ),
        {"id_integracion": id_integracion},
    )
    return dict(result.one()._mapping)


async def existe_integracion(session: AsyncSession, id_integracion: int) -> bool:
    result = await session.execute(
        text("SELECT 1 FROM integracion WHERE id_integracion = :id AND activa = TRUE LIMIT 1"),
        {"id": id_integracion},
    )
    return result.first() is not None


async def actualizar_integracion(
    session: AsyncSession,
    *,
    id_integracion: int,
    conectado: bool,
    credencial_hash: str | None,
    credencial_hint: str | None,
    id_usuario: int,
) -> None:
    await session.execute(
        text(
            """
            INSERT INTO integracion_estado
              (id_integracion, conectado, credencial_hash, credencial_hint, actualizado_por)
            VALUES
              (:id_integracion, :conectado, :credencial_hash, :credencial_hint, :id_usuario)
            ON DUPLICATE KEY UPDATE
              conectado = VALUES(conectado),
              credencial_hash = VALUES(credencial_hash),
              credencial_hint = VALUES(credencial_hint),
              actualizado_por = VALUES(actualizado_por)
            """
        ),
        {
            "id_integracion": id_integracion,
            "conectado": conectado,
            "credencial_hash": credencial_hash,
            "credencial_hint": credencial_hint,
            "id_usuario": id_usuario,
        },
    )
    await session.commit()


async def listar_api_keys(session: AsyncSession) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            SELECT id_api_key AS id, nombre,
                   CONCAT(token_prefix, '••••••••', token_ultimos4) AS token_mascara,
                   creada_en, ultimo_uso
            FROM api_key_cliente
            WHERE activa = TRUE
            ORDER BY creada_en DESC
            """
        )
    )
    return [dict(row._mapping) for row in result.all()]


async def crear_api_key(
    session: AsyncSession,
    *,
    nombre: str,
    token_hash: str,
    token_prefix: str,
    token_ultimos4: str,
    id_usuario: int,
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO api_key_cliente
              (nombre, token_hash, token_prefix, token_ultimos4, creada_por)
            VALUES
              (:nombre, :token_hash, :token_prefix, :token_ultimos4, :id_usuario)
            """
        ),
        {
            "nombre": nombre,
            "token_hash": token_hash,
            "token_prefix": token_prefix,
            "token_ultimos4": token_ultimos4,
            "id_usuario": id_usuario,
        },
    )
    id_api_key = int((await session.execute(text("SELECT LAST_INSERT_ID()"))).scalar_one())
    await session.commit()
    result = await session.execute(
        text(
            """
            SELECT id_api_key AS id, nombre,
                   CONCAT(token_prefix, '••••••••', token_ultimos4) AS token_mascara,
                   creada_en, ultimo_uso
            FROM api_key_cliente WHERE id_api_key = :id
            """
        ),
        {"id": id_api_key},
    )
    return dict(result.one()._mapping)


async def revocar_api_key(session: AsyncSession, id_api_key: int) -> bool:
    result = await session.execute(
        text("UPDATE api_key_cliente SET activa = FALSE WHERE id_api_key = :id AND activa = TRUE"),
        {"id": id_api_key},
    )
    await session.commit()
    return bool(result.rowcount)


async def obtener_marca(session: AsyncSession) -> dict[str, Any]:
    result = await session.execute(
        text("SELECT nombre_marca, logo_url, color_primario, subdominio FROM marca_config WHERE id_config = 1"),
    )
    return dict(result.one()._mapping)


async def guardar_marca(session: AsyncSession, data: dict[str, Any]) -> dict[str, Any]:
    await session.execute(
        text(
            """
            UPDATE marca_config
            SET nombre_marca = :nombre_marca,
                logo_url = :logo_url,
                color_primario = :color_primario,
                subdominio = :subdominio
            WHERE id_config = 1
            """
        ),
        data,
    )
    await session.commit()
    return await obtener_marca(session)


async def obtener_config_general(session: AsyncSession) -> dict[str, Any]:
    result = await session.execute(
        text(
            """
            SELECT nombre_comercial, ruc, email, telefono, direccion,
                   DATE_FORMAT(horario_apertura, '%H:%i') AS horario_apertura,
                   DATE_FORMAT(horario_cierre, '%H:%i') AS horario_cierre,
                   timezone
            FROM config_general_multilocal WHERE id_config = 1
            """
        )
    )
    return dict(result.one()._mapping)


async def guardar_config_general(session: AsyncSession, data: dict[str, Any]) -> dict[str, Any]:
    await session.execute(
        text(
            """
            UPDATE config_general_multilocal
            SET nombre_comercial = :nombre_comercial,
                ruc = :ruc,
                email = :email,
                telefono = :telefono,
                direccion = :direccion,
                horario_apertura = :horario_apertura,
                horario_cierre = :horario_cierre,
                timezone = :timezone
            WHERE id_config = 1
            """
        ),
        data,
    )
    await session.commit()
    return await obtener_config_general(session)


async def obtener_facturacion(session: AsyncSession) -> dict[str, Any]:
    result = await session.execute(
        text(
            """
            SELECT f.plan, f.precio_por_local,
                   (SELECT COUNT(*) FROM sucursal WHERE activa = TRUE) AS sucursales_facturadas,
                   f.metodo_pago, f.ultimos4,
                   DATE_FORMAT(f.proxima_factura, '%Y-%m-%d') AS proxima_factura
            FROM facturacion_config f WHERE f.id_config = 1
            """
        )
    )
    return dict(result.one()._mapping)
