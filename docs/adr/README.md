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
| [0004](0004-canvas2d-cpu-pipeline.md) | Canvas 2D pixel pipeline on the main thread | Superseded by 0008 |
| [0005](0005-browser-native-decode-and-export.md) | Browser-native decoding and 8-bit export | Accepted |
| [0006](0006-single-admin-login-gate.md) | Single-admin login gate | Superseded by 0009 |
| [0007](0007-looks-presets-and-3d-luts.md) | Looks: presets combined with 3D LUTs | Accepted, first phase implemented |
| [0008](0008-webgl2-render-pipeline.md) | WebGL2 render pipeline with preview proxy | Accepted, implemented |
| [0009](0009-remove-login-gate.md) | Remove the login gate | Accepted |
| [0010](0010-non-destructive-crop-and-gesture-history.md) | Non-destructive crop and per-gesture history | Accepted |
| [0011](0011-looks-first-ui-and-japanese-palette.md) | Looks-first interface and Japanese colour palette | Accepted |

## Current architecture

```text
Browser (all image data stays here)
  File picker or drag and drop -> imageLoader -> HTMLImageElement
                                                       |
                  +------------------------------------+
                  |                                    |
                  v                                    v
         Preview proxy (2560 px)              Full-size source
                  |                                    |
  Zustand store: adjustments + crop + look             |
                  |        |                           |
                  |        +---> .cube LUT             |
                  v                                    v
       Renderer (WebGL2, or CPU fallback)     exportImage (tiles of 4096 px)
           |                |                          |
           v                v                          v
     visible canvas     Histogram               JPEG / PNG download

  LooksPanel: separate small renderer -> live thumbnails

Next.js (static pages, no image data)
  /            the editor
  /dev/parity  GPU checks, in development only
```

## Planned features versus the code

The root `README.md` lists only what exists today, and its roadmap lists what does not. As of 2026-11-05, these gaps remain.

| Feature | State of the code | ADR |
|---------|-------------------|-----|
| Importing `.cube` files, saving and sharing looks | Not implemented: second phase of ADR-0007 | 0007 |
| RAW support | Not implemented: only formats the browser decodes, with a clear message for RAW files | 0005 |
| 16-bit export and metadata preservation | Not implemented | 0005 |
| Export resize options | Not implemented | 0005 |
| Rotation, curves, local retouching | Not implemented | - |

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
- Before a significant change, check whether an ADR covers it. If the change contradicts an accepted ADR, raise it before going ahead.
- Keep the ADRs current as part of the work: when something is finished, tick the matching action items and update this page.

## About the retroactive records

ADRs 0001 to 0006 were written on 2026-11-05, after the code. The decisions themselves come from the code and git history, but neither records why they were made or which alternatives were weighed. Their **Context**, **Options Considered** and **Trade-off Analysis** sections are therefore a reconstruction, and each of these ADRs says so. The project owner should correct anything that does not match their actual reasoning.
