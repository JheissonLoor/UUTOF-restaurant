from typing import Literal


RolUsuario = Literal["cliente", "mesero", "cocina", "admin"]


ROLES_VALIDOS: set[str] = {"cliente", "mesero", "cocina", "admin"}


def puede_acceder_usuario(actor: dict, id_usuario: int) -> bool:
    return actor.get("rol") == "admin" or str(actor.get("sub")) == str(id_usuario)


def validar_rol(rol: str) -> None:
    if rol not in ROLES_VALIDOS:
        raise ValueError("Rol invalido")
