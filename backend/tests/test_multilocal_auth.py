import asyncio

import pytest
from fastapi import HTTPException

from app.entidad.usuario.infraestructura.schemas import UsuarioPublico as UsuarioEntidad
from app.utilidad.auth.aplicacion.sesion import crear_respuesta_sesion
from app.utilidad.auth.dominio import token
from app.utilidad.rbac.infraestructura.deps import requires


def usuario_gerente() -> dict[str, object]:
    return {
        "id_usuario": 15,
        "nombre": "Gerente Miraflores",
        "email": "gerente.miraflores@uttof.pe",
        "telefono": "+51999999999",
        "rol": "gerente_sucursal",
        "es_invitado": False,
        "id_sucursal": 1,
    }


def test_sesion_multilocal_incluye_sucursal_en_usuario_y_jwt() -> None:
    response = crear_respuesta_sesion(usuario_gerente())

    assert response.usuario.id_sucursal == 1
    assert token.verify(response.access_token, token_type="access")["id_sucursal"] == 1
    assert token.verify(response.refresh_token, token_type="refresh")["id_sucursal"] == 1


def test_rbac_acepta_gerente_y_conserva_su_ambito() -> None:
    response = crear_respuesta_sesion(usuario_gerente())
    dependency = requires("admin", "dueno", "gerente_sucursal")

    actor = asyncio.run(dependency(f"Bearer {response.access_token}"))

    assert actor["rol"] == "gerente_sucursal"
    assert actor["id_sucursal"] == 1


def test_rbac_rechaza_rol_fuera_del_panel_multilocal() -> None:
    response = crear_respuesta_sesion({**usuario_gerente(), "rol": "mesero"})
    dependency = requires("admin", "dueno", "gerente_sucursal")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(dependency(f"Bearer {response.access_token}"))

    assert exc_info.value.status_code == 403


def test_usuario_entidad_admite_roles_multilocales() -> None:
    usuario = UsuarioEntidad(
        id_usuario=15,
        nombre="Gerente Miraflores",
        email="gerente.miraflores@uttof.pe",
        telefono="+51999999999",
        rol="gerente_sucursal",
        id_sucursal=1,
        creado_en="2026-07-20T10:00:00",
    )

    assert usuario.rol == "gerente_sucursal"
    assert usuario.id_sucursal == 1
