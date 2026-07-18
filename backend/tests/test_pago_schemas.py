import asyncio
from decimal import Decimal

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.entidad.pago.aplicacion.registrar_pago import registrar_pago
from app.entidad.pago.infraestructura import repo
from app.entidad.pago.infraestructura.schemas import PagoCreateRequest


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
