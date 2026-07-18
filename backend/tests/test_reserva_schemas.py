from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
from pydantic import ValidationError

from app.entidad.reserva.infraestructura.schemas import ReservaCreateRequest


LIMA_TZ = ZoneInfo("America/Lima")


def test_reserva_rechaza_fecha_pasada() -> None:
    with pytest.raises(ValidationError):
        ReservaCreateRequest(
            id_mesa=1,
            hora_reserva=datetime.now(LIMA_TZ) - timedelta(minutes=1),
            num_personas=2,
        )


def test_reserva_normaliza_fecha_futura_a_hora_lima() -> None:
    reserva = ReservaCreateRequest(
        id_mesa=1,
        hora_reserva=datetime.now(ZoneInfo("UTC")) + timedelta(days=1),
        num_personas=2,
    )

    assert reserva.hora_reserva.tzinfo is None
    assert reserva.hora_reserva > datetime.now(LIMA_TZ).replace(tzinfo=None)
