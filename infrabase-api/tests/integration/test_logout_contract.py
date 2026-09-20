from fastapi.testclient import TestClient

from app.core.session_store import SessionStore
from app.features.entra_session_auth.dependencies import get_session_store
from app.features.entra_session_auth.models import AuthenticatedUser
from app.features.entra_session_auth.session import create_session, session_key


def test_logout_clears_cookie_and_is_repeatable(fake_redis) -> None:
    from app.main import app

    app.dependency_overrides[get_session_store] = lambda: SessionStore(fake_redis)
    try:
        with TestClient(app) as client:
            first = client.post("/auth/logout")
            second = client.post("/auth/logout")
        assert first.status_code == 200
        assert second.status_code == 200
        assert "infrabase_session" in first.headers.get("set-cookie", "")
    finally:
        app.dependency_overrides.clear()


def test_logout_deletes_the_backend_session(fake_redis) -> None:
    from app.main import app

    import asyncio
    session = asyncio.run(create_session(SessionStore(fake_redis), AuthenticatedUser(subject="sub", tenant_id="tenant")))
    app.dependency_overrides[get_session_store] = lambda: SessionStore(fake_redis)
    try:
        with TestClient(app) as client:
            client.cookies.set("infrabase_session", session.session_id)
            response = client.post("/auth/logout")
        assert response.status_code == 200
        assert session_key(session.session_id) not in fake_redis.values
    finally:
        app.dependency_overrides.clear()
