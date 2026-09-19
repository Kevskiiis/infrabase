# Quickstart: Entra Session Authentication

This guide validates the feature through the backend API and browser client. Use a test Entra tenant or a controlled OIDC test double; never use production secrets in local files or logs.

## Prerequisites

- Python 3 and the dependencies in `infrabase-api/requirements.txt`
- Node.js and the dependencies in `infrabase-client/package.json`
- A reachable test Redis instance
- Test OIDC configuration: tenant, client ID, redirect URI, and secret supplied through environment-aware configuration
- A browser automation runner for E2E checks

## Start the services

From the repository root:

```bash
cd infrabase-api
uvicorn app.main:app --reload
```

In a second terminal:

```bash
cd infrabase-client
npm run dev
```

## Validation scenarios

1. Open a protected destination while unauthenticated. Confirm the backend redirects to Entra and preserves only the safe internal path.
2. Complete a successful test sign-in. Confirm the browser returns to the original destination, receives an opaque HttpOnly session cookie, and the API response/page contains no token or session ID.
3. Navigate among multiple protected destinations and reopen one within 12 hours. Confirm no additional sign-in is requested.
4. Cancel sign-in or return an Entra rejection. Confirm no session is created, protected content remains inaccessible, and a safe retryable error is shown.
5. Simulate an Entra outage during redirect, code exchange, and JWKS validation. Confirm no session is created and the provider-unavailable error differs from rejection.
6. Simulate Redis unavailability during session validation. Confirm access is denied rather than granted.
7. Sign out, then request protected content from the same tab and another open tab. Confirm both require sign-in within 5 seconds and the platform session cookie is cleared.
8. Repeat sign-out after expiration. Confirm the operation is safe and leaves the user unauthenticated.
9. Submit malformed, absolute, protocol-relative, and external return destinations as unsafe redirects. Confirm each resolves to the safe unauthenticated entry point.
10. Inspect API failures and logs for secret/token leaks. Confirm errors follow `{error, code, detail}` and contain no credentials, bearer tokens, raw claims, or session identifiers.

## Automated checks

Backend unit and integration tests must mock Entra, JWKS, and Redis. Frontend tests must cover auth bootstrap, protected-boundary redirects, failure states, retry, and logout. Browser E2E tests must cover the complete sign-in, session continuity, expiration, and sign-out journeys with controlled test services.

## Current validation notes

- Backend unit, integration, and OpenAPI contract tests run with in-memory Redis and controlled provider responses.
- Frontend lint and TypeScript checks pass locally. Frontend test dependencies are declared and locked, but local installation may require fixing ownership of the existing `node_modules` directory before `npm ci` can run.
- Browser specs use controlled route doubles; no production Entra credentials are required.
