# Implementation Plan: Primary Navigation Sidebar

**Branch**: `002-primary-navigation-sidebar` | **Date**: 2026-09-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-primary-navigation-sidebar/spec.md`

## Summary

Replace the current authenticated top-bar shell with a persistent Material UI sidebar layout. The sidebar will own branding, a data-driven Services navigation item, a collapse/expand control, and a bottom-pinned user footer with initials and Settings navigation. Services and Settings will be authenticated placeholder destinations. Existing `AuthProvider` and `ProtectedRoute` behavior remain the source of identity and access control.

## Technical Context

**Language/Version**: TypeScript 6, React 19

**Primary Dependencies**: Material UI 9, `@mui/icons-material`, Vite, existing React authentication components; Ky remains unchanged for backend API calls

**Storage**: No new storage; collapse state is local to the mounted authenticated shell and resets to expanded on a fresh load

**Testing**: Vitest with Testing Library for component and initials behavior; Playwright for authenticated navigation and responsive browser flows; existing TypeScript build and ESLint checks

**Target Platform**: Modern desktop and narrow-viewport browsers served by the existing Vite client

**Project Type**: Authenticated React web application backed by the existing FastAPI API

**Performance Goals**: Sidebar state changes and route presentation complete within 1 second; navigation does not introduce an additional authentication request while the current session is valid

**Constraints**: Material UI components MUST be used for UI and UX; no new third-party dependency; semantic keyboard-accessible controls; existing Entra session identity only; no backend/API changes; no user preference persistence; sidebar must remain behind `ProtectedRoute`

**Scale/Scope**: One authenticated shell with two placeholder destinations (Services and Settings), one extensible navigation collection, and current-user identity presentation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I: **PASS** - The sidebar reads the already validated authenticated identity and does not alter Entra or session behavior.
- IV: **PASS** - Unit/component coverage and Playwright end-to-end coverage are included for the user-facing flow; no backend contract changes are introduced.
- V: **PASS** - The design uses existing dependencies, browser navigation, and local component state without adding a router, database, or persistence layer.
- VI: **PASS** - MUI semantic navigation, buttons, links, labels, active state, and accessible names are required in both expanded and collapsed presentations.
- XIII: **PASS** - No API contract changes or hand-written backend data types are needed; the existing `AuthenticatedUser` type is reused.
- XV: **PASS** - The plan includes the existing client lint, build, unit, and E2E checks.
- XVI: **PASS** - Sidebar-specific components and helpers live under a frontend feature module; shared authentication remains in the existing authentication feature.

### Post-Design Constitution Check

- I, IV, V, VI, XIII, XV, and XVI: **PASS** - Research and design preserve the existing authenticated boundary, use the approved UI stack, avoid new dependencies and persistence, define test coverage, and keep the implementation feature-organized.
- Dependency constraint: **PASS** - No package manifest changes are required; `@mui/material` and `@mui/icons-material` are already installed.

## Project Structure

### Documentation (this feature)

```text
specs/002-primary-navigation-sidebar/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Sidebar and navigation entities
├── quickstart.md        # Validation guide
├── contracts/
│   └── sidebar-ui.md    # UI behavior contract
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
infrabase-client/
├── src/
│   ├── features/
│   │   ├── navigation/
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── navigationItems.ts
│   │   │   └── userInitials.ts
│   │   └── authentication/
│   │       ├── AuthProvider.tsx
│   │       └── ProtectedRoute.tsx
│   ├── App.tsx
│   └── App.css
└── tests/
    ├── unit/
    │   ├── navigation.test.tsx
    │   └── user-initials.test.ts
    └── e2e/
        └── navigation-sidebar.spec.ts
```

**Structure Decision**: Add a `features/navigation/` module for the reusable sidebar, its data-driven destinations, and identity formatting helper. Keep page composition in `App.tsx`, reuse `useAuth()` for the current user, and leave authentication implementation unchanged. Services and Settings placeholder content remain page-level composition until those features receive their own specifications.

## Complexity Tracking

No constitution violations or additional complexity require justification.
