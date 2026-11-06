# ADR-0007: Looks: presets combined with 3D LUTs

**Status:** Accepted (2026-11-05), first phase implemented
**Date:** 2026-11-05
**Deciders:** Gemukii

## Context

One-click results are the core of the product: someone with no colour-grading knowledge must be able to get a good image quickly. Nothing supports this today. `/presets` is a static mock-up that is not connected to the editor, and the editor's Presets tab shows the same panel as the Adjust tab.

Two techniques exist:

- A **preset** stores slider values. It is light and editable, but limited to what the sliders can do.
- A **3D LUT** maps every input colour to an output colour. It can express complex film-style colour, but it is opaque and cannot be edited.

## Decision

Introduce a single user-facing concept, the **Look**, which can combine both techniques. Users never need to know which one a Look uses.

```ts
interface Look {
  id: string
  name: string
  category: 'Landscape' | 'Portrait' | 'B&W' | 'Vintage'
  adjustments?: Partial<Adjustments>
  lut?: { src: string; size: number }
}

interface EditState {
  adjustments: Adjustments            // the user's own sliders
  look: { id: string; strength: number } | null  // strength from 0 to 1
}
```

**Render order:** `source -> (user adjustments + look adjustments x strength) -> LUT mixed by strength -> output`.

The LUT comes last because creative LUTs expect a correctly exposed input, so exposure and white balance corrections still work as users expect.

**Rules:**

- **Format:** `.cube` 3D LUTs, 33 points per axis by default.
- **Input:** sRGB creative LUTs only. Camera log LUTs would look wrong on this pipeline, so they are out of scope.
- **User interface:** a gallery in the editor's Presets tab shows each Look as a live thumbnail of the user's own photo. Clicking applies it, and one **Strength** slider is the only control a beginner needs.
- **Independence:** a Look is stored apart from the user's sliders, so switching Looks never erases manual edits.
- **Built-in Looks:** shipped as static assets, so they work without any network request.
- **User data (second phase):** imported `.cube` files and saved Looks are kept in IndexedDB on the device, consistent with [ADR-0001](0001-local-first-browser-processing.md).
- **Licensing:** ship only LUTs we created or have clear rights to. Third-party and commercial film emulation LUTs are not bundled.

## Options Considered

### Option A: Slider presets only

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | None |
| Scalability | Good: a few bytes per preset |
| Team familiarity | High |

**Pros:** Quick to build on [ADR-0003](0003-parametric-non-destructive-edits.md), and every value stays editable.

**Cons:** The current sliders cannot shift hues selectively, so film and cinematic looks are out of reach. The explicit LUT requirement goes unmet.

### Option B: LUTs only

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | Under 1 MB of text per LUT |
| Scalability | Good |
| Team familiarity | Low to medium |

**Pros:** Highest colour quality, and compatible with a large existing format.

**Cons:** Simple looks need a LUT file for what a few numbers could express.

### Option C: Unified Look with both techniques (recommended)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | As Option B, only for Looks that use a LUT |
| Scalability | Good |
| Team familiarity | Medium |

**Pros:** Covers everything with one simple user concept, and lets the catalogue start small and grow.

**Cons:** Two mechanisms to build and test, and a defined interaction between them.

## Trade-off Analysis

The target user wants a result, not a technique, so the technical split should stay hidden. Option C costs slightly more than Option B but keeps cheap looks cheap, and the Strength slider gives beginners real control without any colour vocabulary.

Applying a LUT costs more per pixel than the current sliders, which are already too slow at full size ([ADR-0004](0004-canvas2d-cpu-pipeline.md)). Trilinear interpolation in JavaScript would make this worse. [ADR-0008](0008-webgl2-render-pipeline.md) should come first, or at the very least its preview proxy.

## Consequences

- The feature that defines the product becomes real.
- `EditSnapshot` ([ADR-0010](0010-non-destructive-crop-and-gesture-history.md)) must gain the `look` field.
- `/presets` is replaced by the in-editor gallery, or becomes a page for managing Looks.
- A set of good Looks has to be designed and tested on varied photos. This is creative work, and it matters as much as the code.
- Thumbnails need a fast small-image render path.
- Looks are tuned against the current pipeline: changing the colour maths later would change how they render.

## Action Items

1. [x] Project owner: accept or amend this ADR.
2. [x] Add `look` to the edit state and to `EditSnapshot`.
3. [x] Write and test a `.cube` parser, rejecting 1D LUTs and malformed files with a clear message.
4. [x] Build the gallery and Strength slider in the Presets tab.
5. [x] Create a first set of 8 to 12 Looks, with clear licensing. The first set has 11 Looks. `scripts/generate-luts.mjs` defines the 8 LUTs, so the project owns them. They still need tuning on real photos.
6. [ ] Second phase: import `.cube` files, save custom Looks, and export Looks as JSON.
