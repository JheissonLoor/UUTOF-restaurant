from typing import Literal


RolUsuario = Literal[
    "cliente",
    "mesero",
    "cocina",
    "admin",
    "dueno",
    "gerente_sucursal",
]


ROLES_VALIDOS: set[str] = {
    "cliente",
    "mesero",
    "cocina",
    "admin",
    "dueno",
    "gerente_sucursal",
}


def puede_acceder_usuario(actor: dict, id_usuario: int) -> bool:
    return actor.get("rol") in {"admin", "dueno"} or str(actor.get("sub")) == str(id_usuario)


def validar_rol(rol: str) -> None:
    if rol not in ROLES_VALIDOS:
        raise ValueError("Rol invalido")
