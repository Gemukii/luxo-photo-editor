# ADR-0010: Non-destructive crop and per-gesture history

**Status:** Accepted
**Date:** 2026-11-05
**Deciders:** Gemukii

Amends [ADR-0003](0003-parametric-non-destructive-edits.md), removing its crop exception.

## Context

ADR-0003 made edits parametric, with one exception: crop overwrote the source image. A crop could not be undone, and it re-encoded JPEG sources, losing quality each time. History also recorded every slider `onChange`, so a single drag could fill all 30 undo steps.

## Decision

- **Crop is a parameter.** `crop: CropRect | null` sits next to `adjustments`, normalized to the source image. `originalImageData` is never replaced after loading.
- **One render path.** `renderEdit(source, adjustments, crop)` produces the output. Export uses it directly, so nothing from the on-screen view can reach the exported file.
- **The crop tab shows the whole image**, with the frame on the current crop, so a crop can be widened again at any time. Leaving the tab without applying discards the frame.
- **History stores `EditSnapshot`** (`adjustments` and `crop`), and it records one entry per gesture. `updateAdjustment` changes the live value only, and `commitHistory` runs when the gesture ends.

## Options Considered

### Option A: Crop as a parameter (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low to medium |
| Cost | A few numbers per history entry |
| Scalability | Independent of image size |
| Team familiarity | High |

**Pros:** Undoable, lossless, and consistent with the rest of the edit model.

**Cons:** Each render starts with a crop step, though it is cheap and reduces the pixels processed afterwards.

### Option B: Keep destructive crop, and store the previous image for undo

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | A full-size buffer per crop: 92 MiB at 24 MP |
| Scalability | Poor |
| Team familiarity | High |

**Pros:** The render path stays unchanged.

**Cons:** Wastes memory, and does not allow a crop to be adjusted later.

### Option C: Ordered operation list

Set aside for the reasons given in ADR-0003. Parameters remain enough until layers or local edits exist.

## Trade-off Analysis

Option A is the only one that removes the exception rather than working around it. It also leaves `EditSnapshot` ready for the `look` field proposed in [ADR-0007](0007-looks-presets-and-3d-luts.md).

## Consequences

- Crop can be undone, redone, reset, and adjusted later, with no quality loss.
- Crop frames are now positioned on the displayed image, not on its container, and aspect ratios are computed in pixels using the image's shape.
- Rotation can follow the same pattern if it is added.
- `src/lib/crop.ts` holds the geometry as pure, tested functions.
- Every input that edits a value must call `commitHistory` when its gesture ends. `undo` commits pending changes first as a safety net.

## Action Items

1. [x] Add `crop` to the edit state and to history.
2. [x] Render display and export from the source.
3. [x] Commit history per gesture.
4. [ ] Add `look` to `EditSnapshot` when ADR-0007 is implemented.
