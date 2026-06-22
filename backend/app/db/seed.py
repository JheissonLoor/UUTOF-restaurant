import asyncio
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
            ("Administrador UTTOF", "admin@uttof.pe", "admin123", "admin"),
            ("Mesero UTTOF", "mesero@uttof.pe", "mesero123", "mesero"),
            ("Cocina UTTOF", "cocina@uttof.pe", "cocina123", "cocina"),
        ]
        for nombre, email, password, rol in users:
            await session.execute(
                text(
                    """
                    INSERT INTO usuario (nombre, email, password_hash, rol)
                    VALUES (:nombre, :email, :password_hash, :rol)
                    ON DUPLICATE KEY UPDATE
                      nombre = VALUES(nombre),
                      password_hash = VALUES(password_hash),
                      rol = VALUES(rol)
                    """
                ),
                {
                    "nombre": nombre,
                    "email": email,
                    "password_hash": hash_password(password),
                    "rol": rol,
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

        mesero_result = await session.execute(
            text("SELECT id_usuario FROM usuario WHERE email = 'mesero@uttof.pe' LIMIT 1")
        )
        mesero_id = int(mesero_result.scalar_one())

        mesas = [
            (1, 4, "terraza", "ocupada", mesero_id),
            (2, 2, "terraza", "lista", mesero_id),
            (3, 6, "salon", "ocupada", mesero_id),
            (4, 4, "salon", "libre", mesero_id),
            (5, 2, "barra", "ocupada", mesero_id),
            (6, 4, "salon", "libre", mesero_id),
            (7, 8, "privado", "libre", None),
            (8, 10, "salon", "limpieza", None),
        ]
        for numero, capacidad, zona, estado, id_mesero in mesas:
            await session.execute(
                text(
                    """
                    INSERT INTO mesa (numero, capacidad, zona, estado, id_mesero)
                    VALUES (:numero, :capacidad, :zona, :estado, :id_mesero)
                    ON DUPLICATE KEY UPDATE
                      capacidad = VALUES(capacidad),
                      zona = VALUES(zona),
                      estado = VALUES(estado),
                      id_mesero = VALUES(id_mesero)
                    """
                ),
                {
                    "numero": numero,
                    "capacidad": capacidad,
                    "zona": zona,
                    "estado": estado,
                    "id_mesero": id_mesero,
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

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
