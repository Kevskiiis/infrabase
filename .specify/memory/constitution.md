<!--
Sync Impact Report
- Version change: 1.0.0
- Modified principles: I (OIDC-Only Identity, Backend-Owned Sessions)
  — restored cryptographically-random session ID requirement,
  specified SameSite=Lax
- Added principles: VII (Idempotent Provisioning), VIII (Async Job
  Tracking), IX (Secrets Never in Code or Logs), X (Diagnosable
  Failures)
- Sections added: none
- Follow-up TODOs: none
-->

# Infrabase Constitution

## Purpose
A self-service, "AWS at home" style platform for provisioning VMs on
a local Proxmox instance. A web app lets you request VM builds and
startups for various purposes, which calls a backend API, which
triggers a specific Terraform module (via HCP Terraform's Runs API)
to provision the VM against the Proxmox provider, using prebuilt
Packer images as the base.

## Stack
- Backend: Python 3, FastAPI
- Frontend: TypeScript + React, Material UI, Vite
- Authentication: Microsoft Entra ID (OIDC)
- Infrastructure: HCP Terraform (Runs API), Proxmox provider, Packer
  base images
- Database: none at this time — do not introduce one speculatively
- Session store: Redis (session-ID cookie, HttpOnly/Secure/SameSite=Lax,
  short-lived)
- No new third-party dependencies without explicit approval in the spec
- TLS/HTTPS: terminated externally (reverse proxy/Tailscale) — the app assumes it is always served over HTTPS and never handles certificates itself.

## Core Principles

### I. OIDC-Only Identity, Backend-Owned Sessions
Identity comes exclusively from Microsoft Entra ID via OIDC — there
is no local username/password store, and the backend never issues
tokens that impersonate or replace an Entra-issued token. On initial
sign-in, the backend validates the Entra token against Entra's JWKS
endpoint, then creates a session in Redis keyed to the validated user
data. The session identifier is generated with a cryptographically
secure random generator — never a predictable or sequential value —
and stored in an HttpOnly, Secure, SameSite=Lax cookie. The backend
looks up that session in Redis on each request rather than
re-validating the Entra token every time. Sessions are short-lived,
matching a typical browser session, and are never treated as a
system of record — Entra ID remains the source of truth for identity.

### II. Terraform via Runs API Only
The backend MUST NOT invoke the Terraform CLI directly, locally or
in-process. All provisioning actions go through HCP Terraform's Runs
API against the appropriate workspace. Terraform configuration lives
in a separate repository from the backend API and is never bundled
into or executed from the API's own runtime.

### III. Fixed API Error Contract
All API errors return a structured `{error, code, detail}` JSON
body. Raw tracebacks, unstructured error strings, or ad hoc error
shapes are never returned to a client, in any environment.

### IV. Full Test Pyramid Required
Every new endpoint or feature requires unit tests for its logic,
integration tests for its API contract, and an end-to-end test
covering its real user-facing flow (including, where relevant, the
actual Terraform Runs API call path against a test workspace). A
feature is not complete until all three levels pass.

### V. Simplicity Over Speculative Design
The simplest design that satisfies the current requirement is
preferred. No database, caching layer, queue, or new abstraction is
introduced ahead of an actual, current need. Speculative
configurability is avoided in favor of hardcoding what is true today
and revisiting it when it changes.

### VI. Semantic HTML for Accessibility
Frontend components use semantic HTML elements (`<button>`, `<nav>`,
`<label>`, heading levels, etc.) rather than generic `<div>`/`<span>`
with added behavior. Interactive elements are keyboard-navigable and
screen-reader accessible. Material UI components are used as
provided rather than overridden in ways that strip their built-in
accessibility semantics.

### VII. Idempotent Provisioning
A resubmitted or retried provisioning request MUST NOT create a
duplicate VM. Provisioning requests carry a client-generated
idempotency key; the backend MUST check for an existing run under
that key before triggering a new HCP Terraform run, and MUST return
the status of the existing run instead of starting a second one.

### VIII. Async Job Tracking
VM provisioning is long-running and MUST NOT be modeled as a
synchronous request/response. The backend returns a job reference
immediately, and the frontend polls a status endpoint for that job
until it reaches a terminal state (succeeded, failed). Job state is
tracked in Redis alongside session data; a job's state MUST always
map to the underlying HCP Terraform run's actual status, not an
independently-drifting local guess.

### IX. Secrets Never in Code or Logs
Entra ID client secrets, HCP Terraform API tokens, and any other
credential are read from environment-aware configuration, never
hardcoded or committed to source control. Logs, error responses, and
client-facing output MUST NOT contain secret values, even in
development.

### X. Diagnosable Failures
When a provisioning job fails, the failure MUST be traceable back to
its HCP Terraform run (run ID, error summary) without requiring
manual log spelunking. The status endpoint surfaces enough detail
for the user to know whether the failure is retryable or requires
intervention.

### XI. Bounded Resource Provisioning
The platform enforces a hard limit on concurrent VMs and/or total
allocated resources (CPU, RAM, storage) before triggering a new
Terraform run. A request that would exceed the limit is rejected
with a clear error, not queued indefinitely or silently throttled.
The limit is defined in configuration, not hardcoded per-request.

### XII. Platform-Managed Resource Identification
Every VM provisioned through this platform is tagged and named in a
way that unambiguously identifies it as platform-managed (e.g. a
consistent naming prefix and a Proxmox tag). This distinguishes
platform-created VMs from anything provisioned manually, and makes
cleanup, auditing, and the resource limit in Principle XI enforceable
against an accurate count.

### XIII. Explicit API Contracts
The backend's OpenAPI schema is the single source of truth for
request/response shapes. The frontend consumes a TypeScript client
generated from that schema rather than hand-written or duplicated
types. A backend change that alters a contract requires regenerating
the frontend client as part of the same change, not a follow-up.

### XIV. Test Isolation from Real Infrastructure
Unit and integration tests mock Entra ID, HCP Terraform's Runs API,
and Redis — they MUST NOT make real network calls to any of them.
Only end-to-end tests are permitted to exercise real (test-workspace)
infrastructure, per Principle IV.

### XV. CI-Enforced Quality Gate
Continuous integration runs the full test pyramid (Principle IV) and
lint/build checks on every change. A change MUST NOT merge with a
failing check. Any exception is explicitly documented in the PR, not
silently bypassed.

## Repository & Workspace Structure
Terraform configuration and the backend API live in separate
repositories. HCP Terraform workspaces are separated by service
(e.g. a dedicated `virtual-machine` workspace) rather than combined
into a single shared workspace. Packer-built images are treated as
pre-existing inputs to Terraform, not something the backend or
Terraform config builds on demand.

## Development Workflow
Work is organized around small, reviewable changes. Before a feature
is considered implemented: unit, integration, and E2E tests pass;
CORS and other production-facing settings are explicit (not
inherited from development defaults); and any deviation from this
constitution is called out explicitly rather than silently merged.

## Governance
This constitution governs project decisions and supersedes
conflicting informal practice. Amendments must state the motivation,
the affected principle(s), and any migration impact, and must update
the Sync Impact Report in the same change.

Versioning is semantic: MAJOR for backward-incompatible governance
changes, MINOR for new or materially expanded principles, PATCH for
wording clarifications with no behavioral change.

**Version**: 1.0.0 | **Ratified**: 2026-09-15 | **Last Amended**: 2026-09-15