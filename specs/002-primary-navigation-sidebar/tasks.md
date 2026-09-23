---

description: "Actionable implementation tasks for the primary navigation sidebar"
---

# Tasks: Primary Navigation Sidebar

**Input**: Design documents from `/specs/002-primary-navigation-sidebar/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/sidebar-ui.md](contracts/sidebar-ui.md), [quickstart.md](quickstart.md)

**Tests**: Included because the project constitution requires unit, integration/contract where applicable, and end-to-end coverage for new features. This is a frontend-only feature, so no backend contract changes or backend tests are required.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated as an independent increment after the shared shell foundation exists.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the navigation feature module and test entry points without changing behavior.

- [X] T001 Create the navigation feature directory at `proxbase-client/src/features/navigation/` and the focused test entry points at `proxbase-client/tests/unit/navigation.test.tsx`, `proxbase-client/tests/unit/user-initials.test.ts`, and `proxbase-client/tests/e2e/navigation-sidebar.spec.ts`.
- [X] T002 [P] Document the sidebar implementation and validation scope in `specs/002-primary-navigation-sidebar/quickstart.md` and keep the implementation paths aligned with `specs/002-primary-navigation-sidebar/plan.md`.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared navigation model and identity derivation used by all user stories.

- [X] T003 [P] Define the extensible navigation destination collection, destination type, internal paths, Material UI icons, and header/body/footer grouping in `proxbase-client/src/features/navigation/navigationItems.ts`.
- [X] T004 [P] Implement deterministic user-initial derivation with name-first, email-fallback, two-character uppercase, punctuation/whitespace handling, and `?` fallback rules in `proxbase-client/src/features/navigation/userInitials.ts`.
- [X] T005 [P] Add unit coverage for navigation destination metadata and user-initial edge cases in `proxbase-client/tests/unit/user-initials.test.ts` and `proxbase-client/tests/unit/navigation.test.tsx`.
- [X] T006 Define the authenticated shell page composition contract in `proxbase-client/src/App.tsx`, including the protected boundary, shared sidebar slot, main-content slot, and placeholder destination selection without adding a backend request or dependency.

**Checkpoint**: Shared destination metadata, identity formatting, and authenticated shell boundaries are ready for story implementation.

## Phase 3: User Story 1 - Navigate Authenticated Workspace (Priority: P1) 🎯 MVP

**Goal**: Give every authenticated page a persistent header/body/footer sidebar with Proxbase branding, Services navigation, protected placeholder destinations, and active destination orientation.

**Independent Test**: With a controlled authenticated session, open the authenticated landing page, select Services, and confirm the protected Services placeholder and shared sidebar remain available with Services marked current.

### Tests for User Story 1

- [X] T007 [P] [US1] Add component requirements coverage for header, body, footer order; Proxbase branding; Services label/icon; active destination state (including no active item for an unrecognized path); and absence of the sidebar in unauthenticated, loading, or authentication-error states in `proxbase-client/tests/unit/navigation.test.tsx`.
- [X] T008 [P] [US1] Add Playwright coverage for authenticated landing-page shell, single-action Services navigation (supporting SC-002), protected Services placeholder content, active state after browser back/forward navigation, and no extra session request during navigation in `proxbase-client/tests/e2e/navigation-sidebar.spec.ts`.

### Implementation for User Story 1

- [X] T009 [US1] Implement the reusable header/body/footer sidebar structure with Material UI semantic navigation, branding, Services item, protected user-footer slot, and an active-state indicator that re-derives from the current pathname on every navigation (including browser back/forward) and shows no active item for an unrecognized path, in `proxbase-client/src/features/navigation/AppSidebar.tsx`.
- [X] T010 [US1] Add the authenticated Services placeholder page definition and internal pathname selection while preserving the existing `ProtectedRoute` wrapper in `proxbase-client/src/App.tsx`.
- [X] T011 [US1] Replace the current authenticated top-bar shell with the shared sidebar layout and main-content region, keeping existing session status and sign-out behavior intact in `proxbase-client/src/App.tsx`.
- [X] T012 [US1] Add page-shell and sidebar styling for fixed header/body/footer structure, persistent left placement, active state, content offset, and non-overlapping main content in `proxbase-client/src/App.css`.
- [X] T013 [US1] Update the existing authenticated shell E2E assertions to target the new shared sidebar and preserve authentication-boundary expectations in `proxbase-client/tests/e2e/session-continuity.spec.ts`.

**Checkpoint**: User Story 1 is independently usable: authenticated users see the shared sidebar, reach the protected Services placeholder, and unauthenticated users never see the authenticated shell.

## Phase 4: User Story 2 - Collapse Navigation for More Workspace (Priority: P1)

**Goal**: Let authenticated users collapse and expand the sidebar while preserving icon-based navigation, accessible names, page-content separation, and navigation state.

**Independent Test**: Open an authenticated page, activate collapse, verify labels disappear while controls remain usable, move to another authenticated destination, then expand and verify labels return without overlap.

### Tests for User Story 2

- [X] T014 [P] [US2] Add component coverage for expanded default state, collapse/expand control names, hidden labels, visible icons, keyboard reachability, and preserved active state in `proxbase-client/tests/unit/navigation.test.tsx`.
- [X] T015 [P] [US2] Add Playwright coverage for collapse/expand completing within 1 second (SC-003), keyboard access to icon-only controls, route changes while collapsed, viewport widths below the 600px narrow-viewport threshold pushing main content (SC-007, FR-017), and absence of overlapping controls in `proxbase-client/tests/e2e/navigation-sidebar.spec.ts`.

### Implementation for User Story 2

- [X] T016 [US2] Add local expanded/collapsed state and semantic collapse/expand control with accessible labels and Material UI icons in `proxbase-client/src/features/navigation/AppSidebar.tsx`.
- [X] T017 [US2] Implement compact and expanded sidebar styles, stable control dimensions, icon-only discoverability, and responsive layout rules that push main content rather than overlap it in `proxbase-client/src/App.css`.
- [X] T018 [US2] Ensure the sidebar state remains available across authenticated destination changes without persistence or additional authentication requests in `proxbase-client/src/App.tsx` and `proxbase-client/src/features/navigation/AppSidebar.tsx`.

**Checkpoint**: User Stories 1 and 2 are independently usable: users can navigate and reclaim workspace without losing access, context, or keyboard accessibility.

## Phase 5: User Story 3 - Identify Account and Open Settings (Priority: P2)

**Goal**: Show the authenticated user's initials in a bottom-pinned footer and provide protected Settings navigation with a clear placeholder page.

**Independent Test**: Render the sidebar with a known name, email fallback, and absent identity values; confirm the expected avatar output, then open Settings and confirm the shared shell remains available.

### Tests for User Story 3

- [X] T019 [P] [US3] Expand unit coverage for name-derived initials, email-derived initials, punctuation/whitespace, long identities, safe `?` fallback, and subject non-disclosure in `proxbase-client/tests/unit/user-initials.test.ts` and `proxbase-client/tests/unit/navigation.test.tsx`.
- [X] T020 [P] [US3] Add Playwright coverage for bottom-pinned user footer, avatar accessible label, Settings navigation, protected Settings placeholder, and footer availability in collapsed and narrow layouts in `proxbase-client/tests/e2e/navigation-sidebar.spec.ts`.

### Implementation for User Story 3

- [X] T021 [US3] Connect `useAuth()` identity data to the circular avatar, display-safe initials helper, and user-facing accessible label without rendering subject/session values in `proxbase-client/src/features/navigation/AppSidebar.tsx`.
- [X] T022 [US3] Add the Settings footer destination with Material UI settings icon, expanded/collapsed accessible labels, active state, and the authenticated Settings placeholder page definition with internal pathname selection in `proxbase-client/src/features/navigation/AppSidebar.tsx` and `proxbase-client/src/App.tsx`.
- [X] T023 [US3] Complete footer pinning, avatar sizing, long-identity overflow handling, and narrow-layout accessibility styles in `proxbase-client/src/App.css`.

**Checkpoint**: All three user stories are independently usable: authenticated users can identify the active account and reach the protected Settings placeholder from either sidebar state.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against the design contract, constitution, and quickstart.

- [ ] T024 [P] Run the focused unit test suite for navigation and identity behavior from `proxbase-client/` with `npm test -- --run tests/unit/navigation.test.tsx tests/unit/user-initials.test.ts`.
- [ ] T025 [P] Run frontend lint and TypeScript/Vite production build for `proxbase-client/package.json` with `npm run lint` and `npm run build` from `proxbase-client/`.
- [ ] T026 [P] Run the focused browser flow from `proxbase-client/` with `npm run test:e2e -- tests/e2e/navigation-sidebar.spec.ts tests/e2e/session-continuity.spec.ts` across a desktop viewport project and a narrow viewport project at widths below 600px.
- [ ] T027 Review `proxbase-client/src/features/navigation/AppSidebar.tsx`, `proxbase-client/src/App.tsx`, and `proxbase-client/src/App.css` against `specs/002-primary-navigation-sidebar/contracts/sidebar-ui.md` for semantic landmarks, focus behavior, active states, non-overlap, and identity privacy.
- [ ] T028 Run every validation scenario in `specs/002-primary-navigation-sidebar/quickstart.md` and record the results, including any remaining requirement or implementation gap, in the "Current validation notes" section of `specs/002-primary-navigation-sidebar/quickstart.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001 and T002 can run in parallel.
- **Foundational (Phase 2)**: Depends on T001; T003, T004, and T005 can run in parallel, then T006 completes the shared shell boundary.
- **User Stories (Phases 3-5)**: Depend on Phase 2. US1 is the MVP foundation; US2 depends on the shared sidebar from US1; US3 depends on the shared sidebar and destination model from US1 and US2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2; no dependency on another user story. Provides the authenticated shell and Services destination.
- **User Story 2 (P1)**: Starts after US1's shared sidebar exists; extends the same component and layout behavior with collapse state.
- **User Story 3 (P2)**: Starts after US1's shell and US2's responsive structure exist; adds identity presentation and Settings footer navigation.

### Parallel Opportunities

- T003, T004, and T005 can run in parallel after setup because they touch separate model/helper/test slices.
- T007 and T008 can run in parallel before US1 implementation.
- T014 and T015 can run in parallel before US2 implementation.
- T019 and T020 can run in parallel before US3 implementation.
- T024, T025, and T026 can run in parallel after implementation; T027 and T028 follow their results.

## Parallel Example: User Story 1

```text
Task T007: Add component requirements coverage in proxbase-client/tests/unit/navigation.test.tsx
Task T008: Add browser coverage in proxbase-client/tests/e2e/navigation-sidebar.spec.ts
```

## Parallel Example: User Story 2

```text
Task T014: Add collapse and keyboard component coverage in proxbase-client/tests/unit/navigation.test.tsx
Task T015: Add responsive and collapsed browser coverage in proxbase-client/tests/e2e/navigation-sidebar.spec.ts
```

## Parallel Example: User Story 3

```text
Task T019: Add identity and privacy unit coverage in proxbase-client/tests/unit/user-initials.test.ts
Task T020: Add footer and Settings browser coverage in proxbase-client/tests/e2e/navigation-sidebar.spec.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and Phase 2 foundational tasks.
2. Complete Phase 3 User Story 1.
3. Run T024-T026 focused validation for the authenticated shell and Services flow.
4. Stop for MVP review: the shared authenticated sidebar and protected Services placeholder are usable.

### Incremental Delivery

1. Add US1 for the persistent shell and Services destination.
2. Add US2 for collapse/expand and responsive content separation.
3. Add US3 for identity initials and Settings navigation.
4. Complete Phase 6 cross-cutting validation and the quickstart scenarios.

## Notes

- Every task uses the required checkbox, sequential ID, optional parallel marker, story label in story phases, and an exact repository-relative file path.
- No backend or API tasks are included because the feature explicitly preserves the existing authentication and API contracts.
- Tests are included to satisfy the constitution's full test-pyramid requirement and the plan's explicit Vitest/Playwright validation design.
