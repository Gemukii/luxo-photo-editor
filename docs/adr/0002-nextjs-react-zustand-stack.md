# ADR-0002: Next.js, React, Tailwind and Zustand stack

**Status:** Accepted
**Date:** 2026-01-05 (recorded 2026-11-05)
**Deciders:** Gemukii

> Retroactive record. The decision comes from `package.json` and the code; the reasoning and options are reconstructed.

## Context

The editor is a highly interactive single-screen client application. It needs fast iteration on UI, shared state across panels, and a small amount of server logic for login.

## Decision

- **Framework:** Next.js 16 with the App Router, and React 19.
- **Language:** TypeScript, currently with `strict: false`.
- **Styling:** Tailwind CSS 3.
- **State:** a single Zustand store, `src/store/editorStore.ts`, shared by all editor components.

## Options Considered

### Option A: Next.js with Zustand (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium: the framework is larger than the app needs today |
| Cost | Free; needs a Node host while server features are used |
| Scalability | Not a concern, as compute is on the client |
| Team familiarity | High |

**Pros:** Routing and server actions are built in, the ecosystem is large, and Zustand updates components without provider boilerplate.

**Cons:** Almost all of the app is client code, so most of the framework's server features go unused.

### Option B: Vite single-page app with Zustand

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Free; static hosting only |
| Scalability | Not a concern |
| Team familiarity | High |

**Pros:** Simpler build, and a purely static deployment that matches [ADR-0001](0001-local-first-browser-processing.md).

**Cons:** No server code, so it cannot host the login gate of [ADR-0006](0006-single-admin-login-gate.md).

### Option C: Next.js with Redux Toolkit

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium to high |
| Cost | Free |
| Scalability | Not a concern |
| Team familiarity | Medium |

**Pros:** Mature dev tools and strict conventions.

**Cons:** More boilerplate than a single-developer editor store needs.

## Trade-off Analysis

The only feature that needs a server today is the login gate. If [ADR-0006](0006-single-admin-login-gate.md) is reversed, Next.js can still serve the app through static export, so the stack does not need to change. Migrating to Vite would bring little benefit for the effort.

Zustand fits well: canvas effects read state outside React through `useEditorStore.getState()`, which is awkward with context-based state.

## Consequences

- The store currently mixes three kinds of state: edit data (`adjustments`, `history`), UI state (`activeTab`), and non-serialisable browser objects (`HTMLImageElement`, `ImageData`, the canvas element). This makes it harder to persist or test edits.
- `strict: false` lets null errors through in the code that matters most.
- The project has no tests, no linter, and no CI, so a pipeline rewrite ([ADR-0008](0008-webgl2-render-pipeline.md)) would have no safety net.
- `@types/react` and `@types/react-dom` are on version 18 while the runtime is React 19.
- `react-dropzone` is declared but never imported.

## Action Items

1. [x] Align `@types/react` and `@types/react-dom` with React 19.
2. [x] Remove the unused `react-dropzone` dependency.
3. [x] Add a test runner and cover `src/lib` first.
4. [x] Enable `strict: true`.
5. [ ] Split the store into edit data and browser objects when [ADR-0007](0007-looks-presets-and-3d-luts.md) is implemented.
