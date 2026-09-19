from fastapi.testclient import TestClient

from app.core.session_store import SessionStore
from app.features.entra_session_auth.dependencies import get_session_store


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
