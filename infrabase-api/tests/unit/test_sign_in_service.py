import pytest

from app.core.errors import AuthError
from app.core.session_store import SessionStore
from app.features.entra_session_auth import service
from app.features.entra_session_auth.models import AuthenticatedUser


@pytest.mark.asyncio
async def test_flow_state_is_one_time_and_preserves_safe_destination(fake_redis) -> None:
    store = SessionStore(fake_redis)
    state = await service.create_flow_state(store, "/servers?filter=active")
    assert await service.consume_flow_state(store, state) == "/servers?filter=active"
    with pytest.raises(AuthError) as error:
        await service.consume_flow_state(store, state)
    assert error.value.code == "AUTH_STATE_INVALID"


@pytest.mark.asyncio
async def test_callback_rejection_does_not_create_session(fake_redis, monkeypatch) -> None:
    async def rejected(code):
        raise service.ProviderRejected

    monkeypatch.setattr(service, "exchange_code", rejected)
    store = SessionStore(fake_redis)
    state = await service.create_flow_state(store, "/protected")
    with pytest.raises(AuthError) as error:
        await service.complete_callback(store, "code", state)
    assert error.value.code == "AUTH_REJECTED"
    assert not any(key.startswith("infrabase:session:") for key in fake_redis.values)


@pytest.mark.asyncio
async def test_callback_success_creates_session(fake_redis, monkeypatch) -> None:
    async def exchange(code):
        return {"id_token": "opaque-test-token"}

    async def validate(token):
        return AuthenticatedUser(subject="sub", tenant_id="tenant")

    monkeypatch.setattr(service, "exchange_code", exchange)
    monkeypatch.setattr(service, "validate_identity", validate)
    store = SessionStore(fake_redis)
    state = await service.create_flow_state(store, "/protected")
    session, return_to = await service.complete_callback(store, "code", state)
    assert session.user.subject == "sub"
    assert return_to == "/protected"
