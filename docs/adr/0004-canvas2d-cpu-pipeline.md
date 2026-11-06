# ADR-0004: Canvas 2D pixel pipeline on the main thread

**Status:** Superseded by [ADR-0008](0008-webgl2-render-pipeline.md)
**Date:** 2026-01-05 (recorded 2026-11-05)
**Deciders:** Gemukii

> Retroactive record. The decision comes from the code; the reasoning and options are reconstructed. The measurements are real.

## Context

The first version needed working adjustments quickly, with as little infrastructure as possible.

## Decision

`applyAdjustments` (`src/lib/imageProcessor.ts`) is a JavaScript loop over every pixel of the full-size image. It runs on the main thread after a 16 ms debounce, and the result is written with `putImageData`. A 320 px preview feeds the histogram.

## Options Considered

### Option A: JavaScript loop on Canvas 2D (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | None |
| Scalability | Poor: time grows linearly with pixel count |
| Team familiarity | High |

**Pros:** About 120 lines, easy to read and debug, and pure enough to unit test.

**Cons:** Blocks the UI, and it does not reach interactive speed on real camera files.

### Option B: CSS or canvas filters

| Dimension | Assessment |
|-----------|------------|
| Complexity | Very low |
| Cost | None |
| Scalability | Good |
| Team familiarity | High |

**Pros:** Fast, with almost no code.

**Cons:** Fixed vocabulary: no highlights, shadows, vibrance or LUTs.

### Option C: GPU shaders

Evaluated in [ADR-0008](0008-webgl2-render-pipeline.md). They were more than a first version needed.

## Trade-off Analysis

The approach was reasonable for a prototype: it proved the adjustments and the UI with minimal code. It does not meet the product goal of instant feedback.

**Measured time per render of `applyAdjustments`:**

| Image | One slider active | All implemented sliders active | One RGBA buffer |
|-------|-------------------|--------------------------------|-----------------|
| 12 MP | 398 ms | 1,558 ms | 46 MiB |
| 24 MP | 914 ms | 3,132 ms | 92 MiB |
| 45 MP | 1,730 ms | 5,894 ms | 173 MiB |

Median of 5 runs after a warm-up, on 2026-11-05, on the development machine with Node 25 (V8, the same JavaScript engine as Chrome). The input was pseudo-random pixels, which may be harder on the branches in the loop than a real photo. Times exclude `putImageData`, the preview and the histogram, so treat these numbers as an order of magnitude rather than browser timings.

A 60 fps target allows 16 ms per frame. At 24 MP the loop is 50 to 200 times too slow, and the UI freezes for the whole render.

## Consequences

- The README's "instantly with GPU acceleration" claim is not true today.
- A render keeps at least three full-size buffers alive: the original, the processed copy, and the canvas. That is about 275 MiB at 24 MP.
- Colour maths operates on gamma-encoded sRGB values, so `exposure` is not a true photographic stop, and the tone sliders use hard thresholds (128, 180, 75) that can create visible transitions.
- Known bugs in this pipeline:
  - The preview is drawn from the canvas before the new result is written (`EditorCanvas.tsx:258` runs before `:295`), so the histogram is one render behind. **Correction (2026-11-05):** the `Histogram` component was not mounted anywhere at the time, so no histogram was visible at all. It is now shown in the Adjustments panel.
  - The before/after divider and labels are drawn on the same canvas that export reads (`ExportModal.tsx:35`). Exporting with comparison on bakes them into the file.

## Action Items

1. [x] Fix the stale histogram.
2. [x] Render export from the source, independently of the on-screen canvas.
3. [x] Decide on [ADR-0008](0008-webgl2-render-pipeline.md).
