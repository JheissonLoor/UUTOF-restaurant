from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def crear_resena(
    session: AsyncSession,
    *,
    id_usuario: int,
    id_pedido: int,
    calificacion: int,
    comentario: str | None,
) -> dict[str, Any]:
    await session.execute(
        text(
            """
            INSERT INTO resena (id_usuario, id_pedido, calificacion, comentario)
            VALUES (:id_usuario, :id_pedido, :calificacion, :comentario)
            """
        ),
        {
            "id_usuario": id_usuario,
            "id_pedido": id_pedido,
            "calificacion": calificacion,
            "comentario": comentario,
        },
    )
    result = await session.execute(text("SELECT LAST_INSERT_ID()"))
    id_resena = int(result.scalar_one())
    await session.commit()
    return {
        "id_resena": id_resena,
        "id_pedido": id_pedido,
        "calificacion": calificacion,
        "comentario": comentario,
    }
