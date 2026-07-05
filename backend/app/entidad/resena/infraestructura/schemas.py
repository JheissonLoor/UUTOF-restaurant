from pydantic import BaseModel, Field


class ResenaCreateRequest(BaseModel):
    id_pedido: int = Field(gt=0)
    calificacion: int = Field(ge=1, le=5)
    comentario: str | None = Field(default=None, max_length=600)


class ResenaPublica(BaseModel):
    id_resena: int
    id_pedido: int
    calificacion: int
    comentario: str | None = None
