import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import get_settings
from app.core.session_store import SessionStore
from app.features.entra_session_auth.models import AuthenticatedUser, BrowserSession


def session_key(session_id: str) -> str:
    return f"infrabase:session:{session_id}"


def new_session_id() -> str:
    return secrets.token_urlsafe(32)


async def create_session(store: SessionStore, user: AuthenticatedUser) -> BrowserSession:
    now = datetime.now(timezone.utc)
    session = BrowserSession(
        session_id=new_session_id(),
        user=user,
        created_at=now,
        expires_at=now + timedelta(seconds=get_settings().session_ttl_seconds),
    )
    await store.set_json(session_key(session.session_id), session.model_dump(mode="json"), get_settings().session_ttl_seconds)
    return session


async def read_session(store: SessionStore, session_id: str | None) -> BrowserSession | None:
    if not session_id:
        return None
    value = await store.get_json(session_key(session_id))
    if not value:
        return None
    session = BrowserSession.model_validate(value)
    if session.expires_at <= datetime.now(timezone.utc):
        await store.delete(session_key(session_id))
        return None
    return session


async def invalidate_session(store: SessionStore, session_id: str | None) -> None:
    if session_id:
        await store.delete(session_key(session_id))
