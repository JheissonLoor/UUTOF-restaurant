from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.entidad.pago.aplicacion.registrar_pago import registrar_pago
from app.entidad.pago.infraestructura.schemas import PagoCreateRequest, PagoResponse
from app.utilidad.rbac.infraestructura.deps import requires


router = APIRouter(prefix="/v1/pagos", tags=["Pagos"])


@router.post("", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
async def post_pago(
    data: PagoCreateRequest,
    session: AsyncSession = Depends(get_session),
    actor: dict = Depends(requires("cliente", "mesero", "admin")),
) -> PagoResponse:
    return await registrar_pago(session, data, actor)
