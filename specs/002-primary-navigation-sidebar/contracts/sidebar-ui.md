# Sidebar UI Contract

This feature has no backend API contract. The following UI contract defines the authenticated shell behavior that tests and implementation must share.

## Authenticated Shell

- The sidebar is rendered only after the existing authentication boundary has a valid `AuthenticatedUser`.
- Every authenticated destination in this feature renders the same sidebar shell.
- Unauthenticated, loading, and authentication-error states continue to be owned by `ProtectedRoute`; they do not render an authenticated sidebar.

## Sidebar Regions

| Region | Expanded state | Collapsed state |
|---|---|---|
| Branding | Proxbase name/logo is visible and identifies the application. | A recognizable brand mark remains visible. |
| Navigation | Services icon and text label are visible; current destination is marked. | Services icon remains visible with an accessible name and discoverable label. |
| Collapse control | A control exposes an accessible action to collapse the panel. | A control exposes an accessible action to expand the panel. |
| User footer | Circular initials avatar and Settings icon/text action are visible and pinned to the bottom. | Circular initials avatar and Settings icon remain visible; actions retain accessible names. |

## Navigation Behavior

- Services navigates to the internal Services destination.
- Settings navigates to the internal Settings destination.
- The current destination has a visible and accessible active state.
- Re-selecting the current destination does not create duplicate history entries.
- Navigation does not trigger an authentication request while the existing session remains valid.
- The active destination is re-derived on browser back/forward navigation; if the current pathname matches no known destination, no navigation item is marked active.
- The destination collection is the single source for rendered navigation items so future items do not require a new sidebar structure.

## Identity Behavior

- The avatar uses display-name initials first, then email initials, then `?`.
- The avatar displays no more than two uppercase characters.
- The subject, session identifier, token, and raw claims are never displayed.

## Accessibility and Responsive Behavior

- The sidebar uses a semantic navigation landmark.
- Collapse/expand, navigation, and Settings controls are keyboard reachable and have meaningful accessible names.
- Collapsed icon-only actions provide a tooltip or equivalent discoverable label.
- At supported narrow widths, the sidebar and main content do not overlap, and the user footer remains available.

## Placeholder Destinations

- Services shows a non-blank authenticated placeholder page.
- Settings shows a non-blank authenticated placeholder page.
- Both pages retain the shared sidebar and current active state.
