import pytest

from app.core.session_store import SessionStore
from app.features.authentication.service import logout
from app.features.authentication.session import session_key


@pytest.mark.asyncio
async def test_logout_is_idempotent(fake_redis) -> None:
    store = SessionStore(fake_redis)
    await logout(store, "missing-session")
    fake_redis.values[session_key("active")] = "{}"
    await logout(store, "active")
    await logout(store, "active")
    assert session_key("active") not in fake_redis.values
