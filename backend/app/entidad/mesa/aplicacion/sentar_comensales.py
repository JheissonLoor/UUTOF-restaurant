from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.mesa.infraestructura import repo
from app.entidad.mesa.infraestructura.schemas import SentarComensalesRequest, SentarComensalesResponse


async def sentar_comensales(
    session: AsyncSession,
    id_mesa: int,
    data: SentarComensalesRequest,
    actor: dict,
) -> SentarComensalesResponse:
    if data.comensales < 1:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Debe haber al menos 1 comensal")

    mesa = await repo.obtener_mesa_base(session, id_mesa)
    if mesa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")

    if mesa["estado"] != "libre":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La mesa no esta libre")

    if data.comensales > int(mesa["capacidad"]):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Los comensales superan la capacidad")

    if actor["rol"] == "mesero":
        id_mesero = int(actor["sub"])
        mesa_mesero = mesa.get("id_mesero")
        if mesa_mesero is not None and int(mesa_mesero) != id_mesero:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La mesa no pertenece a tu turno")
    else:
        id_mesero = int(actor["sub"])

    id_pedido = await repo.crear_pedido_para_mesa(
        session,
        id_mesa=id_mesa,
        id_mesero=id_mesero,
        comensales=data.comensales,
    )
    return SentarComensalesResponse(id_pedido=id_pedido)
