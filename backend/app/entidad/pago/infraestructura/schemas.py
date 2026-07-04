from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator


MetodoPago = Literal["efectivo", "tarjeta", "yape", "mixto"]


class PagoCreateRequest(BaseModel):
    id_pedido: int = Field(gt=0)
    metodo: MetodoPago
    monto: Decimal = Field(ge=0)
    propina: Decimal = Field(default=Decimal("0.00"), ge=0)
    recibido: Decimal | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validar_efectivo(self) -> "PagoCreateRequest":
        total = self.monto + self.propina
        if self.metodo == "efectivo" and self.recibido is None:
            raise ValueError("El pago en efectivo requiere monto recibido")
        if self.recibido is not None and self.recibido < total:
            raise ValueError("El monto recibido no cubre el total")
        return self


class PagoResponse(BaseModel):
    id_transaccion: int
    cambio: Decimal | None = None
    recibo: dict[str, object]
