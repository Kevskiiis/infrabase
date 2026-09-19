---

description: "Implementation tasks for Microsoft Entra ID session authentication"
---

# Tasks: Microsoft Entra ID Session Authentication

**Input**: Design documents from `/specs/001-entra-session-auth/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/auth-api.md`, and `quickstart.md`

**Organization**: Tasks are grouped by user story so each P1 increment can be implemented and tested independently after the foundational phase.

**Testing**: Tests are included because the constitution requires unit, integration, and end-to-end coverage for every feature.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish approved dependencies, test layout, and feature-first directories.

- [X] T001 Obtain explicit approval for the maintained OIDC/JWT validation dependency and record the selected package/version in `infrabase-api/requirements.txt`
- [X] T002 [P] Add backend test directories and shared pytest configuration in `infrabase-api/tests/conftest.py`
- [X] T003 [P] Add frontend feature/test directories and test-runner configuration in `infrabase-client/package.json` and `infrabase-client/vite.config.ts`
- [X] T004 [P] Create backend feature package files in `infrabase-api/app/features/entra_session_auth/__init__.py`, `router.py`, `service.py`, `models.py`, and `dependencies.py`
- [X] T005 [P] Create frontend authentication feature files in `infrabase-client/src/features/entra-session-auth/AuthProvider.tsx`, `ProtectedRoute.tsx`, and `authApi.ts`
- [X] T006 [P] Create shared generated-client destination and API error types in `infrabase-client/src/shared/api/README.md`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared configuration, error, Redis, contract, and security boundaries before user-story work.

- [X] T007 Define environment-aware Entra, Redis, session, CORS, and frontend-origin settings in `infrabase-api/app/core/config.py`
- [X] T008 Implement structured `{error, code, detail}` response models and exception handlers in `infrabase-api/app/core/errors.py`
- [X] T009 Implement Redis client lifecycle and fail-closed session-store access helpers in `infrabase-api/app/core/session_store.py`
- [X] T010 Implement safe internal return-destination validation plus short-lived, Redis-backed one-time OIDC flow state in `infrabase-api/app/features/entra_session_auth/redirects.py` and `infrabase-api/app/core/session_store.py`
- [X] T011 Implement secure opaque session ID creation, 12-hour TTL handling, and cookie settings in `infrabase-api/app/features/entra_session_auth/session.py`
- [X] T012 Implement Entra discovery, authorization-code exchange, JWKS retrieval, and claim validation boundary in `infrabase-api/app/core/security.py`
- [X] T013 Register CORS, error handlers, authentication router, and protected-request dependency wiring in `infrabase-api/app/main.py`
- [X] T014 [P] Define backend authentication and failure schemas matching `specs/001-entra-session-auth/contracts/auth-api.md` in `infrabase-api/app/features/entra_session_auth/models.py`
- [X] T015 [P] Generate the approved TypeScript API client from the backend OpenAPI schema and document the generation command in `infrabase-client/src/shared/api/README.md` and `infrabase-client/src/shared/api/generated/`
- [X] T016 [P] Add unit tests for configuration, error redaction, safe redirects, cookie flags, and session-store failure behavior in `infrabase-api/tests/unit/test_auth_foundation.py`
- [X] T017 [P] Add frontend API error parsing and connectivity-state primitives around the generated client in `infrabase-client/src/shared/api/client.ts`

**Checkpoint**: Shared configuration, error contract, Redis boundary, token-validation boundary, session primitives, and client API primitives are ready for story implementation.

## Phase 3: User Story 1 - Sign In and Reach Protected Content (Priority: P1) 🎯 MVP

**Story Goal**: An unauthenticated user can request protected content, complete Microsoft Entra sign-in, establish a backend session, and return to the original safe destination.

**Independent Test**: Request a protected destination without a session, complete a successful controlled OIDC callback, and confirm the destination is restored without exposing tokens or session IDs.

### Tests for User Story 1

- [X] T018 [P] [US1] Add unit tests for authorization URL state creation, callback claim validation, and rejection/no-session outcomes in `infrabase-api/tests/unit/test_sign_in_service.py`
- [X] T019 [P] [US1] Add API contract tests for `/auth/login` and `/auth/callback` redirects, cookies, HTTP-status/error responses, callback-state rejection, and safe return paths in `infrabase-api/tests/integration/test_auth_callback_contract.py`
- [X] T020 [P] [US1] Add frontend tests for protected-entry redirect, callback bootstrap, retryable rejection, and provider-unavailable messaging in `infrabase-client/tests/unit/auth-flow.test.tsx`
- [X] T021 [P] [US1] Add browser E2E coverage for unauthenticated protected entry and successful return-to-destination in `infrabase-client/tests/e2e/sign-in.spec.ts`

### Implementation for User Story 1

- [X] T022 [US1] Implement `/auth/login` return-destination validation and Entra authorization redirect in `infrabase-api/app/features/entra_session_auth/router.py`
- [X] T023 [US1] Implement one-time callback-state consumption, code exchange, JWKS identity validation, and safe failure classification in `infrabase-api/app/features/entra_session_auth/service.py`
- [X] T024 [US1] Implement successful callback session creation and secure cookie response in `infrabase-api/app/features/entra_session_auth/router.py`
- [X] T025 [US1] Implement frontend sign-in redirect, callback/session bootstrap, and safe retryable error states in `infrabase-client/src/features/entra-session-auth/AuthProvider.tsx` and `authApi.ts`
- [X] T026 [US1] Implement the protected-content boundary and unauthenticated fallback entry point in `infrabase-client/src/features/entra-session-auth/ProtectedRoute.tsx`
- [X] T027 [US1] Register the authentication flow and a protected demo route in `infrabase-client/src/App.tsx` and `infrabase-client/src/main.tsx`

**Checkpoint**: User Story 1 is independently testable and delivers the MVP sign-in journey.

## Phase 4: User Story 2 - Continue a Browser Session (Priority: P1)

**Story Goal**: A valid backend session authorizes ordinary protected requests for up to 12 hours without revalidating Entra on every request, while expiry and outages fail closed.

**Independent Test**: Use a valid session across multiple protected requests, then simulate expiry and Redis unavailability and confirm protected content is denied with a sign-in or connectivity outcome.

### Tests for User Story 2

- [X] T028 [P] [US2] Add unit tests for active, missing, expired, invalid, and session-store-unavailable states in `infrabase-api/tests/unit/test_session_dependency.py`
- [X] T029 [P] [US2] Add integration tests for `/auth/session` and protected request authorization, 12-hour expiry, safe destination preservation, and fail-closed Redis behavior in `infrabase-api/tests/integration/test_protected_session_contract.py`
- [X] T030 [P] [US2] Add frontend tests for session bootstrap, loading completion, expiration redirect, and backend connectivity error states in `infrabase-client/tests/unit/session-continuity.test.tsx`
- [X] T031 [P] [US2] Add browser E2E coverage for `/auth/session` bootstrap, multi-page continuity, expiration recovery, and safe destination restoration in `infrabase-client/tests/e2e/session-continuity.spec.ts`

### Implementation for User Story 2

- [X] T032 [US2] Implement authenticated-user and session validation dependencies with fail-closed Redis handling in `infrabase-api/app/features/entra_session_auth/dependencies.py`
- [X] T033 [US2] Apply the session dependency to protected API routes and return structured unauthenticated/connectivity outcomes in `infrabase-api/app/main.py` and `infrabase-api/app/features/entra_session_auth/router.py`
- [X] T034 [US2] Implement client session-status loading, protected-route loading state, expiration handling, and connectivity errors in `infrabase-client/src/features/entra-session-auth/AuthProvider.tsx` and `ProtectedRoute.tsx`
- [X] T035 [US2] Add a protected application shell that consumes the authenticated user state in `infrabase-client/src/App.tsx`

**Checkpoint**: User Stories 1 and 2 are independently testable; active sessions continue and unverifiable sessions never grant access.

## Phase 5: User Story 3 - Sign Out Immediately (Priority: P1)

**Story Goal**: A signed-in user can invalidate the backend session, clear the browser credential, and require authentication again across all open tabs without global Entra logout.

**Independent Test**: Sign in, sign out, request protected content from the same and another tab, and confirm both requests require sign-in within 5 seconds.

### Tests for User Story 3

- [X] T036 [P] [US3] Add unit tests for idempotent logout, Redis invalidation, expired-session logout, and cookie clearing in `infrabase-api/tests/unit/test_logout_service.py`
- [X] T037 [P] [US3] Add integration tests for `/auth/logout`, subsequent protected requests, concurrent tabs, and structured failure responses in `infrabase-api/tests/integration/test_logout_contract.py`
- [X] T038 [P] [US3] Add frontend tests for logout success, repeated logout, sign-out failure, and unauthenticated transition in `infrabase-client/tests/unit/logout-flow.test.tsx`
- [X] T039 [P] [US3] Add browser E2E coverage for same-tab and multi-tab logout propagation in `infrabase-client/tests/e2e/sign-out.spec.ts`

### Implementation for User Story 3

- [X] T040 [US3] Implement idempotent Redis session invalidation and cookie deletion in `infrabase-api/app/features/entra_session_auth/service.py` and `router.py`
- [X] T041 [US3] Implement frontend logout action, safe failure state, and transition to the unauthenticated entry point in `infrabase-client/src/features/entra-session-auth/AuthProvider.tsx` and `authApi.ts`
- [X] T042 [US3] Add an accessible sign-out control to the authenticated application shell in `infrabase-client/src/features/entra-session-auth/SignOutButton.tsx` and `infrabase-client/src/App.tsx`
- [X] T043 [US3] Ensure every subsequent protected navigation performs backend session revalidation after logout, so same- and other-tab requests are denied within the 5-second requirement without relying on client-readable session credentials in `infrabase-client/src/features/entra-session-auth/ProtectedRoute.tsx`

**Checkpoint**: All three user stories are independently testable and platform sign-out does not invoke global Entra logout.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete contract generation, documentation, security review, and repository quality gates.

- [X] T044 [P] Regenerate the TypeScript API client after final backend contract changes and verify generated auth operations in `infrabase-client/src/shared/api/generated/`
- [X] T045 [P] Add API contract coverage for every authentication error code and redaction rule in `infrabase-api/tests/contract/test_auth_openapi.py`
- [X] T046 [P] Add frontend accessibility assertions for semantic controls, keyboard access, and recoverable failure messaging in `infrabase-client/tests/unit/auth-accessibility.test.tsx`
- [X] T047 [P] Add CI jobs for backend unit/integration tests, frontend lint/build, and controlled E2E tests in `.github/workflows/auth-session.yml`
- [X] T048 Review auth logs, error payloads, URL parameters, and page state for secret/token/session-ID exposure in `infrabase-api/app/core/logging.py` and `infrabase-client/src/features/entra-session-auth/`
- [X] T049 Update the authentication setup and validation instructions with approved dependency configuration in `infrabase-api/README.md` and `specs/001-entra-session-auth/quickstart.md`
- [ ] T050 Run the complete feature validation scenarios from `specs/001-entra-session-auth/quickstart.md` and record any deviations in `specs/001-entra-session-auth/quickstart.md`

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; creates directories, test configuration, and approved dependency prerequisites.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user-story work.
- **Phase 3 User Story 1**: Depends on Phase 2; this is the MVP sign-in increment.
- **Phase 4 User Story 2**: Depends on Phase 2 and the session primitives from Phase 1/2; it can begin in parallel with US1 after the foundation, but shares auth files with US1 and should be coordinated.
- **Phase 5 User Story 3**: Depends on Phase 2 and the session primitives; it can begin in parallel with US1/US2 after the foundation, but shares auth files and should be coordinated.
- **Phase 6 Polish**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Depends only on the foundational phase; no dependency on US2 or US3.
- **US2 (P1)**: Depends only on the foundational phase; reuses session primitives but is independently testable.
- **US3 (P1)**: Depends only on the foundational phase; reuses session primitives but is independently testable.

### Parallel Opportunities

- Phase 1 tasks T002-T006 can run in parallel after T001's dependency decision is recorded.
- Phase 2 tasks T014-T017 can run in parallel with the core config/security/session tasks once their target contracts are agreed.
- Within each user story, the unit, integration, frontend, and E2E test tasks can run in parallel before implementation; implementation tasks touching different files can also run in parallel.
- After Phase 2, separate developers can work on US1, US2, and US3 in parallel if shared router/service files are coordinated.
- Phase 6 tasks T044-T049 can run in parallel after the relevant stories are complete; T050 runs last.

## Parallel Example: User Story 1

```text
Task T018: Backend sign-in service unit tests in infrabase-api/tests/unit/test_sign_in_service.py
Task T019: Auth callback API contract tests in infrabase-api/tests/integration/test_auth_callback_contract.py
Task T020: Frontend auth-flow tests in infrabase-client/tests/unit/auth-flow.test.tsx
Task T021: Sign-in browser E2E tests in infrabase-client/tests/e2e/sign-in.spec.ts
```

## Parallel Example: User Story 2

```text
Task T028: Session dependency unit tests in infrabase-api/tests/unit/test_session_dependency.py
Task T029: Protected-session integration tests in infrabase-api/tests/integration/test_protected_session_contract.py
Task T030: Session continuity frontend tests in infrabase-client/tests/unit/session-continuity.test.tsx
Task T031: Session continuity browser E2E tests in infrabase-client/tests/e2e/session-continuity.spec.ts
```

## Parallel Example: User Story 3

```text
Task T036: Logout service unit tests in infrabase-api/tests/unit/test_logout_service.py
Task T037: Logout API integration tests in infrabase-api/tests/integration/test_logout_contract.py
Task T038: Logout frontend tests in infrabase-client/tests/unit/logout-flow.test.tsx
Task T039: Sign-out browser E2E tests in infrabase-client/tests/e2e/sign-out.spec.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and Phase 2 foundational work.
2. Complete Phase 3 User Story 1.
3. Run the US1 unit, integration, frontend, and browser checks.
4. Stop at the US1 checkpoint for review/demo before adding continuity and logout.

### Incremental Delivery

1. Deliver US1 sign-in and protected-entry restoration.
2. Deliver US2 session continuity and fail-closed expiration/outage behavior.
3. Deliver US3 platform-only logout and multi-tab invalidation.
4. Complete contract generation, CI, accessibility, redaction review, and quickstart validation.

## Notes

- Every task uses the required `- [ ] T### [P?] [US#?] description` format and names at least one concrete file path.
- `[P]` marks tasks that can proceed in parallel without depending on incomplete work in the same files.
- Story labels map directly to the three P1 stories in `spec.md`.
- No task introduces local credentials, a persistent remember-me session, role authorization, or global Entra logout.
