from typing import Literal

from decimal import Decimal

from pydantic import BaseModel, Field


class PedidoItemPublico(BaseModel):
    id_detalle: int
    id_platillo: int
    nombre: str
    qty: int
    price: float
    nota: str | None
    curso: str
    estado_item: Literal["en_cocina", "ready", "delivered"]


class PedidoPublico(BaseModel):
    id_pedido: int
    id_mesa: int
    estado: Literal["creado", "en_cocina", "listo", "entregado", "pagado", "cancelado"]
    comensales: int
    total: float
    items: list[PedidoItemPublico]


class PedidoItemCreateRequest(BaseModel):
    id_platillo: int = Field(gt=0)
    qty: int = Field(gt=0, le=50)
    nota: str | None = Field(default=None, max_length=300)
    modificadores: dict[str, str] | None = None


class PedidoItemsCreateRequest(BaseModel):
    items: list[PedidoItemCreateRequest] = Field(min_length=1, max_length=30)


class PedidoCreateRequest(PedidoItemsCreateRequest):
    id_mesa: int = Field(gt=0)


class PedidoCreateResponse(BaseModel):
    id_pedido: int
    estado: Literal["creado", "en_cocina", "listo", "entregado", "pagado", "cancelado"]
    total: float
    folio: str


class CuentaResponse(BaseModel):
    folio: str
    qr_url: str
    total: Decimal


EstadoPedidoCocina = Literal["espera", "cocina", "listo", "entregado", "pagado"]
TransicionPedidoCocina = Literal["empezarPreparacion", "marcarTerminado", "marcarListo", "entregarMesa", "entregar"]


class PedidoCocinaItem(BaseModel):
    id_detalle: int | None = None
    qty: int
    nombre: str
    nota: str | None = None
    modificadores: list[str] = Field(default_factory=list)
    alergenos: list[str] = Field(default_factory=list)
    estado_item: Literal["en_cocina", "ready", "delivered"] = "en_cocina"
    listo: bool = False


class PedidoCocinaResponse(BaseModel):
    id_pedido: int
    num: int | None = None
    id_mesa: int | None = None
    cliente: str
    mesa: int
    origen: Literal["app_cliente", "mesero"] = "mesero"
    mesero: str = "Cocina"
    estado: EstadoPedidoCocina
    creado_en: str | None = None
    minutos: int
    elapsed_seg: int = 0
    target_seg: int = 1080
    pausado: bool = False
    total: float
    items: list[PedidoCocinaItem]


class PedidoEstadoUpdateRequest(BaseModel):
    transicion: TransicionPedidoCocina


class PedidoItemEstadoUpdateRequest(BaseModel):
    listo: bool


class PedidoPausaRequest(BaseModel):
    pausado: bool


class PedidoInsumoReportRequest(BaseModel):
    id_detalle: int = Field(gt=0)
    nota: str = Field(min_length=3, max_length=500)
