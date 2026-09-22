from datetime import datetime, timedelta, timezone

import pytest

from app.core.errors import AuthError, error_payload
from app.core.session_store import SessionStore, SessionStoreUnavailable
from app.features.authentication.models import AuthenticatedUser
from app.features.authentication.redirects import safe_return_to
from app.features.authentication.session import create_session, read_session


def test_safe_return_paths_reject_external_and_malformed_values() -> None:
    assert safe_return_to("/servers?region=west#details") == "/servers?region=west#details"
    assert safe_return_to("https://evil.example") == "/"
    assert safe_return_to("//evil.example") == "/"
    assert safe_return_to("\\\\evil.example") == "/"
    assert safe_return_to(None) == "/"


def test_error_payload_contains_no_exception_details() -> None:
    payload = error_payload("AUTH_REJECTED", "Try again.")
    assert payload == {"error": "Authentication failed", "code": "AUTH_REJECTED", "detail": "Try again."}
    assert "secret" not in str(payload).lower()


@pytest.mark.asyncio
async def test_session_has_opaque_id_and_twelve_hour_ttl(fake_redis) -> None:
    store = SessionStore(fake_redis)
    session = await create_session(store, AuthenticatedUser(subject="sub", tenant_id="tenant"))
    assert len(session.session_id) >= 32
    assert fake_redis.ttls[f"infrabase:session:{session.session_id}"] == 43200
    assert await read_session(store, session.session_id) == session


@pytest.mark.asyncio
async def test_session_store_failures_are_explicit() -> None:
    class BrokenRedis:
        async def get(self, key):
            raise ConnectionError

    with pytest.raises(SessionStoreUnavailable):
        await SessionStore(BrokenRedis()).get_json("session")
