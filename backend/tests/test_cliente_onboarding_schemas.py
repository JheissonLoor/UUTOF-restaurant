from datetime import datetime, timedelta

import pytest
from pydantic import ValidationError

from app.entidad.reserva.aplicacion.presentacion import presentar_reserva
from app.entidad.usuario.infraestructura.schemas import PreferenciasClienteRequest
from app.utilidad.auth.infraestructura.schemas import RegisterRequest
from app.utilidad.peru import normalizar_telefono_peru


def test_normaliza_celular_peruano() -> None:
    assert normalizar_telefono_peru("999 000 111") == "+51999000111"
    assert normalizar_telefono_peru("+51 999 000 111") == "+51999000111"


def test_rechaza_telefono_no_peruano() -> None:
    with pytest.raises(ValueError):
        normalizar_telefono_peru("+52 5512345678")


def test_register_normaliza_telefono() -> None:
    request = RegisterRequest(
        email="cliente@uttof.pe",
        password="cliente123",
        nombre="Cliente UTTOF",
        telefono="999000111",
    )
    assert request.telefono == "+51999000111"


def test_preferencias_rechazan_cocinas_repetidas() -> None:
    with pytest.raises(ValidationError):
        PreferenciasClienteRequest(dieta="sin_restricciones", cocinas=["criolla", "criolla"])


def test_presentacion_reserva_agrega_folio_y_qr(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PUBLIC_CLIENT_URL", "https://app.uttof.pe")
    reserva = presentar_reserva(
        {
            "id_reserva": 9,
            "id_usuario": 4,
            "nombre_cliente": "Rosa Perez",
            "id_mesa": 3,
            "hora_reserva": datetime.now() + timedelta(days=1),
            "num_personas": 2,
            "notas_especiales": None,
            "estado": "confirmada",
            "qr_token": "a" * 64,
            "creado_en": datetime.now(),
        }
    )
    assert reserva.folio == "UTTOF-R-000009"
    assert reserva.qr_url == f"https://app.uttof.pe/reservas/{'a' * 64}"
