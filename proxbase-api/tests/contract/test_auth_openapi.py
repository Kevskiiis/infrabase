from app.main import app


def test_auth_operations_are_in_openapi() -> None:
    paths = app.openapi()["paths"]
    assert {"/auth/login", "/auth/callback", "/auth/session", "/auth/logout"}.issubset(paths)
    assert "AuthError" not in str(paths)
