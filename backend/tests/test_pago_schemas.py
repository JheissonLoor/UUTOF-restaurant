import asyncio
from decimal import Decimal

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.entidad.pago.aplicacion.registrar_pago import registrar_pago
from app.entidad.pago.aplicacion.verificar_pago_efectivo import verificar_pago_efectivo
from app.entidad.pago.infraestructura import repo
from app.entidad.pago.infraestructura.schemas import PagoCreateRequest, PagoEfectivoVerificarRequest
from app.utilidad.realtime.infraestructura.manager import manager


def test_pago_efectivo_cliente_puede_quedar_pendiente() -> None:
    pago = PagoCreateRequest(
        id_pedido=1,
        metodo="efectivo",
        monto=Decimal("45.00"),
        propina=Decimal("5.00"),
    )

    assert pago.recibido is None


def test_pago_mixto_acepta_desglose_exacto() -> None:
    pago = PagoCreateRequest(
        id_pedido=1,
        metodo="mixto",
        monto=Decimal("45.00"),
        propina=Decimal("5.00"),
        desglose=[
            {"metodo": "yape", "monto": Decimal("20.00")},
            {"metodo": "tarjeta", "monto": Decimal("30.00")},
        ],
    )

    assert pago.desglose is not None
    assert sum((parte.monto for parte in pago.desglose), Decimal("0.00")) == Decimal("50.00")


def test_pago_mixto_rechaza_desglose_incompleto() -> None:
    with pytest.raises(ValidationError):
        PagoCreateRequest(
            id_pedido=1,
            metodo="mixto",
            monto=Decimal("45.00"),
            propina=Decimal("5.00"),
            desglose=[
                {"metodo": "yape", "monto": Decimal("20.00")},
                {"metodo": "tarjeta", "monto": Decimal("20.00")},
            ],
        )


def test_pago_rechaza_monto_distinto_al_pedido(monkeypatch: pytest.MonkeyPatch) -> None:
    async def obtener_pedido(_session: object, _id_pedido: int) -> dict[str, object]:
        return {
            "id_pedido": 1,
            "id_usuario": 21,
            "id_mesa": 4,
            "id_mesero": 2,
            "estado": "entregado",
            "total": Decimal("50.00"),
        }

    monkeypatch.setattr(repo, "obtener_pedido_pago", obtener_pedido)
    pago = PagoCreateRequest(id_pedido=1, metodo="yape", monto=Decimal("49.00"))

    with pytest.raises(HTTPException) as error:
        asyncio.run(registrar_pago(None, pago, {"sub": "21", "rol": "cliente"}))  # type: ignore[arg-type]

    assert error.value.status_code == 422


def test_pago_rechaza_pedido_aun_en_cocina(monkeypatch: pytest.MonkeyPatch) -> None:
    async def obtener_pedido(_session: object, _id_pedido: int) -> dict[str, object]:
        return {
            "id_pedido": 1,
            "id_usuario": 21,
            "id_mesa": 4,
            "id_mesero": 2,
            "estado": "en_cocina",
            "total": Decimal("50.00"),
        }

    monkeypatch.setattr(repo, "obtener_pedido_pago", obtener_pedido)
    pago = PagoCreateRequest(id_pedido=1, metodo="yape", monto=Decimal("50.00"))

    with pytest.raises(HTTPException) as error:
        asyncio.run(registrar_pago(None, pago, {"sub": "21", "rol": "cliente"}))  # type: ignore[arg-type]

    assert error.value.status_code == 409


def test_verificador_rechaza_monto_recibido_insuficiente(monkeypatch: pytest.MonkeyPatch) -> None:
    async def obtener_pago(_session: object, _id_transaccion: int) -> dict[str, object]:
        return {
            "id_transaccion": 8,
            "id_pedido": 10,
            "id_mesa": 4,
            "numero_mesa": 4,
            "id_mesero": 2,
            "metodo": "efectivo",
            "estado": "pendiente",
            "monto": Decimal("45.00"),
            "propina": Decimal("5.00"),
        }

    monkeypatch.setattr(repo, "obtener_pago_para_verificar", obtener_pago)
    request = PagoEfectivoVerificarRequest(recibido=Decimal("49.00"))

    with pytest.raises(HTTPException) as error:
        asyncio.run(verificar_pago_efectivo(None, 8, request, {"sub": "2", "rol": "mesero"}))  # type: ignore[arg-type]

    assert error.value.status_code == 422


def test_verificador_solo_puede_cobrar_sus_mesas(monkeypatch: pytest.MonkeyPatch) -> None:
    async def obtener_pago(_session: object, _id_transaccion: int) -> dict[str, object]:
        return {
            "id_transaccion": 8,
            "id_pedido": 10,
            "id_mesa": 4,
            "numero_mesa": 4,
            "id_mesero": 99,
            "metodo": "efectivo",
            "estado": "pendiente",
            "monto": Decimal("45.00"),
            "propina": Decimal("5.00"),
        }

    monkeypatch.setattr(repo, "obtener_pago_para_verificar", obtener_pago)
    request = PagoEfectivoVerificarRequest(recibido=Decimal("50.00"))

    with pytest.raises(HTTPException) as error:
        asyncio.run(verificar_pago_efectivo(None, 8, request, {"sub": "2", "rol": "mesero"}))  # type: ignore[arg-type]

    assert error.value.status_code == 403


def test_verificador_confirma_efectivo_y_calcula_cambio(monkeypatch: pytest.MonkeyPatch) -> None:
    async def obtener_pago(_session: object, _id_transaccion: int) -> dict[str, object]:
        return {
            "id_transaccion": 8,
            "id_pedido": 10,
            "id_mesa": 4,
            "numero_mesa": 4,
            "id_mesero": 2,
            "metodo": "efectivo",
            "estado": "pendiente",
            "monto": Decimal("45.00"),
            "propina": Decimal("5.00"),
        }

    async def confirmar_pago(_session: object, **kwargs: object) -> bool:
        assert kwargs["id_transaccion"] == 8
        assert kwargs["recibido"] == Decimal("60.00")
        assert kwargs["verificado_por"] == 2
        return True

    async def emitir_evento(event: dict[str, object]) -> None:
        assert event == {"tipo": "pago.verificado", "id_pedido": 10, "id_mesa": 4}

    monkeypatch.setattr(repo, "obtener_pago_para_verificar", obtener_pago)
    monkeypatch.setattr(repo, "verificar_pago_efectivo", confirmar_pago)
    monkeypatch.setattr(manager, "broadcast", emitir_evento)
    request = PagoEfectivoVerificarRequest(recibido=Decimal("60.00"))

    response = asyncio.run(verificar_pago_efectivo(None, 8, request, {"sub": "2", "rol": "mesero"}))  # type: ignore[arg-type]

    assert response.estado == "verificado"
    assert response.cambio == Decimal("10.00")
