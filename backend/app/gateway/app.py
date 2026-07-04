from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.db.client import engine
from app.entidad.menu.infraestructura.router import router as menu_router
from app.entidad.mesa.infraestructura.router import router as mesa_router
from app.entidad.pago.infraestructura.router import router as pago_router
from app.entidad.pedido.infraestructura.router import router as pedido_router
from app.entidad.reserva.infraestructura.router import router as reserva_router
from app.entidad.usuario.infraestructura.router import router as usuario_router
from app.gateway.error_handler import register_exception_handlers
from app.tarea.reporte_flow.infraestructura.router import router as reporte_router
from app.utilidad.auth.infraestructura.router import router as auth_router
from app.utilidad.configuracion.infraestructura.router import router as configuracion_router
from app.utilidad.realtime.infraestructura.router import router as realtime_router


class AppSettings(BaseSettings):
    app_name: str = "UTTOF Restaurant API"
    app_version: str = "1.0"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    settings = AppSettings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(app)
    app.include_router(auth_router)
    app.include_router(usuario_router)
    app.include_router(mesa_router)
    app.include_router(pedido_router)
    app.include_router(pago_router)
    app.include_router(menu_router)
    app.include_router(reserva_router)
    app.include_router(reporte_router)
    app.include_router(configuracion_router)
    app.include_router(realtime_router)

    @app.get("/health")
    async def health() -> dict[str, bool | str]:
        return {"ok": True, "version": settings.app_version}

    return app
