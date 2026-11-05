# ADR-0006: Single-admin login gate

**Status:** Superseded by [ADR-0009](0009-remove-login-gate.md)
**Date:** 2026-01-06 (recorded 2026-11-05)
**Deciders:** Gemukii

> Retroactive record. The decision comes from the code; the reasoning and options are reconstructed. The intent behind this gate needs confirming by the project owner.

## Context

Commit `5fec10e` added login and logout, which conflicts with the README ("no accounts") and raises a question: what does the gate protect? Under [ADR-0001](0001-local-first-browser-processing.md) no user photos ever reach the server, so the gate can only restrict who can open the app.

## Decision

The editor route (`/`) checks for a cookie. A server action compares the submitted email and password with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables and, if they match, sets `luxo-session=admin-auth` for 24 hours.

## Options Considered

### Option A: Env-var credentials with a fixed cookie (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | None |
| Scalability | One user |
| Team familiarity | High |

**Pros:** No database and no dependencies.

**Cons:** Not secure, as described under Trade-off Analysis.

### Option B: No authentication

| Dimension | Assessment |
|-----------|------------|
| Complexity | None: removes code |
| Cost | None; allows static hosting |
| Scalability | Unlimited |
| Team familiarity | High |

**Pros:** Matches the README and ADR-0001, removes the need for a Node server, and takes the user straight to their photos.

**Cons:** Anyone with the URL can open the app, though they can only use it on their own photos.

### Option C: Signed sessions, or an auth library

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | Low |
| Scalability | Good |
| Team familiarity | Medium |

**Pros:** Real protection, and the foundation for user accounts if they are ever needed.

**Cons:** Adds machinery to protect a tool that holds no server-side data.

### Option D: Protection at the hosting layer

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Depends on the host |
| Scalability | Good |
| Team familiarity | Medium |

**Pros:** Keeps a deployment private with no application code.

**Cons:** Tied to one hosting provider.

## Trade-off Analysis

The gate does not provide real access control:

- The cookie value is a constant in the source code. Setting `luxo-session=admin-auth` by hand bypasses the login without any password.
- The cookie has no `secure` or `sameSite` attribute.
- Login attempts are not rate limited.
- `/presets` is not protected at all.

**Recommendation:** Option B. No photo or user data sits behind the gate, so removing it loses no protection. If the deployment must stay private, Option D achieves that without application code. Option C only makes sense if server-side user data is introduced, which would itself require revisiting ADR-0001.

## Consequences

- While the gate stays, the app needs a Node server and cannot be statically hosted.
- The user has to log in before editing, which adds friction for a personal tool.
- The cookie constant is duplicated in `src/app/page.tsx`, `src/app/login/page.tsx` and `src/app/logout/route.ts`.
- The login page advertises encrypted cloud storage, handoff, and team sharing, none of which exist.
- Not verified: `LoginPage` reads `searchParams` synchronously, but Next.js 16 passes it as a Promise, so login error messages may never appear.

## Action Items

1. [x] Project owner: choose between keeping or removing the gate, and record the outcome in a new ADR that supersedes this one.
2. [ ] If the gate is kept, replace the fixed cookie with a signed session.
3. [x] Remove the false marketing copy from the login page in either case.
