# ADR-0009: Remove the login gate

**Status:** Accepted
**Date:** 2026-11-05
**Deciders:** Gemukii

Supersedes [ADR-0006](0006-single-admin-login-gate.md).

## Context

ADR-0006 showed that the login gate gave no real protection: its session cookie was a constant in the source code. It also protected no data, because photos never reach the server ([ADR-0001](0001-local-first-browser-processing.md)). It did add friction, require a Node server, and contradict the README.

## Decision

Remove authentication entirely. The `/login` and `/logout` routes, the login UI, the cookie check, and the `ADMIN_EMAIL` and `ADMIN_PASSWORD` settings are all gone.

## Options Considered

The options are compared in ADR-0006. This ADR adopts its Option B, no authentication, over keeping the gate, signed sessions, and protection at the hosting layer.

## Trade-off Analysis

Anyone with the URL of a deployment can now open the app, but they can only use it on their own photos, and the server holds nothing to expose. A deployment that must stay private can add protection at the hosting layer, with no application code.

## Consequences

- The editor opens immediately, with no account.
- All routes are now prerendered as static content, so the app no longer needs a Node server at runtime.
- The false claims on the login page (cloud storage, handoff, team sharing) are gone with it.
- If server-side user data is ever introduced, authentication must be designed properly in a new ADR, which would also revisit ADR-0001.

## Action Items

1. [x] Remove the login and logout routes, the login UI, and the cookie check.
2. [x] Remove the "Sign out" link.
3. [ ] Add `output: 'export'` to the Next.js configuration when a static deployment is set up.
