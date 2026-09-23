import os
from collections.abc import AsyncIterator
from typing import Any

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("ENTRA_TENANT_ID", "test-tenant")
os.environ.setdefault("ENTRA_CLIENT_ID", "test-client")
os.environ.setdefault("ENTRA_CLIENT_SECRET", "test-secret")
os.environ.setdefault("ENTRA_REDIRECT_URI", "http://localhost:8000/auth/callback")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:5173")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")


class FakeRedis:
    def __init__(self) -> None:
        self.values: dict[str, str] = {}
        self.ttls: dict[str, int] = {}

    async def set(self, key: str, value: str, ex: int) -> bool:
        self.values[key] = value
        self.ttls[key] = ex
        return True

    async def get(self, key: str) -> str | None:
        return self.values.get(key)

    async def delete(self, key: str) -> int:
        existed = key in self.values
        self.values.pop(key, None)
        self.ttls.pop(key, None)
        return int(existed)

    async def aclose(self) -> None:
        return None


class FailingRedis(FakeRedis):
    async def get(self, key: str) -> str | None:
        raise ConnectionError("redis unavailable")


@pytest.fixture
def client() -> TestClient:
    from app.main import app

    return TestClient(app)


@pytest.fixture
def fake_redis() -> FakeRedis:
    return FakeRedis()