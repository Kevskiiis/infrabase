from fastapi.testclient import TestClient

from app.features.entra_session_auth import router
from app.features.entra_session_auth.dependencies import get_session_store
from app.core.session_store import SessionStore


def test_login_rejects_unsafe_destination_without_open_redirect(fake_redis, monkeypatch) -> None:
    async def auth_url(state: str) -> str:
        return f"https://login.example/authorize?state={state}"

    monkeypatch.setattr(router, "authorization_url", auth_url)
    from app.main import app

    app.dependency_overrides[get_session_store] = lambda: SessionStore(fake_redis)
    try:
        with TestClient(app) as client:
            response = client.get("/auth/login?return_to=https://evil.example", follow_redirects=False)
        assert response.status_code == 302
        assert response.headers["location"].startswith("https://login.example/authorize")
        assert "evil.example" not in response.headers["location"]
    finally:
        app.dependency_overrides.clear()
