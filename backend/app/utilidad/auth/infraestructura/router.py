from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.client import get_session
from app.utilidad.auth.aplicacion.iniciar_sesion import iniciar_sesion
from app.utilidad.auth.aplicacion.refrescar_token import refrescar_token
from app.utilidad.auth.aplicacion.registrar_usuario import registrar_usuario
from app.utilidad.auth.infraestructura.schemas import (
    LoginRequest,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    TokenResponse,
    UsuarioPublico,
)


router = APIRouter(prefix="/v1/auth", tags=["Auth"])


@router.post("/register", response_model=UsuarioPublico, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_session)) -> UsuarioPublico:
    return await registrar_usuario(session, data)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    return await iniciar_sesion(session, data)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(data: RefreshRequest, session: AsyncSession = Depends(get_session)) -> RefreshResponse:
    return await refrescar_token(session, data)
