import os

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.entidad.mesa.infraestructura import repo
from app.entidad.mesa.infraestructura.schemas import MesaQrResponse


async def obtener_qr_mesa(session: AsyncSession, id_mesa: int) -> MesaQrResponse:
    mesa = await repo.obtener_datos_qr(session, id_mesa)
    if mesa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesa no encontrada")
    base_url = os.getenv("PUBLIC_CLIENT_URL", "http://127.0.0.1:5176").rstrip("/")
    return MesaQrResponse(
        id_mesa=int(mesa["id_mesa"]),
        numero=int(mesa["numero"]),
        qr_url=f"{base_url}/mesa/{mesa['qr_token']}",
        codigo_corto=str(mesa["qr_codigo_corto"]),
    )
