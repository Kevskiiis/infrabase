from collections.abc import Mapping
from typing import Any

_SENSITIVE_KEYS = frozenset({"authorization", "access_token", "id_token", "client_secret", "session_id", "cookie", "set-cookie", "code", "state"})


def redact_auth_fields(values: Mapping[str, Any]) -> dict[str, Any]:
    """Return log-safe fields without tokens, cookies, callback codes, or session ids."""
    return {key: "[REDACTED]" if key.lower() in _SENSITIVE_KEYS else value for key, value in values.items()}
