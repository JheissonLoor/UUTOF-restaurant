from typing import Literal

from pydantic import BaseModel, Field


class RestauranteConfig(BaseModel):
    nombre_comercial: str = Field(min_length=2, max_length=120)
    ruc: str = Field(pattern=r"^\d{11}$")
    direccion: str = Field(min_length=3, max_length=180)
    telefono: str = Field(min_length=7, max_length=32)
    email: str = Field(min_length=5, max_length=120)
    timezone: Literal["America/Lima"]
    moneda: Literal["PEN"]
    igv_pct: float = Field(ge=0, le=100)
    horario_apertura: str = Field(pattern=r"^\d{2}:\d{2}$")
    horario_cierre: str = Field(pattern=r"^\d{2}:\d{2}$")


class PagosConfig(BaseModel):
    acepta_efectivo: bool
    acepta_tarjeta: bool
    acepta_yape: bool
    yape_numero: str = Field(min_length=0, max_length=32)
    pos_proveedor: str = Field(min_length=0, max_length=80)
    propina_sugerida_pct: float = Field(ge=0, le=30)
    comprobante_default: Literal["boleta", "factura"]


class NotificacionesConfig(BaseModel):
    email_admin: str = Field(min_length=5, max_length=120)
    email_reservas: bool
    alertas_stock_bajo: bool
    sonido_cocina: bool
    resumen_diario_email: bool


class SeguridadConfig(BaseModel):
    sesion_minutos: int = Field(ge=15, le=720)
    mfa_admin: bool
    intentos_login: int = Field(ge=3, le=10)
    bloqueo_minutos: int = Field(ge=5, le=120)
    rotacion_claves_dias: int = Field(ge=30, le=365)


class ConfiguracionResponse(BaseModel):
    restaurante: RestauranteConfig
    pagos: PagosConfig
    notificaciones: NotificacionesConfig
    seguridad: SeguridadConfig


class RestaurantePatch(BaseModel):
    nombre_comercial: str | None = Field(default=None, min_length=2, max_length=120)
    ruc: str | None = Field(default=None, pattern=r"^\d{11}$")
    direccion: str | None = Field(default=None, min_length=3, max_length=180)
    telefono: str | None = Field(default=None, min_length=7, max_length=32)
    email: str | None = Field(default=None, min_length=5, max_length=120)
    timezone: Literal["America/Lima"] | None = None
    moneda: Literal["PEN"] | None = None
    igv_pct: float | None = Field(default=None, ge=0, le=100)
    horario_apertura: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    horario_cierre: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")


class PagosPatch(BaseModel):
    acepta_efectivo: bool | None = None
    acepta_tarjeta: bool | None = None
    acepta_yape: bool | None = None
    yape_numero: str | None = Field(default=None, min_length=0, max_length=32)
    pos_proveedor: str | None = Field(default=None, min_length=0, max_length=80)
    propina_sugerida_pct: float | None = Field(default=None, ge=0, le=30)
    comprobante_default: Literal["boleta", "factura"] | None = None


class NotificacionesPatch(BaseModel):
    email_admin: str | None = Field(default=None, min_length=5, max_length=120)
    email_reservas: bool | None = None
    alertas_stock_bajo: bool | None = None
    sonido_cocina: bool | None = None
    resumen_diario_email: bool | None = None


class SeguridadPatch(BaseModel):
    sesion_minutos: int | None = Field(default=None, ge=15, le=720)
    mfa_admin: bool | None = None
    intentos_login: int | None = Field(default=None, ge=3, le=10)
    bloqueo_minutos: int | None = Field(default=None, ge=5, le=120)
    rotacion_claves_dias: int | None = Field(default=None, ge=30, le=365)


class ConfiguracionPatch(BaseModel):
    restaurante: RestaurantePatch | None = None
    pagos: PagosPatch | None = None
    notificaciones: NotificacionesPatch | None = None
    seguridad: SeguridadPatch | None = None
