from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.resena.aplicacion.crear_resena import crear_resena
from app.entidad.resena.infraestructura.schemas import ResenaCreateRequest, ResenaPublica
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/resenas", tags=["Resenas"])


@router.post("", response_model=ResenaPublica, status_code=status.HTTP_201_CREATED)
async def post_resena(
    data: ResenaCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "admin")),
) -> ResenaPublica:
    return await crear_resena(session, data, actor)
