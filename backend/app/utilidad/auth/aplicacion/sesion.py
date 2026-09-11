from typing import Any

from app.utilidad.auth.dominio.usuario_auth import UsuarioAuth
from app.utilidad.auth.infraestructura.schemas import TokenResponse, UsuarioPublico


def crear_respuesta_sesion(usuario: dict[str, Any]) -> TokenResponse:
    es_invitado = bool(usuario.get("es_invitado", False))
    auth_service = UsuarioAuth()
    tokens = auth_service.generar_token(
        int(usuario["id_usuario"]),
        str(usuario["email"]),
        str(usuario["rol"]),
        es_invitado=es_invitado,
        id_sucursal=usuario.get("id_sucursal"),
    )
    return TokenResponse(
        **tokens,
        usuario=UsuarioPublico(
            id_usuario=int(usuario["id_usuario"]),
            nombre=str(usuario["nombre"]),
            email=None if es_invitado else str(usuario["email"]),
            telefono=usuario.get("telefono"),
            rol=str(usuario["rol"]),
            es_invitado=es_invitado,
            id_sucursal=usuario.get("id_sucursal"),
        ),
    )
