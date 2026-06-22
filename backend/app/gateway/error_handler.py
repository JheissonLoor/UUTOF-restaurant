from http import HTTPStatus
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def _title_for_status(status_code: int) -> str:
    try:
        return HTTPStatus(status_code).phrase
    except ValueError:
        return "Error"


def problem_response(
    request: Request,
    *,
    status_code: int,
    detail: Any,
    title: str | None = None,
    type_: str | None = None,
    extra: dict[str, Any] | None = None,
) -> JSONResponse:
    problem: dict[str, Any] = {
        "type": type_ or f"https://api.uttof.pe/problems/{status_code}",
        "title": title or _title_for_status(status_code),
        "status": status_code,
        "detail": detail if isinstance(detail, str) else "La solicitud no pudo procesarse",
        "instance": str(request.url.path),
    }
    if extra:
        problem.update(extra)

    return JSONResponse(
        status_code=status_code,
        content=problem,
        media_type="application/problem+json",
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return problem_response(
        request,
        status_code=exc.status_code,
        detail=exc.detail,
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return problem_response(
        request,
        status_code=422,
        detail="Error de validacion de entrada",
        title="Unprocessable Entity",
        extra={"errors": jsonable_encoder(exc.errors())},
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
