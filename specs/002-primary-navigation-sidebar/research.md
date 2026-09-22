# Research: Primary Navigation Sidebar

## Decision: Use existing Material UI navigation primitives

**Decision**: Build the shell from the existing Material UI layout, navigation, icon-button, tooltip, avatar, and typography components. Use semantic navigation and button elements through the library rather than introducing a custom interaction system.

**Rationale**: The constitution requires Material UI for frontend UI and UX and requires semantic, keyboard-accessible controls. The client already includes Material UI and its icon package, so this satisfies the feature without a new dependency or a second visual language.

**Alternatives considered**: A custom CSS-only sidebar was rejected because it would duplicate accessibility behavior and conflict with the required component library. A new navigation library was rejected because the feature does not need a router or a third-party state solution.

## Decision: Keep navigation destinations data-driven and use native internal navigation

**Decision**: Represent sidebar destinations as a small ordered collection containing the label, path, icon, and active-state metadata. Render the current Services and future destinations from that collection. Use native internal links and browser history/popstate handling already available to the client rather than adding a routing dependency.

**Rationale**: The current application has no router dependency, and the feature only needs two authenticated placeholder destinations. A data-driven collection makes adding a future destination a local configuration change while native links preserve expected browser behavior, keyboard access, and direct navigation.

**Alternatives considered**: Adding React Router was rejected because it expands scope and dependency surface for two placeholder pages. Hard-coding separate navigation buttons was rejected because it makes future destinations require sidebar restructuring.

## Decision: Derive initials from presentation identity only

**Decision**: Prefer the authenticated user's display name, derive one initial for a single word and the first/last initials for multiple words, and fall back to the email identity when no usable name exists. Trim punctuation and whitespace, uppercase the result, limit it to two characters, and use `?` when neither presentation field is usable.

**Rationale**: The existing authenticated identity already supplies `name` and `email`, while `subject` is an internal identity key that must not be exposed. A deterministic two-character rule gives users a recognizable account marker without adding an API or profile model.

**Alternatives considered**: Showing the Entra subject was rejected because it is an internal identifier and violates the feature's privacy requirement. Adding an avatar image endpoint was rejected because profile imagery is out of scope.

## Decision: Reset collapsed state on a fresh shell mount

**Decision**: Start the sidebar expanded and keep collapse state in local component state. Preserve the state while navigating within the authenticated shell, but do not persist it across a full browser reload or session.

**Rationale**: This matches the spec assumption, avoids speculative preference storage, and keeps the first-use navigation labels discoverable. The state can be persisted later if a separate user-preference requirement is introduced.

**Alternatives considered**: Local storage persistence was rejected because it adds preference semantics and cross-session behavior that the feature explicitly excludes. A backend preference was rejected because it requires an API and data model change.

## Decision: Test behavior at three focused layers

**Decision**: Test initials and navigation-item metadata as pure/unit behavior, render the sidebar with Testing Library for accessibility and collapse interactions, and use Playwright for authenticated Services/Settings navigation, active states, responsive presentation, and the existing authentication boundary.

**Rationale**: This covers deterministic formatting cheaply, verifies semantic UI behavior in isolation, and proves the real user-facing shell without changing backend authentication contracts. It follows the repository's existing Vitest and Playwright patterns.

**Alternatives considered**: E2E-only coverage was rejected because initials and keyboard states would be slower and less diagnosable to validate there. Backend tests were rejected because this feature introduces no backend behavior.
