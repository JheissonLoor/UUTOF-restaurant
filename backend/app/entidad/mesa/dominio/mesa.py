from typing import Literal


EstadoMesa = Literal["libre", "ocupada", "reservada", "lista", "limpieza"]


ESTADOS_MESA: set[str] = {"libre", "ocupada", "reservada", "lista", "limpieza"}


def validar_estado_mesa(estado: str) -> None:
    if estado not in ESTADOS_MESA:
        raise ValueError("Estado de mesa invalido")


def puede_hacer_checkin(estado_actual: str) -> bool:
    return estado_actual == "libre"
