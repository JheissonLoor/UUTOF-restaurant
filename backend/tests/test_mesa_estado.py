import asyncio

import pytest
from fastapi import HTTPException

from app.entidad.mesa.aplicacion.actualizar_estado_mesa import actualizar_estado_mesa
from app.entidad.mesa.infraestructura import repo
from app.entidad.mesa.infraestructura.schemas import MesaEstadoPatchRequest


def test_no_permite_liberar_mesa_con_pedido_pendiente(monkeypatch: pytest.MonkeyPatch) -> None:
    async def obtener_mesa_con_pedido(_session: object, _id_mesa: int) -> dict[str, object]:
        return {
            "id_mesa": 4,
            "numero": 4,
            "zona": "salon",
            "capacidad": 4,
            "estado": "ocupada",
            "pedido_activo": {"id_pedido": 10},
        }

    monkeypatch.setattr(repo, "obtener_mesa", obtener_mesa_con_pedido)

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            actualizar_estado_mesa(
                object(),
                4,
                MesaEstadoPatchRequest(estado="libre"),
            )
        )

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == "La mesa tiene un pedido pendiente de cierre"
