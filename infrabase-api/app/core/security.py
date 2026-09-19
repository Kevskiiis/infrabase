from typing import Any
import logging

import httpx
from authlib.integrations.httpx_client import AsyncOAuth2Client
from authlib.jose import JsonWebKey, JsonWebToken

from app.core.config import get_settings
from app.features.entra_session_auth.models import AuthenticatedUser

logger = logging.getLogger(__name__)


class ProviderUnavailable(Exception):
    pass


class ProviderRejected(Exception):
    pass


async def discover() -> dict[str, Any]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(get_settings().discovery_url, timeout=10)
            response.raise_for_status()
            return response.json()
    except Exception as exc:
        raise ProviderUnavailable from exc


async def authorization_url(state: str) -> str:
    metadata = await discover()
    params = {"client_id": get_settings().entra_client_id, "response_type": "code", "redirect_uri": get_settings().entra_redirect_uri, "scope": "openid profile email", "state": state}
    from urllib.parse import urlencode
    return f"{metadata['authorization_endpoint']}?{urlencode(params)}"


async def exchange_code(code: str) -> dict[str, Any]:
    metadata = await discover()
    try:
        async with AsyncOAuth2Client(client_id=get_settings().entra_client_id, client_secret=get_settings().entra_client_secret, scope="openid profile email") as client:
            token = await client.fetch_token(metadata["token_endpoint"], code=code, redirect_uri=get_settings().entra_redirect_uri)
            return token
    except Exception as exc:
        logger.warning("Entra token exchange rejected: %s: %s", type(exc).__name__, str(exc))
        raise ProviderRejected from exc


async def validate_identity(token: dict[str, Any]) -> AuthenticatedUser:
    metadata = await discover()
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(metadata["jwks_uri"], timeout=10)
            response.raise_for_status()
            keys = JsonWebKey.import_key_set(response.json())
    except Exception as exc:
        raise ProviderUnavailable from exc

    try:
        jwt = JsonWebToken(["RS256", "RS384", "RS512"])
        claims = jwt.decode(token["id_token"], keys)
        claims.validate()
        if claims.get("iss") != get_settings().issuer or claims.get("aud") != get_settings().entra_client_id:
            raise ProviderRejected
        if claims.get("tid") != get_settings().entra_tenant_id or not claims.get("sub"):
            raise ProviderRejected
        return AuthenticatedUser(subject=claims["sub"], tenant_id=claims["tid"], email=claims.get("email") or claims.get("preferred_username"), name=claims.get("name"))
    except Exception as exc:
        if isinstance(exc, ProviderRejected):
            raise
        logger.warning("Entra identity validation rejected: %s: %s", type(exc).__name__, str(exc))
        raise ProviderRejected from exc
