from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator


MetodoPago = Literal["efectivo", "tarjeta", "yape", "mixto"]
MetodoPagoDigital = Literal["tarjeta", "yape"]


class PagoParteRequest(BaseModel):
    metodo: MetodoPagoDigital
    monto: Decimal = Field(gt=0)


class PagoCreateRequest(BaseModel):
    id_pedido: int = Field(gt=0)
    metodo: MetodoPago
    monto: Decimal = Field(ge=0)
    propina: Decimal = Field(default=Decimal("0.00"), ge=0)
    recibido: Decimal | None = Field(default=None, ge=0)
    desglose: list[PagoParteRequest] | None = Field(default=None, min_length=2, max_length=2)

    @model_validator(mode="after")
    def validar_pago(self) -> "PagoCreateRequest":
        total = self.monto + self.propina
        if self.recibido is not None and self.recibido < total:
            raise ValueError("El monto recibido no cubre el total")
        if self.metodo != "efectivo" and self.recibido is not None:
            raise ValueError("El monto recibido solo aplica a pagos en efectivo")
        if self.metodo == "mixto":
            if self.desglose is None:
                raise ValueError("El pago mixto requiere un desglose")
            if len({parte.metodo for parte in self.desglose}) != len(self.desglose):
                raise ValueError("El pago mixto no puede repetir metodos")
            if sum((parte.monto for parte in self.desglose), Decimal("0.00")) != total:
                raise ValueError("El desglose del pago mixto debe cubrir el total")
        elif self.desglose is not None:
            raise ValueError("El desglose solo aplica a pagos mixtos")
        return self


class PagoResponse(BaseModel):
    id_transaccion: int
    estado: Literal["pendiente", "verificado"]
    cambio: Decimal | None = None
    recibo: dict[str, object]
