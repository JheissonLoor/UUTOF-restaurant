from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    contrasena: str
    telefono: Optional[str] = None
    preferencias_notas: Optional[str] = None
    alergias: Optional[str] = None
    id_rol: int = 1


class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    email: str
    telefono: Optional[str] = None
    id_rol: int
    fecha_registro: datetime

    class Config:
        from_attributes = True
