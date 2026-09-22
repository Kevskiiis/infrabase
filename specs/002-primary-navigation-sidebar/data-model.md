# Data Model: Primary Navigation Sidebar

## Authenticated Identity

The existing authenticated user presented by `useAuth()` and used by the sidebar footer.

| Field | Rule |
|---|---|
| `name` | Preferred display identity; may be absent or blank. Used first for initials. |
| `email` | Fallback display identity; may be absent or blank. Used only when `name` is unusable. |
| `subject` | Internal stable identity key; never rendered in the avatar, labels, routes, or errors. |

No new identity fields or API calls are introduced.

## Navigation Destination

A sidebar destination rendered from an ordered, extensible collection.

| Field | Rule |
|---|---|
| `label` | Human-readable destination name, currently `Services` and `Settings`. |
| `path` | Safe internal application path used by the browser link. |
| `icon` | Material UI icon component that remains visible when the sidebar is collapsed. |
| `location` | Navigation or footer grouping that determines placement. |
| `active` | Derived from the current browser pathname on every navigation, including browser back/forward; no destination is marked active when the current pathname matches no known destination. |

The collection must allow a future destination to be added without changing the sidebar layout structure.

## Sidebar State

Local presentation state for the authenticated shell.

| State | Meaning |
|---|---|
| `expanded` | Branding and navigation labels are visible; default state on a fresh shell mount. |
| `collapsed` | The panel is compact; icons and accessible names remain available. |

State transitions are user-triggered through the collapse/expand control and do not require an API call or persistence.

## User Initials

A derived presentation value, not a persisted entity.

Validation and derivation rules:

1. Trim leading/trailing whitespace and ignore empty identity values.
2. Use the display name when usable; otherwise use the email identity.
3. For one meaningful word, use its first alphanumeric character.
4. For multiple meaningful words, use the first character of the first and last words.
5. Uppercase the result and limit it to two characters.
6. If neither source is usable, return `?`.

Internal subjects, session identifiers, credentials, and raw provider claims are never valid input for display.

## Placeholder Page

An authenticated destination that proves navigation works while its feature is out of scope.

| Destination | Required presentation |
|---|---|
| Services | Non-blank page with a clear Services heading and placeholder state. |
| Settings | Non-blank page with a clear Settings heading and placeholder state. |

Both destinations remain behind the existing protected route and share the sidebar shell.
