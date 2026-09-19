# Authentication API Contract

The backend owns the OIDC callback and browser session. All API errors use `{error, code, detail}` and never expose bearer tokens, claims, secrets, or session IDs.

## `GET /auth/login`

Starts sign-in. Accepts an optional safe internal return destination. Rejects unsafe values by replacing them with the unauthenticated entry point. Responds with a redirect to the configured Microsoft Entra authorization endpoint.

The return destination is held in a Redis-backed, one-time flow state with a short expiry; it must not be trusted merely because it was supplied by the browser. Missing, expired, or replayed state is rejected without creating a session.

## `GET /auth/callback`

Consumes the provider authorization response. On success, validates the returned identity and JWKS signature, creates the Redis session, sets the opaque session cookie, and redirects to the validated internal destination.

Failure behavior:

- Provider rejection or cancellation: no session; safe retryable `AUTH_REJECTED` outcome.
- Entra unavailable during exchange or JWKS validation: no session; distinct `AUTH_PROVIDER_UNAVAILABLE` outcome.
- Invalid state, code, issuer, audience, signature, or expiry: no session; safe authentication failure.

Authentication failures use the structured `{error, code, detail}` body with an appropriate HTTP status when the caller is using the API directly. Browser redirect flows surface only the safe failure code through the client error entry point; provider details, tokens, claims, and session identifiers are never returned.

## `GET /auth/session`

Returns the authenticated user/session status for the client bootstrap path. A valid session returns a safe user representation. Missing, expired, invalid, or unverifiable sessions are unauthenticated and never return protected user data. Session-store failures fail closed and use a distinct safe error when the API can report one.

## `POST /auth/logout`

Invalidates the current Redis session id and clears the session cookie. Repeated logout and already-expired sessions are idempotent. It does not perform global Microsoft Entra sign-out. Subsequent protected requests from every tab must authenticate again.

## Protected request behavior

Every protected endpoint validates the opaque session against Redis before returning protected content. Missing/invalid/expired sessions redirect to `/auth/login` with a validated internal return destination. Session-store uncertainty denies access.

## Cookie contract

The session cookie is opaque, HttpOnly, Secure, and SameSite=Lax, with a server-controlled maximum age of 12 hours. It is absent from URLs, page content, API response bodies, and logs.
