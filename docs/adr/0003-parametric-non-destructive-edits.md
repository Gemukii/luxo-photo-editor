# ADR-0003: Parametric, non-destructive edit model

**Status:** Accepted, amended by [ADR-0010](0010-non-destructive-crop-and-gesture-history.md)
**Date:** 2026-01-05 (recorded 2026-11-05)
**Deciders:** Gemukii

> Retroactive record. The decision comes from the code; the reasoning and options are reconstructed.

## Context

Users move sliders back and forth, compare with the original, and undo. An edit must never degrade the source pixels, and undo history must stay cheap: a full-size 24 MP copy costs 92 MiB.

## Decision

An edit is a small object of numbers (`Adjustments`), not modified pixels.

- `originalImageData` stays untouched, and every render recomputes the output from it.
- Undo and redo store `Adjustments` snapshots, up to 30 entries (`MAX_HISTORY`).
- Before/after comparison is a second view of the same source.

**Exception:** crop is destructive. `applyCrop` replaces `originalImageData` and `currentImage`.

## Options Considered

### Option A: Parameter snapshots (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | A few hundred bytes per history entry |
| Scalability | Independent of image size |
| Team familiarity | High |

**Pros:** Tiny history, no quality loss, and edits that are easy to save, share, or turn into presets.

**Cons:** Every change needs a full re-render, which makes render speed critical.

### Option B: Pixel snapshots

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | 92 MiB per entry at 24 MP |
| Scalability | Poor |
| Team familiarity | High |

**Pros:** Undo is instant, with no re-render.

**Cons:** Memory use makes this unworkable in a browser.

### Option C: Ordered operation list

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium to high |
| Cost | Small |
| Scalability | Good |
| Team familiarity | Medium |

**Pros:** Handles crop, rotation and looks in one model.

**Cons:** Too much machinery for a fixed set of sliders. It may become relevant if layers or local edits are added.

## Trade-off Analysis

Parameters are the right model, and they are what makes presets possible: a preset is simply a stored set of parameters. The cost is render speed, which [ADR-0004](0004-canvas2d-cpu-pipeline.md) does not yet handle well.

## Consequences

- Presets and looks fit naturally on this model ([ADR-0007](0007-looks-presets-and-3d-luts.md)).
- Crop breaks the model, with these effects:
  - A crop cannot be undone, and neither "Reset Crop" nor "Reset All Adjustments" restores it.
  - `applyCrop` encodes the result through `toDataURL(fileType)`, and `EditorCanvas` then reads the pixels back. A JPEG source therefore takes an extra lossy generation with each crop.
- History records every slider `onChange`, so one drag can fill all 30 entries and undo steps through tiny increments.
- `sharpness` and `clarity` exist in `Adjustments`, but have no slider and no implementation in `applyAdjustments`.

## Action Items

1. [x] Make crop non-destructive: store `cropRect` in the edit state and apply it at render and export time.
2. [x] Add crop to the history snapshot.
3. [x] Commit one history entry per gesture, on pointer release, rather than per `onChange`.
4. [x] Implement `sharpness` and `clarity`, or remove them from the model.
5. [x] Implement rotation, or remove "Rotate" from the UI labels.
