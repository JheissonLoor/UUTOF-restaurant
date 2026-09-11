import asyncio
import secrets
from decimal import Decimal

from passlib.context import CryptContext
from sqlalchemy import text

from app.db.client import AsyncSessionLocal


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        email_migrations = [
            ("admin@uttof.mx", "admin@uttof.pe"),
            ("mesero@uttof.mx", "mesero@uttof.pe"),
            ("cocina@uttof.mx", "cocina@uttof.pe"),
            ("cliente@uttof.mx", "cliente@uttof.pe"),
        ]
        for old_email, new_email in email_migrations:
            await session.execute(
                text(
                    """
                    UPDATE usuario
                    SET email = :new_email
                    WHERE email = :old_email
                    """
                ),
                {"old_email": old_email, "new_email": new_email},
            )

        users = [
            ("Administrador UTTOF", "admin@uttof.pe", "admin123", "admin", None),
            ("Dueno UTTOF", "dueno@uttof.pe", "dueno123", "dueno", None),
            ("Gerente Miraflores", "gerente.miraflores@uttof.pe", "gerente123", "gerente_sucursal", 1),
            ("Gerente Barranco", "gerente.barranco@uttof.pe", "gerente123", "gerente_sucursal", 2),
            ("Gerente San Isidro", "gerente.sanisidro@uttof.pe", "gerente123", "gerente_sucursal", 3),
            ("Mesero Miraflores", "mesero@uttof.pe", "mesero123", "mesero", 1),
            ("Cocina Miraflores", "cocina@uttof.pe", "cocina123", "cocina", 1),
            ("Mesero Barranco", "mesero.barranco@uttof.pe", "mesero123", "mesero", 2),
            ("Cocina Barranco", "cocina.barranco@uttof.pe", "cocina123", "cocina", 2),
            ("Mesero San Isidro", "mesero.sanisidro@uttof.pe", "mesero123", "mesero", 3),
            ("Cocina San Isidro", "cocina.sanisidro@uttof.pe", "cocina123", "cocina", 3),
            ("Cliente UTTOF", "cliente@uttof.pe", "cliente123", "cliente", None),
        ]
        for nombre, email, password, rol, id_sucursal in users:
            await session.execute(
                text(
                    """
                    INSERT INTO usuario (nombre, email, password_hash, rol, id_sucursal, activo)
                    VALUES (:nombre, :email, :password_hash, :rol, :id_sucursal, TRUE)
                    ON DUPLICATE KEY UPDATE
                      nombre = VALUES(nombre),
                      password_hash = VALUES(password_hash),
                      rol = VALUES(rol),
                      id_sucursal = VALUES(id_sucursal),
                      activo = TRUE
                    """
                ),
                {
                    "nombre": nombre,
                    "email": email,
                    "password_hash": hash_password(password),
                    "rol": rol,
                    "id_sucursal": id_sucursal,
                },
            )

        categorias = [
            (1, "Entradas", 1),
            (2, "Platos de fondo", 2),
            (3, "Postres", 3),
        ]
        for id_categoria, nombre, orden in categorias:
            await session.execute(
                text(
                    """
                    INSERT INTO categoria (id_categoria, nombre, orden)
                    VALUES (:id_categoria, :nombre, :orden)
                    ON DUPLICATE KEY UPDATE
                      nombre = VALUES(nombre),
                      orden = VALUES(orden)
                    """
                ),
                {"id_categoria": id_categoria, "nombre": nombre, "orden": orden},
            )

        platillos = [
            (1, 1, "Causa limeña", Decimal("18.00"), True, None),
            (2, 1, "Papa a la huancaína", Decimal("16.00"), True, None),
            (3, 1, "Anticuchos", Decimal("22.00"), True, None),
            (4, 2, "Lomo saltado UTTOF", Decimal("42.00"), True, None),
            (5, 2, "Ají de gallina", Decimal("34.00"), True, None),
            (6, 2, "Arroz con mariscos", Decimal("39.00"), True, None),
            (7, 3, "Suspiro a la limeña", Decimal("18.00"), True, None),
            (8, 3, "Mazamorra morada", Decimal("14.00"), True, None),
        ]
        for id_platillo, id_categoria, nombre, precio, disponible, imagen_url in platillos:
            await session.execute(
                text(
                    """
                    INSERT INTO platillo
                      (id_platillo, id_categoria, nombre, precio, disponible, imagen_url)
                    VALUES
                      (:id_platillo, :id_categoria, :nombre, :precio, :disponible, :imagen_url)
                    ON DUPLICATE KEY UPDATE
                      id_categoria = VALUES(id_categoria),
                      nombre = VALUES(nombre),
                      precio = VALUES(precio),
                      disponible = VALUES(disponible),
                      imagen_url = VALUES(imagen_url)
                    """
                ),
                {
                    "id_platillo": id_platillo,
                    "id_categoria": id_categoria,
                    "nombre": nombre,
                    "precio": precio,
                    "disponible": disponible,
                    "imagen_url": imagen_url,
                },
            )

        meseros_result = await session.execute(
            text(
                """
                SELECT id_usuario, id_sucursal
                FROM usuario
                WHERE email IN (
                  'mesero@uttof.pe',
                  'mesero.barranco@uttof.pe',
                  'mesero.sanisidro@uttof.pe'
                )
                """
            )
        )
        mesero_id_by_sucursal = {
            int(row.id_sucursal): int(row.id_usuario)
            for row in meseros_result.all()
        }

        mesas = [
            (1, 1, 4, "terraza", "ocupada", mesero_id_by_sucursal[1]),
            (1, 2, 2, "terraza", "lista", mesero_id_by_sucursal[1]),
            (1, 3, 6, "salon", "ocupada", mesero_id_by_sucursal[1]),
            (2, 4, 4, "salon", "libre", mesero_id_by_sucursal[2]),
            (2, 5, 2, "barra", "ocupada", mesero_id_by_sucursal[2]),
            (2, 6, 4, "salon", "libre", mesero_id_by_sucursal[2]),
            (3, 7, 8, "privado", "libre", mesero_id_by_sucursal[3]),
            (3, 8, 10, "salon", "limpieza", mesero_id_by_sucursal[3]),
        ]
        for id_sucursal, numero, capacidad, zona, estado, id_mesero in mesas:
            await session.execute(
                text(
                    """
                    INSERT INTO mesa
                      (id_sucursal, numero, capacidad, zona, estado, id_mesero, qr_token, qr_codigo_corto)
                    VALUES
                      (:id_sucursal, :numero, :capacidad, :zona, :estado, :id_mesero, :qr_token, :qr_codigo_corto)
                    ON DUPLICATE KEY UPDATE
                      capacidad = VALUES(capacidad),
                      zona = VALUES(zona),
                      estado = VALUES(estado),
                      id_mesero = VALUES(id_mesero)
                    """
                ),
                {
                    "id_sucursal": id_sucursal,
                    "numero": numero,
                    "capacidad": capacidad,
                    "zona": zona,
                    "estado": estado,
                    "id_mesero": id_mesero,
                    "qr_token": secrets.token_hex(32),
                    "qr_codigo_corto": secrets.token_hex(6).upper(),
                },
            )

        mesa_rows = await session.execute(text("SELECT id_mesa, numero FROM mesa"))
        mesa_id_by_numero = {int(row.numero): int(row.id_mesa) for row in mesa_rows.all()}

        pedidos_demo = [
            {
                "mesa": 1,
                "estado": "en_cocina",
                "comensales": 4,
                "minutos": 50,
                "items": [
                    (1, 2, Decimal("36.00"), "Sin aji para 1", "Entrada", "delivered"),
                    (4, 2, Decimal("84.00"), "Termino medio; 1 sin cebolla", "Plato fuerte", "en_cocina"),
                    (6, 1, Decimal("39.00"), None, "Plato fuerte", "en_cocina"),
                ],
            },
            {
                "mesa": 2,
                "estado": "listo",
                "comensales": 2,
                "minutos": 15,
                "items": [
                    (5, 1, Decimal("34.00"), None, "Plato fuerte", "ready"),
                    (1, 1, Decimal("18.00"), None, "Entrada", "delivered"),
                ],
            },
            {
                "mesa": 3,
                "estado": "en_cocina",
                "comensales": 5,
                "minutos": 38,
                "items": [
                    (4, 2, Decimal("84.00"), None, "Plato fuerte", "en_cocina"),
                    (6, 2, Decimal("78.00"), None, "Plato fuerte", "delivered"),
                    (7, 2, Decimal("36.00"), None, "Postre", "en_cocina"),
                ],
            },
            {
                "mesa": 5,
                "estado": "en_cocina",
                "comensales": 2,
                "minutos": 5,
                "items": [
                    (3, 1, Decimal("22.00"), None, "Entrada", "en_cocina"),
                    (1, 2, Decimal("36.00"), None, "Entrada", "en_cocina"),
                ],
            },
        ]

        for pedido_demo in pedidos_demo:
            id_mesa = mesa_id_by_numero[pedido_demo["mesa"]]
            id_sucursal = 1 if pedido_demo["mesa"] <= 3 else 2 if pedido_demo["mesa"] <= 6 else 3
            mesero_id = mesero_id_by_sucursal[id_sucursal]
            pedido_result = await session.execute(
                text(
                    """
                    SELECT id_pedido
                    FROM pedido
                    WHERE id_mesa = :id_mesa
                      AND estado IN ('creado', 'en_cocina', 'listo', 'entregado')
                    ORDER BY id_pedido DESC
                    LIMIT 1
                    """
                ),
                {"id_mesa": id_mesa},
            )
            id_pedido = pedido_result.scalar_one_or_none()
            total = sum((item[2] for item in pedido_demo["items"]), Decimal("0.00"))

            if id_pedido is None:
                await session.execute(
                    text(
                        """
                        INSERT INTO pedido
                          (id_usuario, id_mesa, comensales, estado, total, creado_en)
                        VALUES
                          (:id_usuario, :id_mesa, :comensales, :estado, :total,
                           TIMESTAMPADD(MINUTE, -:minutos, NOW()))
                        """
                    ),
                    {
                        "id_usuario": mesero_id,
                        "id_mesa": id_mesa,
                        "comensales": pedido_demo["comensales"],
                        "estado": pedido_demo["estado"],
                        "total": total,
                        "minutos": pedido_demo["minutos"],
                    },
                )
                id_result = await session.execute(text("SELECT LAST_INSERT_ID()"))
                id_pedido = int(id_result.scalar_one())
            else:
                id_pedido = int(id_pedido)
                await session.execute(
                    text(
                        """
                        UPDATE pedido
                        SET id_usuario = :id_usuario,
                            comensales = :comensales,
                            estado = :estado,
                            total = :total,
                            creado_en = TIMESTAMPADD(MINUTE, -:minutos, NOW())
                        WHERE id_pedido = :id_pedido
                        """
                    ),
                    {
                        "id_usuario": mesero_id,
                        "comensales": pedido_demo["comensales"],
                        "estado": pedido_demo["estado"],
                        "total": total,
                        "minutos": pedido_demo["minutos"],
                        "id_pedido": id_pedido,
                    },
                )
                await session.execute(
                    text("DELETE FROM detalle_pedido WHERE id_pedido = :id_pedido"),
                    {"id_pedido": id_pedido},
                )

            for id_platillo, cantidad, subtotal, notas, curso, estado_item in pedido_demo["items"]:
                await session.execute(
                    text(
                        """
                        INSERT INTO detalle_pedido
                          (id_pedido, id_platillo, cantidad, subtotal, notas, curso, estado_item)
                        VALUES
                          (:id_pedido, :id_platillo, :cantidad, :subtotal, :notas, :curso, :estado_item)
                        """
                    ),
                    {
                        "id_pedido": id_pedido,
                        "id_platillo": id_platillo,
                        "cantidad": cantidad,
                        "subtotal": subtotal,
                        "notas": notas,
                        "curso": curso,
                        "estado_item": estado_item,
                    },
                )

        await session.execute(
            text(
                """
                UPDATE mesa m
                INNER JOIN pedido p
                  ON p.id_pedido = (
                    SELECT p2.id_pedido
                    FROM pedido p2
                    WHERE p2.id_mesa = m.id_mesa
                      AND p2.estado IN ('creado', 'en_cocina', 'listo', 'entregado')
                    ORDER BY p2.creado_en DESC, p2.id_pedido DESC
                    LIMIT 1
                  )
                SET m.estado = CASE
                  WHEN p.estado = 'listo' THEN 'lista'
                  ELSE 'ocupada'
                END
                """
            )
        )

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
