# ADR-0001: Local-first, browser-only image processing

**Status:** Accepted
**Date:** 2026-01-05 (recorded 2026-11-05)
**Deciders:** Gemukii

> Retroactive record. The decision comes from the code and README; the reasoning and options are reconstructed.

## Context

LUXO edits personal photos. These files are large (20 MB and up), private, and may carry location data. The tool has to work on the photos the user already has, without an upload step or a storage bill.

## Decision

All image decoding, processing and export happen in the browser. Photos are never sent to a server. The server only delivers the application.

Original files are never modified. Export produces a new file named `<name>_edited.<ext>`.

## Options Considered

### Option A: Browser-only processing (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium: all image work must fit browser APIs |
| Cost | Close to zero: static hosting, no storage or compute |
| Scalability | Excellent: each user brings their own compute |
| Team familiarity | High: standard web stack |

**Pros:** Strong privacy by design, no upload wait, no installation, and very low running costs.

**Cons:** Limited by browser memory and decoders, with no direct RAW support and restricted file system access.

### Option B: Server-side processing

| Dimension | Assessment |
|-----------|------------|
| Complexity | High: upload pipeline, job handling, storage |
| Cost | Grows with usage |
| Scalability | Must be built and paid for |
| Team familiarity | Medium |

**Pros:** Native libraries give full RAW and 16-bit support, and low-end devices are not a constraint.

**Cons:** Photos leave the device, every slider change needs a network round trip or a parallel client renderer, and it adds real running costs.

### Option C: Native desktop app (Tauri or Electron)

| Dimension | Assessment |
|-----------|------------|
| Complexity | High: packaging, updates, per-OS builds |
| Cost | Low to run, higher to distribute |
| Scalability | Excellent: local compute |
| Team familiarity | Medium |

**Pros:** Direct file access, native RAW libraries, and no browser memory limits.

**Cons:** Requires an installation and loses the "works instantly" promise.

## Trade-off Analysis

Browser-only gives up format depth and raw performance in exchange for privacy, zero running costs, and instant access. Those are the properties that set LUXO apart. Option A also leaves Option C open: a web codebase can later be wrapped in Tauri if RAW or file access becomes essential.

## Consequences

- Privacy is structural, not just a policy.
- There is no backend to scale or secure for image data.
- Memory is a hard limit: a 24 MP image takes 92 MiB per RGBA buffer (see [ADR-0004](0004-canvas2d-cpu-pipeline.md)).
- Format support is limited to what browsers decode, or to what WebAssembly can add (see [ADR-0005](0005-browser-native-decode-and-export.md)).
- Any future feature that sends image data to a server must supersede this ADR.
- `/presets` loads its sample image from Unsplash. No user data is sent, but it is a third-party request that a privacy-focused app should not need.

## Action Items

1. [x] Replace the Unsplash sample images with local assets, or with thumbnails of the user's photo (see [ADR-0007](0007-looks-presets-and-3d-luts.md)).
2. [x] Remove the cloud and team claims from the login page, which contradict this decision.
