# Quickstart: Primary Navigation Sidebar

This guide validates the authenticated sidebar using the existing Vite client, controlled authentication session responses, Vitest, and Playwright.

## Prerequisites

- Node.js and dependencies installed in `proxbase-client/`
- The repository's existing frontend test dependencies
- A browser available to the Playwright configuration for E2E checks
- The backend or a controlled `/auth/session` response that supplies an authenticated test user

## Start the client

From the repository root:

```bash
cd proxbase-client
npm run dev
```

The client should be available at `http://localhost:5173`.

## Automated validation

Run the focused unit tests:

```bash
cd proxbase-client
npm test -- --run tests/unit/navigation.test.tsx tests/unit/user-initials.test.ts
```

Run the client quality checks:

```bash
npm run lint
npm run build
```

Run the focused browser flow:

```bash
npm run test:e2e -- tests/e2e/navigation-sidebar.spec.ts
```

## Manual and E2E scenarios

1. Start with a controlled authenticated user named `Test User`. Confirm every authenticated page shows the Proxbase brand, Services navigation, collapse control, and bottom-pinned user footer.
2. Select Services. Confirm the Services placeholder is non-blank, Services is marked active, and the sidebar remains present.
3. Select Settings. Confirm the Settings placeholder is non-blank, Settings is marked active, and the sidebar remains present.
4. Collapse the sidebar. Confirm labels hide, icons remain visible, and keyboard focus plus accessible names still expose Services, Settings, and the expand action.
5. Expand the sidebar. Confirm branding and labels return, and the navigation state remains correct.
6. Repeat with `name` absent and `email` set to `ada@example.com`. Confirm the avatar uses email-derived initials. Repeat with both absent and confirm the safe `?` fallback.
7. Load a narrow viewport and confirm the sidebar controls and page content do not overlap or clip the footer.
8. Open an authenticated route after the session response is unauthenticated or fails. Confirm the existing protected-route loading, redirect, or error state appears without an authenticated sidebar.

## Expected outcomes

- No new network request is made solely to render the sidebar or derive initials.
- No backend API contract, authentication cookie, session value, or internal subject is displayed.
- Services and Settings are reachable by mouse and keyboard and remain protected by the existing auth boundary.

## Current validation notes

_To be completed during T028 (Polish & Cross-Cutting Concerns) after running the automated checks and manual scenarios above. Record actual results, the viewport widths exercised (desktop and below the 600px narrow-viewport threshold), and any remaining requirement or implementation gap._
