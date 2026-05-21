from pydantic import BaseModel, EmailStr

from app.usuarios.schema import UsuarioCreate, UsuarioOut


class LoginInput(BaseModel):
    email: EmailStr
    contrasena: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterInput(UsuarioCreate):
    pass


class RegisterOut(UsuarioOut):
    pass
