from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.menu.aplicacion.actualizar_platillo import actualizar_platillo
from app.entidad.menu.aplicacion.crear_platillo import crear_platillo
from app.entidad.menu.aplicacion.listar_categorias import listar_categorias
from app.entidad.menu.aplicacion.listar_platillos import listar_platillos
from app.entidad.menu.infraestructura.schemas import (
    CategoriaPublica,
    PlatilloCreateRequest,
    PlatilloPatchRequest,
    PlatilloPublico,
    PlatillosPage,
)
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/menu", tags=["Menu"])


@router.get("/categorias", response_model=list[CategoriaPublica])
async def get_categorias(session: AsyncSession = Depends(get_session)) -> list[CategoriaPublica]:
    return await listar_categorias(session)


@router.get("/platillos", response_model=PlatillosPage)
async def get_platillos(
    categoria_id: int | None = Query(default=None, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    cursor: int | None = Query(default=None, ge=0),
    session: AsyncSession = Depends(get_session),
) -> PlatillosPage:
    return await listar_platillos(session, categoria_id=categoria_id, limit=limit, cursor=cursor)


@router.post("/platillos", response_model=PlatilloPublico, status_code=status.HTTP_201_CREATED)
async def post_platillo(
    data: PlatilloCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin")),
) -> PlatilloPublico:
    return await crear_platillo(session, data)


@router.patch("/platillos/{id}", response_model=PlatilloPublico)
async def patch_platillo(
    id: int,
    data: PlatilloPatchRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("admin")),
) -> PlatilloPublico:
    return await actualizar_platillo(session, id, data)
