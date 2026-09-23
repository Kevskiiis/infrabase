from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AuthError(Exception):
    def __init__(self, code: str, detail: str, status_code: int = 401, error: str = "Authentication failed"):
        self.code = code
        self.detail = detail
        self.status_code = status_code
        self.error = error


def error_payload(code: str, detail: str, error: str = "Authentication failed") -> dict[str, str]:
    return {"error": error, "code": code, "detail": detail}


def auth_error_response(exc: AuthError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=error_payload(exc.code, exc.detail, exc.error))


async def auth_exception_handler(_: Request, exc: AuthError) -> JSONResponse:
    return auth_error_response(exc)


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=error_payload("INVALID_REQUEST", "The request could not be processed.", "Request failed"),
    )
