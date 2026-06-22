from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from jose import JWTError, jwt
from pydantic_settings import BaseSettings, SettingsConfigDict


class TokenSettings(BaseSettings):
    jwt_secret: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = TokenSettings()


def encode(payload: dict[str, Any], expires_delta: timedelta) -> str:
    now = datetime.now(UTC)
    claims = payload.copy()
    claims.update(
        {
            "iat": now,
            "exp": now + expires_delta,
            "jti": str(uuid4()),
        }
    )
    return jwt.encode(claims, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def verify(token: str, token_type: str | None = None) -> dict[str, Any]:
    try:
        payload = decode(token)
    except JWTError as exc:
        raise ValueError("Token invalido") from exc

    if token_type and payload.get("typ") != token_type:
        raise ValueError("Tipo de token invalido")

    return payload


def crear_access_token(subject: str, email: str, rol: str) -> str:
    return encode(
        {"sub": subject, "email": email, "rol": rol, "typ": "access"},
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def crear_refresh_token(subject: str, email: str, rol: str) -> str:
    return encode(
        {"sub": subject, "email": email, "rol": rol, "typ": "refresh"},
        timedelta(days=settings.refresh_token_expire_days),
    )


def access_expires_in_seconds() -> int:
    return settings.access_token_expire_minutes * 60
