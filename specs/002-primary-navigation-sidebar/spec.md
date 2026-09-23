# Feature Specification: Primary Navigation Sidebar

**Feature Branch**: `002-primary-navigation-sidebar`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Build the primary navigation sidebar for Proxbase's frontend. This is spec 002, following the existing spec 001. The sidebar is a persistent, collapsible left-hand navigation panel present on all authenticated pages. From top to bottom it contains app branding, a Services navigation item, and a user footer with the current user's initials and a Settings action. Services and Settings may be minimal placeholder pages for now."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Authenticated Workspace (Priority: P1)

As an authenticated Proxbase user, I want a consistent sidebar on every authenticated page so that I can identify the application and move between available workspace areas.

**Why this priority**: Reliable primary navigation is the foundation for every authenticated workflow that follows.

**Independent Test**: Sign in, view the authenticated landing page, select Services, and verify that the destination changes while the sidebar remains available.

**Acceptance Scenarios**:

1. **Given** an authenticated user opens any authenticated page, **When** the page finishes loading, **Then** the left-hand sidebar is visible with Proxbase branding, a Services navigation item, and the user footer.
2. **Given** an authenticated user selects Services, **When** navigation completes, **Then** the user reaches the Services page and the Services item is visibly marked as the current destination.
3. **Given** an unauthenticated user requests an authenticated page, **When** the authentication guard handles the request, **Then** the user is sent through the existing sign-in flow and does not see the sidebar before authentication succeeds.

---

### User Story 2 - Collapse Navigation for More Workspace (Priority: P1)

As an authenticated Proxbase user, I want to collapse and expand the sidebar so that I can choose between navigation context and more room for the page I am using.

**Why this priority**: The sidebar must support both discoverable navigation and efficient use of limited screen space.

**Independent Test**: Open an authenticated page, collapse the sidebar, verify that icon-only navigation remains usable, expand it again, and verify that labels return.

**Acceptance Scenarios**:

1. **Given** the sidebar is expanded, **When** the user activates its collapse control, **Then** the sidebar becomes compact, navigation labels are hidden, and the navigation icons remain visible and usable.
2. **Given** the sidebar is collapsed, **When** the user activates its expand control, **Then** the sidebar returns to its expanded presentation with branding and navigation labels visible.
3. **Given** the sidebar is collapsed, **When** the user moves between authenticated pages, **Then** the compact state and all navigation actions remain usable without causing page content to overlap or become inaccessible.

---

### User Story 3 - Identify Account and Open Settings (Priority: P2)

As an authenticated Proxbase user, I want to see which account is active and open Settings from the sidebar so that account-related controls have a predictable home.

**Why this priority**: Users need confidence about the active identity and a stable location for future preferences and account controls.

**Independent Test**: Sign in with a known identity, inspect the user footer, and select the Settings action.

**Acceptance Scenarios**:

1. **Given** an authenticated user has a name, **When** the sidebar is displayed, **Then** the user footer shows a circular avatar containing initials derived from that name.
2. **Given** an authenticated user has no usable name but has an email address, **When** the sidebar is displayed, **Then** the avatar shows initials derived from the available email identity.
3. **Given** an authenticated user selects the Settings action, **When** navigation completes, **Then** the user reaches the Settings page and the sidebar remains available.
4. **Given** the Settings page is otherwise not yet implemented, **When** the user opens it, **Then** they see a clear placeholder page rather than a broken route or blank content.

### Edge Cases

- If the authenticated identity has neither a usable display name nor an email address, show a stable fallback avatar such as `?` without exposing an internal identifier.
- If a display name contains multiple words, derive initials from the first and last meaningful words and limit the avatar to two characters.
- If the display name or email contains punctuation, whitespace, or mixed casing, initials remain legible and consistently formatted.
- If a user activates the current Services or Settings destination again, the page remains stable and does not create duplicate navigation history entries.
- If the viewport is narrow, the sidebar and page content remain usable without clipping interactive controls or hiding the user footer.
- If the sidebar is collapsed, icon-only controls must still expose accessible names and tooltips or equivalent discoverable labels.
- If a session expires while an authenticated page is open, the existing authentication behavior takes precedence and the sidebar must not remain presented as authenticated after the user is redirected.
- If the user navigates using the browser's back or forward controls, or requests an internal path that matches no known destination, the active-destination indicator updates accordingly, showing no item as active for an unrecognized path.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST display a persistent left-hand sidebar on every authenticated page.
- **FR-002**: The sidebar MUST display the Proxbase application name or logo at its top.
- **FR-003**: The sidebar MUST provide a Services navigation item with an icon and text label when expanded.
- **FR-004**: Selecting Services MUST navigate the user to a Services page without requiring re-authentication while the existing session is valid. Services is a protected page.
- **FR-005**: The Services page MUST provide a clear minimal placeholder state until Services functionality is separately specified.
- **FR-006**: The sidebar navigation MUST support adding future destinations without changing the sidebar's overall structure or interaction model.
- **FR-007**: The sidebar MUST provide a control that collapses and expands the navigation panel.
- **FR-008**: In its collapsed state, the sidebar MUST preserve access to every available navigation action through visible icons with accessible names.
- **FR-009**: The sidebar MUST consist of a fixed header (top, containing branding), a body (containing navigation items), and a fixed footer (bottom, containing the user footer). The header and footer MUST remain fixed in place in both expanded and collapsed states; the body MUST scroll independently, without affecting the header or footer, if its content exceeds the available height.
- **FR-010**: The user footer MUST display a circular avatar representing the currently authenticated user.
- **FR-011**: The avatar MUST derive initials from the authenticated user's display name, falling back to the user's email identity when a display name is unavailable.
- **FR-012**: The avatar MUST use a safe, stable fallback when no usable display name or email identity is available and MUST NOT expose an internal subject or session identifier.
- **FR-013**: The user footer MUST provide a Settings action with a recognizable settings icon.
- **FR-014**: Selecting Settings MUST navigate the user to a Settings page without requiring re-authentication while the existing session is valid. Settings is a protected page.
- **FR-015**: The Settings page MUST provide a clear minimal placeholder state until Settings functionality is separately specified.
- **FR-016**: The sidebar, its collapse control, and all navigation actions MUST be keyboard accessible and expose meaningful accessible names.
- **FR-017**: The sidebar MUST remain usable at viewport widths below 600px (the narrow-viewport threshold) without overlapping the page content or hiding required controls; below this threshold, the sidebar MUST push the main content rather than overlap it.
- **FR-018**: The sidebar MUST remain subject to the existing authentication guard and MUST NOT be rendered as authenticated content for an unauthenticated or expired-session user.
- **FR-019**: The sidebar MUST re-derive its active destination indicator from the current internal pathname on every navigation, including browser back/forward navigation, and MUST show no destination as active when the current pathname does not match a known destination.

### Key Entities

- **Authenticated Identity**: The currently signed-in user's display name and email identity used to represent the active account in the sidebar.
- **Navigation Destination**: A named authenticated page, its icon and label, and the active-state information needed to orient the user.
- **Sidebar State**: The expanded or collapsed presentation of the persistent navigation panel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authenticated pages expose the same sidebar structure with branding, Services navigation, and user footer available without additional authentication.
- **SC-002**: At least 95% of first-time users can reach the Services page from an authenticated page within 10 seconds without using the browser address bar.
- **SC-003**: Users can collapse or expand the sidebar with one deliberate control action, and the state transition completes within 1 second in 95% of observed interactions.
- **SC-004**: 100% of sidebar actions remain operable by keyboard and have an accessible name in both expanded and collapsed states.
- **SC-005**: At least 95% of tested authenticated identities display recognizable initials or the defined safe fallback, with no session identifiers or internal subject values exposed.
- **SC-006**: 100% of Services and Settings navigation attempts reach a non-blank destination page or a clear placeholder state without broken-route errors.
- **SC-007**: In responsive testing at desktop widths and at widths below the 600px narrow-viewport threshold defined in FR-017, 100% of required sidebar controls remain visible or directly accessible without overlapping the main page content.

## Assumptions

- The existing Microsoft Entra ID authentication and backend-owned session remain the source of the authenticated identity; this feature does not add account management or a second identity lookup.
- All destinations in this feature are authenticated pages and remain protected by the existing authentication guard.
- Services and Settings are intentionally placeholder destinations; their business workflows, data, and permissions are out of scope.
- The sidebar is expanded by default for discoverability, and the collapse state does not need to persist across browser sessions unless later specified.
- The existing frontend design system and icon set are used; no new third-party dependency is introduced for this feature.
- Responsive behavior may adapt the panel presentation on narrow viewports, provided the required navigation and account actions remain accessible.

## Out of Scope

- Services inventory, provisioning, monitoring, or any other Services page business functionality.
- Settings preferences, profile editing, account switching, or tenant administration.
- Role-based navigation visibility or authorization differences between authenticated users.
- Persistent storage of the user's sidebar preference across sessions or devices.
- Changes to Microsoft Entra ID authentication, session lifetime, sign-out semantics, or backend API contracts.
- Additional navigation destinations beyond Services and Settings.
