from fastapi import Depends, Request

from app.core.errors import AuthError
from app.core.session_store import SessionStore, SessionStoreUnavailable
from app.features.authentication.models import BrowserSession
from app.features.authentication.session import read_session


def get_session_store(request: Request) -> SessionStore:
    return request.app.state.session_store


async def current_session(request: Request, store: SessionStore = Depends(get_session_store)) -> BrowserSession:
    try:
        session = await read_session(store, request.cookies.get(request.app.state.settings.session_cookie_name))
    except SessionStoreUnavailable as exc:
        raise AuthError("SESSION_STORE_UNAVAILABLE", "Authentication is temporarily unavailable. Try again.", 503) from exc
    if not session:
        raise AuthError("AUTH_REQUIRED", "Sign-in is required to access this resource.")
    return session
