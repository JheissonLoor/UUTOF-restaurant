from collections.abc import Callable
from typing import Any

from fastapi import Header, HTTPException, status

from app.utilidad.auth.dominio import token


def _bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header requerido",
        )

    scheme, _, value = authorization.partition(" ")
    if scheme.lower() != "bearer" or not value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization Bearer invalido",
        )
    return value


def requires(*roles: str) -> Callable[..., dict[str, Any]]:
    allowed_roles = set(roles)

    async def dependency(authorization: str | None = Header(default=None)) -> dict[str, Any]:
        raw_token = _bearer_token(authorization)
        try:
            payload = token.verify(raw_token, token_type="access")
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalido",
            ) from exc

        user_role = payload.get("rol")
        if allowed_roles and user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para acceder a este recurso",
            )

        return payload

    return dependency
