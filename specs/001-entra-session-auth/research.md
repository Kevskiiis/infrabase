# Research: Microsoft Entra ID Session Authentication

## Decision: Backend-owned OIDC authorization-code flow

**Decision**: The browser starts sign-in through a backend `/auth/login` endpoint. The backend owns the callback, exchanges the authorization code, validates the Entra identity against the tenant's issuer, audience, signature, expiry, and JWKS, then creates the platform session.

**Rationale**: This keeps Entra tokens and client secrets out of the browser and matches the constitution's backend-owned-session principle. It also gives every protected entry point one consistent authentication boundary.

**Alternatives considered**: A browser MSAL flow was rejected because it would expose a client token surface and require the client to translate Entra state into a backend session. Local username/password authentication is explicitly out of scope.

## Decision: Redis session ID cookie

**Decision**: Store a cryptographically random opaque session ID in Redis, with the authenticated user identity and an absolute 12-hour expiry. Send only the opaque ID in an HttpOnly, Secure, SameSite=Lax cookie.

**Rationale**: Redis is the repository's mandated session store. Opaque server-side sessions allow revocation and cross-tab sign-out without issuing a platform identity token.

**Alternatives considered**: Stateless JWT platform sessions were rejected because they complicate immediate revocation and conflict with the backend-owned session requirement. Persistent remember-me cookies are out of scope.

## Decision: Safe internal return paths

**Decision**: Preserve only an internal path and query/fragment representation accepted by the backend's allowlist. Reject absolute URLs, protocol-relative URLs, malformed values, and external hosts; use the unauthenticated entry point as the fallback.

**Rationale**: This preserves interrupted work while preventing open redirects and credential leakage through unsafe return parameters. The same rule applies after missing and expired sessions.

**Alternatives considered**: Accepting an arbitrary callback URL was rejected for security reasons. Always returning to the home page was rejected because it loses the user's requested destination.

## Decision: Failure classification and API contract

**Decision**: Use the fixed `{error, code, detail}` API shape. Distinguish user/provider rejection from Entra connectivity failure, Redis/session-store failure, and client-to-backend connectivity failure with safe codes and user-facing recovery text. Never include tokens, claims, session IDs, or secrets.

**Rationale**: Stable codes let the client render an actionable state without parsing text, while fail-closed behavior prevents outages from becoming accidental access grants.

**Alternatives considered**: Plain text and raw provider errors were rejected because they are inconsistent and may disclose sensitive data. Treating all failures as successful sign-in was rejected because it creates false authenticated state.

## Decision: Test isolation

**Decision**: Unit and integration tests mock Entra discovery/token/JWKS calls and Redis. Browser E2E tests exercise the real user-facing redirect and callback shape using controlled test doubles; no test uses production credentials or uncontrolled external calls.

**Rationale**: This satisfies the constitution's test pyramid and external-service isolation requirements while still validating the complete browser workflow.

**Alternatives considered**: Calling live Entra or Redis from unit/integration tests was rejected because it is nondeterministic and violates the constitution.

## Dependency note

A maintained OIDC/JWT library is required for authorization-code exchange and cryptographic JWKS validation. The implementation must obtain explicit approval for that dependency before changing `requirements.txt`; hand-rolled JWT verification is not an acceptable fallback. The frontend should use the existing browser APIs and backend redirects unless a router/client dependency is separately approved.
