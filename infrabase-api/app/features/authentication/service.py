import secrets

from app.core.errors import AuthError
from app.core.security import ProviderRejected, ProviderUnavailable, exchange_code, validate_identity
from app.core.session_store import SessionStore, SessionStoreUnavailable
from app.features.authentication.models import AuthenticatedUser, BrowserSession
from app.features.authentication.redirects import safe_return_to
from app.features.authentication.session import create_session, invalidate_session


def state_key(state: str) -> str:
    return f"infrabase:oidc-state:{state}"


async def create_flow_state(store: SessionStore, return_to: str) -> str:
    state = secrets.token_urlsafe(32)
    await store.set_json(state_key(state), {"return_to": safe_return_to(return_to)}, 300)
    return state


async def consume_flow_state(store: SessionStore, state: str | None) -> str:
    if not state:
        raise AuthError("AUTH_STATE_INVALID", "The sign-in attempt is no longer valid. Try again.")
    try:
        value = await store.get_json(state_key(state))
        if not value:
            raise AuthError("AUTH_STATE_INVALID", "The sign-in attempt is no longer valid. Try again.")
        await store.delete(state_key(state))
        return safe_return_to(value.get("return_to"))
    except SessionStoreUnavailable as exc:
        raise AuthError("SESSION_STORE_UNAVAILABLE", "Authentication is temporarily unavailable. Try again.", 503) from exc


async def complete_callback(store: SessionStore, code: str | None, state: str | None) -> tuple[BrowserSession, str]:
    return_to = await consume_flow_state(store, state)
    if not code:
        raise AuthError("AUTH_REJECTED", "Sign-in was not completed. Try again.")
    try:
        token = await exchange_code(code)
        user: AuthenticatedUser = await validate_identity(token)
    except ProviderUnavailable as exc:
        raise AuthError("AUTH_PROVIDER_UNAVAILABLE", "The identity provider is temporarily unavailable. Try again.", 503) from exc
    except ProviderRejected as exc:
        raise AuthError("AUTH_REJECTED", "Sign-in was not completed. Try again.") from exc
    try:
        session = await create_session(store, user)
    except SessionStoreUnavailable as exc:
        raise AuthError("SESSION_STORE_UNAVAILABLE", "Authentication is temporarily unavailable. Try again.", 503) from exc
    return session, return_to


async def logout(store: SessionStore, session_id: str | None) -> None:
    try:
        await invalidate_session(store, session_id)
    except SessionStoreUnavailable as exc:
        raise AuthError("SESSION_STORE_UNAVAILABLE", "Sign-out is temporarily unavailable. Try again.", 503) from exc
