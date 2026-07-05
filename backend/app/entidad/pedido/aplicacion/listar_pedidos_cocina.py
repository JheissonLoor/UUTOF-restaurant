from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.pedido.infraestructura import repo
from app.entidad.pedido.infraestructura.schemas import PedidoCocinaResponse


ESTADOS_COCINA = ("espera", "cocina", "listo", "entregado", "pagado")


def parse_estados(raw_estado: str | None) -> list[str]:
    if raw_estado is None or raw_estado.strip() == "":
        return list(ESTADOS_COCINA)

    estados = [estado.strip() for estado in raw_estado.split(",") if estado.strip()]
    invalidos = [estado for estado in estados if estado not in ESTADOS_COCINA]
    if invalidos:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Estado de cocina invalido: {', '.join(invalidos)}",
        )
    return estados


async def listar_pedidos_cocina(
    session: AsyncSession,
    estado: str | None,
) -> list[PedidoCocinaResponse]:
    estados = parse_estados(estado)
    pedidos = await repo.listar_pedidos_cocina(session, estados)
    return [PedidoCocinaResponse(**pedido) for pedido in pedidos]
