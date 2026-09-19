# Data Model: Microsoft Entra ID Session Authentication

## Authenticated User

The accepted Microsoft Entra identity used for protected platform access.

| Field | Rule |
|---|---|
| `subject` | Required stable Entra subject identifier; used as the identity key |
| `tenant_id` | Required and must match the configured tenant |
| `email` or display identity | Optional presentation data; never used as the sole identity key |
| validated claims | Retained only as needed for equal-access platform authorization |

The backend creates this entity only after validating the callback response and token signature/claims against Entra metadata and JWKS.

## Browser Session

A backend-owned association between an opaque browser cookie value and an Authenticated User.

| Field | Rule |
|---|---|
| `session_id` | Cryptographically random opaque identifier; never exposed in URLs, UI, logs, or API bodies |
| `user` | Reference to the validated Authenticated User data |
| `created_at` | Server-generated timestamp |
| `expires_at` | Absolute expiry no later than 12 hours after creation |
| `invalidated_at` | Optional server timestamp set on sign-out/revocation |

State transitions: `absent -> active` after successful callback; `active -> expired` at `expires_at`; `active -> invalidated` on sign-out. Expired or invalidated sessions are denied and cannot be renewed without authentication.

The cookie is HttpOnly, Secure, and SameSite=Lax. The client cannot read or manufacture a usable session credential.

## Protected Destination

An internal path representing the resource requested before authentication.

Validation rules:

- Must be a well-formed internal path accepted by the platform allowlist.
- Must not contain an external scheme, host, protocol-relative prefix, or malformed encoding.
- May be preserved through missing-session and expired-session redirects.
- Invalid values resolve to the unauthenticated entry point.

## Authentication Failure

A user-facing outcome represented by the standard API error contract:

```json
{"error": "Authentication failed", "code": "AUTH_REJECTED", "detail": "Sign-in was not completed. Try again."}
```

Codes distinguish provider rejection/cancellation, provider connectivity, session-store connectivity, backend connectivity, and expired/invalid session states. Details are safe summaries and never raw provider responses, tokens, claims, or session IDs.
