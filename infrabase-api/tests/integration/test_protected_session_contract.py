from fastapi.testclient import TestClient

from app.core.session_store import SessionStore
from app.features.authentication.dependencies import get_session_store
from app.features.authentication.models import AuthenticatedUser
from app.features.authentication.session import create_session


def test_protected_request_requires_session(fake_redis) -> None:
    from app.main import app

    app.dependency_overrides[get_session_store] = lambda: SessionStore(fake_redis)
    try:
        with TestClient(app) as client:
            response = client.get("/auth/protected")
        assert response.status_code == 401
        assert response.json()["code"] == "AUTH_REQUIRED"
    finally:
        app.dependency_overrides.clear()


def test_session_endpoint_returns_safe_user(fake_redis) -> None:
    from app.main import app

    import asyncio
    session = asyncio.run(create_session(SessionStore(fake_redis), AuthenticatedUser(subject="sub", tenant_id="tenant", email="user@example.com")))
    app.dependency_overrides[get_session_store] = lambda: SessionStore(fake_redis)
    try:
        with TestClient(app) as client:
            client.cookies.set("infrabase_session", session.session_id)
            response = client.get("/auth/session")
        assert response.status_code == 200
        assert response.json()["user"]["subject"] == "sub"
        assert "session_id" not in response.text
    finally:
        app.dependency_overrides.clear()
