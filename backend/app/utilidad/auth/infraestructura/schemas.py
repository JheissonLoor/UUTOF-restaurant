from pydantic import BaseModel, EmailStr, Field, field_validator

from app.utilidad.peru import normalizar_telefono_peru


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    nombre: str = Field(min_length=2, max_length=120)
    telefono: str | None = Field(default=None, max_length=20)

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, value: str | None) -> str | None:
        return normalizar_telefono_peru(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class UsuarioPublico(BaseModel):
    id_usuario: int
    nombre: str
    email: EmailStr | None
    rol: str
    telefono: str | None = None
    es_invitado: bool = False
    id_sucursal: int | None = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    usuario: UsuarioPublico


class RefreshResponse(TokenResponse):
    pass
