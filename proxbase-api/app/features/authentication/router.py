from urllib.parse import urlencode
import logging

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, RedirectResponse, Response

from app.core.config import get_settings
from app.core.errors import AuthError
from app.core.security import ProviderUnavailable, authorization_url
from app.core.session_store import SessionStore, SessionStoreUnavailable
from app.features.authentication.dependencies import current_session, get_session_store
from app.features.authentication.models import SessionStatus
from app.features.authentication.redirects import safe_return_to
from app.features.authentication.service import complete_callback, create_flow_state, logout

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


def cookie_kwargs() -> dict[str, object]:
    settings = get_settings()
    return {"key": settings.session_cookie_name, "httponly": True, "secure": settings.cookie_secure, "samesite": "lax", "max_age": settings.session_ttl_seconds, "path": "/"}


def auth_error_redirect(code: str, detail: str) -> RedirectResponse:
    query = urlencode({"auth_error": code, "auth_error_detail": detail})
    return RedirectResponse(f"{get_settings().frontend_origin}/?{query}", status_code=302)


@router.get("/login")
async def login(request: Request, return_to: str = "/", store: SessionStore = Depends(get_session_store)) -> Response:
    try:
        state = await create_flow_state(store, safe_return_to(return_to))
        return RedirectResponse(await authorization_url(state), status_code=302)
    except SessionStoreUnavailable:
        return auth_error_redirect("SESSION_STORE_UNAVAILABLE", "Authentication is temporarily unavailable. Try again.")
    except ProviderUnavailable:
        return auth_error_redirect("AUTH_PROVIDER_UNAVAILABLE", "The identity provider is temporarily unavailable. Try again.")


@router.get("/callback")
async def callback(request: Request, code: str | None = None, state: str | None = None, error: str | None = None, error_description: str | None = None, store: SessionStore = Depends(get_session_store)) -> Response:
    if error:
        logger.warning("Entra callback rejected: error=%s description=%s", error, error_description or "none")
        raise AuthError("AUTH_REJECTED", "Sign-in was not completed. Try again.")
    session, return_to = await complete_callback(store, code, state)
    return_path = safe_return_to(return_to)
    frontend_url = f"{get_settings().frontend_origin.rstrip('/')}{return_path}"
    response = RedirectResponse(frontend_url, status_code=302)
    response.set_cookie(value=session.session_id, **cookie_kwargs())
    return response


@router.get("/session", response_model=SessionStatus)
async def session_status(request: Request, store: SessionStore = Depends(get_session_store)) -> SessionStatus:
    session = await current_session(request, store)
    return SessionStatus(authenticated=True, user=session.user)


@router.post("/logout")
async def sign_out(request: Request, store: SessionStore = Depends(get_session_store)) -> JSONResponse:
    await logout(store, request.cookies.get(get_settings().session_cookie_name))
    response = JSONResponse({"authenticated": False})
    response.delete_cookie(get_settings().session_cookie_name, path="/")
    return response


@router.get("/protected")
async def protected(session=Depends(current_session)) -> dict[str, object]:
    return {"message": "Protected content", "user": session.user.model_dump()}
