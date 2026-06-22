from passlib.context import CryptContext
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.utilidad.auth.dominio import token


class AuthSettings(BaseSettings):
    bcrypt_cost: int = 12

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class UsuarioAuth:
    def __init__(self) -> None:
        settings = AuthSettings()
        self._pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=settings.bcrypt_cost,
        )

    def hash_password(self, password: str) -> str:
        return self._pwd_context.hash(password)

    def validar_password(self, password: str, password_hash: str) -> bool:
        return self._pwd_context.verify(password, password_hash)

    def generar_token(self, id_usuario: int, email: str, rol: str) -> dict[str, str | int]:
        subject = str(id_usuario)
        return {
            "access_token": token.crear_access_token(subject, email, rol),
            "refresh_token": token.crear_refresh_token(subject, email, rol),
            "expires_in": token.access_expires_in_seconds(),
        }
