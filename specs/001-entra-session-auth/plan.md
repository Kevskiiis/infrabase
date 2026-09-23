# Implementation Plan: Microsoft Entra ID Session Authentication

**Branch**: `001-entra-session-auth` | **Date**: 2026-09-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-entra-session-auth/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add Microsoft Entra ID OIDC sign-in to the FastAPI/React platform using a backend-owned Redis browser session. Unauthenticated protected requests redirect through the backend to Entra, successful callbacks validate the identity and create a 12-hour HttpOnly session cookie, and sign-out revokes the Redis session and clears the cookie.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3 backend; TypeScript/React 19 frontend

**Primary Dependencies**: FastAPI, Pydantic Settings, Redis, Loguru, Material UI; an approved OIDC/JWT validation library is required for secure Entra code-flow and JWKS validation

**Storage**: Redis only for browser sessions; no database

**Testing**: pytest unit/integration tests, frontend lint/build checks, and browser E2E tests with Entra and Redis test doubles; `/auth/session` has explicit API and browser bootstrap coverage

**Target Platform**: Linux-hosted FastAPI service behind HTTPS and a modern browser-served Vite client

**Project Type**: Web application with a backend API and frontend client

**Performance Goals**: Protected requests perform one Redis session lookup; sign-out denial propagates within 5 seconds; no token validation call is required on ordinary session requests

**Constraints**: OIDC-only identity; Redis-backed one-time OIDC state with short expiry; 12-hour maximum session TTL; HttpOnly/Secure/SameSite=Lax cookie; safe internal return paths only; fail closed on Redis or Entra uncertainty; structured `{error, code, detail}` API errors with appropriate HTTP statuses; generated TypeScript API client before user-story implementation; no secrets or tokens in logs or UI

**Scale/Scope**: One platform tenant and equal-access authenticated users; authentication, session continuity, protected-route handling, failure states, and sign-out only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I: **PASS** - Entra OIDC is the only identity source; Redis owns short-lived sessions; cookies are HttpOnly, Secure, and SameSite=Lax; no platform identity tokens are issued.
- III: **PASS** - All API failures use `{error, code, detail}`.
- IV/XIV: **PASS** - Unit and integration tests mock Entra, JWKS, and Redis; E2E tests use controlled test doubles or test infrastructure and never expose credentials.
- V: **PASS** - No database, local credential store, persistent “remember me” state, or global Entra logout is introduced.
- IX: **PASS** - Secrets and token contents stay in server-side configuration and are excluded from logs, URLs, page content, and errors.
- XIII: **PASS** - The TypeScript client is generated during foundational work before auth story implementation; auth feature calls wrap generated operations and types.
- VI: **PASS** - Failure, retry, and sign-out controls use semantic, keyboard-accessible frontend elements.
- Dependency constraint: **PASS** - The secure OIDC/JWT library selected in research must receive explicit approval before it is added; hand-rolled JWT validation is prohibited.

### Post-Design Constitution Check

- I, III, IV, V, VI, IX, XIII, and XIV: **PASS** - The research and contracts preserve OIDC-only identity, Redis-backed revocable sessions, structured errors, semantic client controls, secret exclusion, generated API contracts, and mocked external services.
- Dependency constraint: **PASS WITH IMPLEMENTATION ACTION** - Select and obtain explicit approval for the maintained OIDC/JWT library before modifying dependency manifests; this is an implementation prerequisite, not a design exception.

## Project Structure

### Documentation (this feature)

```text
specs/001-entra-session-auth/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
proxbase-api/
├── app/
│   ├── core/                  # config, logging, security, Redis session access
│   └── features/
│       └── authentication/ # router, service, models, dependencies
└── tests/
  ├── unit/
  ├── integration/
  └── e2e/

proxbase-client/
├── src/
│   ├── features/authentication/ # auth state, protected boundary, error UI
│   └── shared/                      # API client and generated contract types
└── tests/
  ├── unit/
  └── e2e/
```

**Structure Decision**: Keep backend authentication in a feature-first `app/features/authentication/` module, with shared Redis/config/security primitives under `app/core/`. Keep client auth state and protected-content behavior under `src/features/authentication/`, and consume the backend OpenAPI contract through generated client types under `src/shared/`. Add tests beside the existing two applications rather than creating a third project.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Approved OIDC/JWT dependency | Secure authorization-code and JWKS validation cannot be safely hand-rolled | A standard-library-only implementation would create cryptographic and protocol risk; dependency approval is required before implementation |

## Phase Outputs

- `research.md`: decisions for OIDC flow, session cookie behavior, safe redirects, failure handling, and test isolation.
- `data-model.md`: authenticated user, browser session, protected destination, and failure state rules.
- `contracts/auth-api.md`: backend auth endpoints, response/error shapes, and cookie behavior.
- `quickstart.md`: runnable validation scenarios for sign-in, continuity, expiration, sign-out, outages, and unsafe redirects.
