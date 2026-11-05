# ADR-0008: WebGL2 render pipeline with preview proxy

**Status:** Accepted (2026-11-05), supersedes [ADR-0004](0004-canvas2d-cpu-pipeline.md) once implemented
**Date:** 2026-11-05
**Deciders:** Gemukii

## Context

The current pipeline takes about 0.9 to 3.1 seconds per slider change on a 24 MP image, and freezes the UI meanwhile ([ADR-0004](0004-canvas2d-cpu-pipeline.md)). A Lightroom-like tool needs feedback as the slider moves, and Looks ([ADR-0007](0007-looks-presets-and-3d-luts.md)) add a 3D LUT lookup per pixel as well as a gallery of live thumbnails.

## Decision

Move rendering to a WebGL2 fragment shader, in a new `src/lib/render/` module with no React dependency:

- **Interactive view:** render a preview proxy, an image downscaled to fit the display, so cost does not depend on the camera's resolution.
- **Export:** render the full-size source off screen through the same shader, tiling when the image exceeds the GPU's `MAX_TEXTURE_SIZE`.
- **LUTs:** upload as `TEXTURE_3D` in `RGBA16F`, which WebGL2 can filter natively, giving hardware trilinear interpolation with no banding from 8-bit LUT storage.
- **Histogram and thumbnails:** computed from small renders of the same pipeline.
- **Reference implementation:** keep `applyAdjustments` as pure TypeScript for tests, and as a fallback when WebGL2 is unavailable.
- **Entry point:** the new renderer replaces `renderEdit`, which display and export already share.

## Options Considered

### Option A: Keep Canvas 2D, add a preview proxy

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | None |
| Scalability | Medium: fast preview, slow export |
| Team familiarity | High |

**Pros:** A small change with an immediate benefit. A 2 MP proxy would take very roughly 80 to 260 ms, extrapolating from the ADR-0004 measurements.

**Cons:** Still not smooth, still on the main thread, and LUTs make it slower.

### Option B: Web Worker with a preview proxy

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | None |
| Scalability | Medium |
| Team familiarity | Medium |

**Pros:** The UI stays responsive, and the existing code can be reused.

**Cons:** Same render speed, with results arriving late. It solves the freezing but not the slowness.

### Option C: WebGL2 with a preview proxy (recommended)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium to high |
| Cost | None |
| Scalability | High |
| Team familiarity | Low to medium |

**Pros:** Per-pixel work suits GPUs, 3D LUT interpolation comes from hardware, browser support is broad, and it delivers the README's GPU claim.

**Cons:** Shader code is harder to debug, GPU memory and texture size limits vary by device, and the context can be lost.

### Option D: WebGPU

| Dimension | Assessment |
|-----------|------------|
| Complexity | High |
| Cost | None |
| Scalability | High |
| Team familiarity | Low |

**Pros:** Modern API, with compute shaders that would suit histograms and heavier future effects.

**Cons:** Availability still varies across browsers, operating systems and drivers, so a second renderer would be needed. This project's effects do not need its extra power.

## Trade-off Analysis

Option A is a useful first step but not a destination. Option B moves the problem without solving it. Option C is the smallest change that meets both the speed requirement and the LUT requirement. Option D stays open: with the renderer isolated in `src/lib/render/`, it could be swapped later.

The main risk is a rewrite with no safety net, as the project has no tests. Golden-image comparisons against the TypeScript reference address this directly.

## Consequences

- Slider feedback no longer depends on the photo's resolution.
- Memory pressure on the main thread drops, as full-size `ImageData` no longer has to be held for rendering.
- [ADR-0007](0007-looks-presets-and-3d-luts.md) can use LUTs and live thumbnails at no real cost.
- Two implementations must stay in sync, which the golden tests enforce.
- Export needs tiling, and tile boundaries must stay invisible. This matters most if sharpening is added, as it reads neighbouring pixels.
- GPU context loss must be handled, as must very large images on low-end devices.
- Open question: moving to linear-light processing would give true exposure stops, but it changes how every slider feels. If it is wanted, it should happen before Looks are tuned.

## Action Items

1. [x] Project owner: accept or amend this ADR.
2. [x] Add tests for `applyAdjustments` as the reference implementation.
3. [ ] Add the preview proxy first, as an immediate gain.
4. [ ] Build `src/lib/render/`, porting adjustments to GLSL with golden-image tests.
5. [ ] Add the 3D LUT stage.
6. [ ] Implement full-size tiled export, and test it at 45 MP.
7. [ ] Measure real browser timings, and record them here.
8. [ ] Decide on linear-light processing before tuning Looks.
