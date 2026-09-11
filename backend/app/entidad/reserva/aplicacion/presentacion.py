import os
from typing import Any

from app.entidad.reserva.infraestructura.schemas import ReservaPublica


def presentar_reserva(reserva: dict[str, Any]) -> ReservaPublica:
    id_reserva = int(reserva["id_reserva"])
    base_url = os.getenv("PUBLIC_CLIENT_URL", "http://127.0.0.1:5176").rstrip("/")
    return ReservaPublica(
        **reserva,
        folio=f"UTTOF-R-{id_reserva:06d}",
        qr_url=f"{base_url}/reservas/{reserva['qr_token']}",
    )
