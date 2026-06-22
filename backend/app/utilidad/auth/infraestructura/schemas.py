from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    nombre: str = Field(min_length=2, max_length=120)
    telefono: str | None = Field(default=None, max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class UsuarioPublico(BaseModel):
    id_usuario: int
    nombre: str
    email: EmailStr
    rol: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    usuario: UsuarioPublico


class RefreshResponse(TokenResponse):
    pass
