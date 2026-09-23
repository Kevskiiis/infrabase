import json
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from redis.asyncio import Redis

from app.core.config import get_settings


class SessionStoreUnavailable(Exception):
    pass


class SessionStore:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def set_json(self, key: str, value: dict, ttl: int) -> None:
        try:
            await self.redis.set(key, json.dumps(value), ex=ttl)
        except Exception as exc:
            raise SessionStoreUnavailable from exc

    async def get_json(self, key: str) -> dict | None:
        try:
            value = await self.redis.get(key)
        except Exception as exc:
            raise SessionStoreUnavailable from exc
        if value is None:
            return None
        if isinstance(value, bytes):
            value = value.decode("utf-8")
        try:
            return json.loads(value)
        except (TypeError, ValueError) as exc:
            raise SessionStoreUnavailable from exc

    async def delete(self, key: str) -> None:
        try:
            await self.redis.delete(key)
        except Exception as exc:
            raise SessionStoreUnavailable from exc


@asynccontextmanager
async def redis_lifespan() -> AsyncIterator[Redis]:
    redis = Redis.from_url(
        get_settings().redis_url,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
    )
    try:
        yield redis
    finally:
        await redis.aclose()
