from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoPublico


async def listar_pedidos_propios(
    session: AsyncSession,
    actor: dict[str, Any],
) -> list[PedidoPublico]:
    pedidos = await repo.listar_pedidos_cliente(session, int(actor["sub"]))
    return [PedidoPublico(**pedido) for pedido in pedidos]
