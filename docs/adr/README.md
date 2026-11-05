# Architecture Decision Records

This folder records the significant architecture decisions behind LUXO: what was decided, why, and what it costs.

## Product goal

LUXO is a photo editor for the photos you already have. It offers two ways to work:

1. **Manual editing**, Lightroom-style: exposure, tone, colour, crop, histogram.
2. **One-click looks**: predefined filters and LUTs that give a good result quickly, with no colour-grading knowledge needed.

The product, its code, and its documentation are in English only.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-local-first-browser-processing.md) | Local-first, browser-only image processing | Accepted |
| [0002](0002-nextjs-react-zustand-stack.md) | Next.js, React, Tailwind and Zustand stack | Accepted |
| [0003](0003-parametric-non-destructive-edits.md) | Parametric, non-destructive edit model | Accepted, amended by 0010 |
| [0004](0004-canvas2d-cpu-pipeline.md) | Canvas 2D pixel pipeline on the main thread | Accepted, to be superseded by 0008 once it is implemented |
| [0005](0005-browser-native-decode-and-export.md) | Browser-native decoding and 8-bit export | Accepted |
| [0006](0006-single-admin-login-gate.md) | Single-admin login gate | Superseded by 0009 |
| [0007](0007-looks-presets-and-3d-luts.md) | Looks: presets combined with 3D LUTs | Accepted, not yet implemented |
| [0008](0008-webgl2-render-pipeline.md) | WebGL2 render pipeline with preview proxy | Accepted, not yet implemented |
| [0009](0009-remove-login-gate.md) | Remove the login gate | Accepted |
| [0010](0010-non-destructive-crop-and-gesture-history.md) | Non-destructive crop and per-gesture history | Accepted |

## Current architecture

```text
Browser (all image data stays here)
  File picker or drag and drop -> imageLoader -> HTMLImageElement
                                                       |
                                                       v
  EditorCanvas -> originalImageData (full-size RGBA, 8-bit, never replaced)
                                                       |
  Zustand store: adjustments + crop ---> render (CPU, main thread)
                                           |                     |
                                           v                     v
                                     visible <canvas>     ExportModal (renderEdit)
                                           |                     |
                                           v                     v
                                   320 px preview          JPEG / PNG download
                                           |
                                           v
                                       Histogram

Next.js (static pages, no image data)
  /         the editor
  /presets  client-side mock-up, not connected to the editor
```

## Planned features versus the code

The root `README.md` lists only what exists today, and its roadmap lists what does not. As of 2026-11-05, these gaps remain.

| Feature | State of the code | ADR |
|---------|-------------------|-----|
| One-click looks, filters and LUTs | Not implemented: `/presets` is static mock data, and the Presets tab shows the Adjust panel | 0007 |
| Instant feedback on large photos | CPU loop on the main thread, about 0.9 to 3.1 s per change at 24 MP | 0004, 0008 |
| RAW support | Not implemented: only formats the browser decodes, with a clear message for RAW files | 0005 |
| 16-bit export and metadata preservation | Not implemented | 0005 |
| Export resize options | Not implemented | 0005 |
| Retouch, Curves, Text and Frames tools | Sidebar buttons with no action | - |

## Maintaining these records

**When to write an ADR:** any change that would be expensive to reverse or that a future reader would question, such as a new dependency with architectural weight, a change to the render pipeline or data model, a storage or auth choice, or a new file format. Bug fixes and routine features do not need one.

**How:**

1. Copy [template.md](template.md) to `NNNN-short-title.md`, using the next free number.
2. Add a row to the index above.
3. Update the architecture diagram and the table of planned features if they changed.

**Rules:**

- Records are immutable once accepted, except for status, links, ticking action items, and dated corrections of factual errors. To change a decision, write a new ADR and mark the old one `Superseded by ADR-NNNN`.
- Status values are `Proposed`, `Accepted`, `Deprecated` and `Superseded`.
- A `Proposed` ADR becomes `Accepted` only when the project owner approves it.

## About the retroactive records

ADRs 0001 to 0006 were written on 2026-11-05, after the code. The decisions themselves come from the code and git history, but neither records why they were made or which alternatives were weighed. Their **Context**, **Options Considered** and **Trade-off Analysis** sections are therefore a reconstruction, and each of these ADRs says so. The project owner should correct anything that does not match their actual reasoning.
