from datetime import datetime, timedelta, timezone

import pytest

from app.core.errors import AuthError
from app.core.session_store import SessionStore, SessionStoreUnavailable
from app.features.authentication.dependencies import current_session
from app.features.authentication.models import AuthenticatedUser, BrowserSession
from app.features.authentication.session import session_key


@pytest.mark.asyncio
async def test_missing_session_is_auth_required(fake_redis) -> None:
    request = type("Request", (), {"cookies": {}, "app": type("App", (), {"state": type("State", (), {"settings": type("Settings", (), {"session_cookie_name": "session"})()})()})()})()
    with pytest.raises(AuthError, match="Sign-in") as error:
        await current_session(request, SessionStore(fake_redis))
    assert error.value.code == "AUTH_REQUIRED"


@pytest.mark.asyncio
async def test_redis_unavailability_fails_closed() -> None:
    class BrokenStore:
        async def get_json(self, key):
            raise SessionStoreUnavailable

    request = type("Request", (), {"cookies": {"session": "opaque"}, "app": type("App", (), {"state": type("State", (), {"settings": type("Settings", (), {"session_cookie_name": "session"})()})()})()})()
    with pytest.raises(AuthError) as error:
        await current_session(request, BrokenStore())
    assert error.value.code == "SESSION_STORE_UNAVAILABLE"
