# Feature Specification: Microsoft Entra ID Session Authentication

**Feature Branch**: `001-entra-session-auth`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "Users sign in to the platform using their Microsoft Entra ID account. After signing in, they stay signed in for a normal browser session without re-authenticating on every request. If their session is missing or expired, they're redirected to sign in before reaching any protected content, and returned to what they were trying to reach afterward. Signing out ends the session immediately."

## Clarifications

### Session 2026-09-17

- Q: When a user cancels sign-in or Microsoft Entra rejects authentication, what should the platform display? -> A: Show a clear failure message, allow retry, and create no session.
- Q: When a user's session expires while requesting protected content, should the platform preserve that internal destination and return the user there after successful sign-in? -> A: Preserve the safe internal destination and return there after re-authentication; use a safe default for invalid destinations.
- Q: Should signing out invalidate only the platform session, without signing the user out of Microsoft Entra ID? -> A: Invalidate only the platform session; global Microsoft Entra sign-out remains out of scope.
- Q: What maximum duration should an authenticated platform browser session remain valid before requiring sign-in again? -> A: 12 hours.
- Q: When an authentication or session failure is returned by the backend API, should it use the project's standard structured error format? -> A: Use the standard structured API error contract with safe error codes and messages.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In and Reach Protected Content (Priority: P1)

As an authorized platform user, I want to sign in with my Microsoft Entra ID account so that I can access protected platform content.

**Why this priority**: Authentication is required before any protected platform workflow can be used.

**Independent Test**: Start unauthenticated, request a protected destination, complete a successful Entra ID sign-in, and verify that the user reaches the originally requested destination.

**Acceptance Scenarios**:

1. **Given** a user is not signed in, **When** they request protected content, **Then** they are redirected to Microsoft Entra ID to sign in before the content is shown.
2. **Given** a user completes a successful Microsoft Entra ID sign-in, **When** authentication returns to the platform, **Then** the user is signed in and returned to the protected destination they originally requested.
3. **Given** Microsoft Entra ID does not authenticate the user or the user cancels sign-in, **When** the authentication flow ends, **Then** protected content remains inaccessible, no platform session is created, and the user sees a clear failure message with an option to retry.

### User Story 2 - Continue a Browser Session (Priority: P1)

As a signed-in user, I want to remain signed in during a normal browser session so that ordinary navigation does not require repeated authentication.

**Why this priority**: Re-authenticating on every request would make the platform impractical to use.

**Independent Test**: Sign in once, navigate across multiple protected destinations, and verify that the user remains authenticated without another sign-in prompt until the session expires or is ended.

**Acceptance Scenarios**:

1. **Given** a user has successfully signed in, **When** they make multiple protected requests during the active browser session, **Then** each request is allowed without requiring another sign-in.
2. **Given** a user has an active session, **When** they close and reopen a protected page within the supported browser-session lifetime, **Then** the platform applies the session state consistently.
3. **Given** a session is expired or unavailable, **When** the user requests protected content, **Then** the platform redirects them to sign in rather than exposing the content.

### User Story 3 - Sign Out Immediately (Priority: P1)

As a signed-in user, I want to sign out so that my access ends immediately on the current browser session.

**Why this priority**: Users need a reliable way to end access, especially on shared or unattended devices.

**Independent Test**: Sign in, sign out, and then request a protected destination using the same browser context.

**Acceptance Scenarios**:

1. **Given** a user is signed in, **When** they select sign out, **Then** the session ends immediately and the browser no longer has usable session credentials.
2. **Given** a user has signed out, **When** they request protected content, **Then** they are redirected to sign in again.
3. **Given** a user signs out from a protected destination, **When** sign-out completes, **Then** the user sees the unauthenticated entry point and cannot continue using the previous authenticated session.

### Edge Cases

- If the user requests a protected URL with a missing, invalid, or expired session, redirect them to sign in and preserve only a safe internal return destination.
- If the requested return destination is malformed or points outside the platform, complete sign-in at a safe default entry point instead of redirecting externally.
- If the client cannot reach the backend API — during the sign-in redirect, a session check, or sign-out — the platform must present a clear connectivity error rather than a blank page, an infinite loading state, or a silent failure. The user must not be left believing they are signed in (or out) when the client simply could not reach the backend to confirm either state.
- If the backend cannot reach Microsoft Entra ID — during the sign-in redirect, the token exchange, or a JWKS validation call — the platform must present a clear, distinct failure and MUST NOT create a session. This is separate from Entra ID actively rejecting the sign-in attempt (see below); here, the identity provider cannot be reached at all.
- If the user cancels sign-in or Entra ID returns an authentication error, do not create a platform session, keep protected content inaccessible, and show a clear retryable failure message.
- If an OIDC callback state is missing, expired, or replayed, reject the callback without creating a session and show a safe retryable failure message.
- If the backend cannot reach its session store (e.g. Redis) when validating a session, the platform must fail closed: treat the request as unauthenticated and redirect to sign-in, rather than allowing access because session state could not be checked.
- If sign-out is repeated or the session has already expired, complete the operation safely and leave the user unauthenticated.
- If a user opens multiple tabs, signing out in one tab must prevent subsequent protected requests from the other tabs from being accepted.
- Authentication failures and session identifiers must not expose credentials or sensitive token contents to the user interface or logs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST authenticate users exclusively through Microsoft Entra ID using OIDC; it MUST NOT provide a local username/password sign-in flow.
- **FR-002**: The platform MUST establish a backend-owned browser session only after successful Entra ID authentication and validation of the returned identity.
- **FR-003**: The platform MUST keep an authenticated user signed in across protected requests during the supported browser-session lifetime of 12 hours without requiring re-authentication on every request.
- **FR-004**: The platform MUST prevent access to protected content when the user has no valid session.
- **FR-005**: When redirecting an unauthenticated user to sign in because a session is missing or expired, the platform MUST preserve the originally requested safe internal destination and return the user there after successful authentication.
- **FR-006**: The platform MUST reject unsafe, malformed, or external return destinations and use a safe default destination instead.
- **FR-007**: The platform MUST handle missing, invalid, and expired sessions by redirecting the user to sign in before serving protected content.
- **FR-008**: If the platform cannot determine session validity because its session store is unreachable, it MUST deny access to protected content (fail closed) rather than allow the request to proceed.
- **FR-009**: If the backend cannot reach Microsoft Entra ID during the sign-in redirect, token exchange, or JWKS validation, the platform MUST NOT create a session and MUST present a clear failure outcome distinct from an active authentication rejection.
- **FR-010**: The platform MUST provide a sign-out action that invalidates the active backend session immediately and removes the browser's usable session credential.
- **FR-011**: After sign-out, every subsequent request from the signed-out browser session MUST require authentication again, including requests from other open tabs.
- **FR-012**: The backend MUST validate Entra-issued bearer tokens against Microsoft Entra ID's JWKS endpoint during the sign-in flow and MUST NOT generate, manage, or substitute its own identity tokens.
- **FR-013**: Session credentials MUST be protected from client-side script access and MUST NOT be exposed in page content, URLs, logs, or error messages.
- **FR-014**: Authentication, callback, session-expiration, and sign-out failures returned by the backend API MUST use the standard structured `{error, code, detail}` contract with safe user-facing codes and messages, without revealing secrets or raw token data.
- **FR-015**: If the client cannot reach the backend API, the platform MUST present a clear connectivity error and MUST NOT imply a false signed-in or signed-out state.
- **FR-016**: The platform MUST issue OIDC callback state that is stored server-side in Redis, bound to the validated safe return destination, expires after a short configured interval, and can be consumed only once; replayed, missing, or expired state MUST create no session.
- **FR-017**: Authentication API failures MUST return the structured `{error, code, detail}` body with an HTTP status appropriate to the failure; browser redirect flows MUST surface the safe failure code through the client error entry point without exposing provider details.

### Key Entities

- **Authenticated User**: The Entra ID identity accepted by the platform, including the identity claims needed to authorize protected platform actions.
- **Browser Session**: The backend-managed association between a browser and an authenticated user, including its expiration and invalidation state, valid for no more than 12 hours.
- **Protected Destination**: The safe internal platform location the user requested before authentication and should return to after successful sign-in.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of successful sign-ins return the user to the originally requested protected destination without manual URL re-entry.
- **SC-002**: During an active browser session, 100% of ordinary protected navigation requests complete without an additional sign-in prompt until the session expires or is explicitly ended.
- **SC-003**: Within 5 seconds of selecting sign out, a subsequent protected request in the same browser context is denied and requires sign-in again.
- **SC-004**: 100% of requests made with missing or expired sessions are denied before protected content is returned.
- **SC-005**: 100% of authentication and sign-out failure experiences present a user-understandable outcome without displaying credentials, bearer tokens, or raw token claims.
- **SC-006**: 100% of requests occurring during an Entra ID or session-store outage are denied access rather than incorrectly granted.

## Assumptions

- Users have an account in the configured Microsoft Entra ID tenant and are authorized to use the platform.
- The platform is served over HTTPS through the existing deployment boundary.
- The browser-session lifetime is limited to 12 hours.
- Protected destinations are internal platform URLs; external redirects are out of scope.
- Sign-out ends the platform session. Global Microsoft Entra ID sign-out across other applications is out of scope unless separately specified.

## Out of Scope

- Role-based access or authorization differences between users — every authenticated session has equal access to protected content under this feature.
- "Remember me" or any session persistence beyond the platform's standard browser-session lifetime.
- Account management actions (profile editing, tenant/account switching, etc.) — this feature covers sign-in, session continuity, and sign-out only.
- Global Microsoft Entra ID sign-out across other applications using the same Entra ID tenant.