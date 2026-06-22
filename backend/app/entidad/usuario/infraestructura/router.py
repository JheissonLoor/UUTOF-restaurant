from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.usuario.aplicacion.actualizar_usuario import actualizar_usuario
from app.entidad.usuario.aplicacion.crear_usuario import crear_usuario
from app.entidad.usuario.aplicacion.listar_usuarios import listar_usuarios
from app.entidad.usuario.aplicacion.obtener_usuario import obtener_usuario
from app.entidad.usuario.infraestructura.schemas import (
    RolUsuario,
    UsuarioCreateRequest,
    UsuarioPatchRequest,
    UsuarioPublico,
    UsuariosPage,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/usuarios", tags=["Usuarios"])


@router.get("", response_model=UsuariosPage)
async def get_usuarios(
    rol: RolUsuario | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    cursor: int | None = Query(default=None, ge=0),
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin")),
) -> UsuariosPage:
    return await listar_usuarios(session, rol=rol, limit=limit, cursor=cursor)


@router.post("", response_model=UsuarioPublico, status_code=status.HTTP_201_CREATED)
async def post_usuario(
    data: UsuarioCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin")),
) -> UsuarioPublico:
    return await crear_usuario(session, data)


@router.get("/{id}", response_model=UsuarioPublico)
async def get_usuario(
    id: int,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires()),
) -> UsuarioPublico:
    return await obtener_usuario(session, id, actor)


@router.patch("/{id}", response_model=UsuarioPublico)
async def patch_usuario(
    id: int,
    data: UsuarioPatchRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires()),
) -> UsuarioPublico:
    return await actualizar_usuario(session, id, data, actor)
