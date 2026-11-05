# ADR-0005: Browser-native decoding and 8-bit export

**Status:** Accepted
**Date:** 2026-01-05 (recorded 2026-11-05)
**Deciders:** Gemukii

> Retroactive record. The decision comes from the code; the reasoning and options are reconstructed.

## Context

Following [ADR-0001](0001-local-first-browser-processing.md), files have to be read and written in the browser. The README promises RAW input, 16-bit TIFF output, and metadata preservation. None of these are available through standard browser image APIs.

## Decision

- **Input:** drag and drop only. Files are read with `FileReader`, decoded by an `HTMLImageElement`, and limited to what the browser can decode.
- **Output:** `canvas.toBlob` to JPEG (quality 60 to 100) or PNG, at original size, 8 bits per channel, as a browser download.
- **Metadata:** not preserved.

## Options Considered

### Option A: Native browser APIs only (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | No added bundle size |
| Scalability | Limited by browser decoders |
| Team familiarity | High |

**Pros:** Very little code, fast decoding, and no dependencies.

**Cons:** No RAW, no 16-bit, no metadata, and the browser controls colour conversion.

### Option B: WebAssembly decoders (for example LibRaw) and encoders

| Dimension | Assessment |
|-----------|------------|
| Complexity | High |
| Cost | Multi-megabyte download, and license review required |
| Scalability | Good, though memory-heavy |
| Team familiarity | Low |

**Pros:** Delivers RAW support while keeping photos on the device.

**Cons:** Requires a 16-bit or float pipeline to be worthwhile, and that pipeline does not exist yet.

### Option C: Native APIs plus a small metadata library

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low to medium |
| Cost | Small |
| Scalability | Good |
| Team familiarity | Medium |

**Pros:** Keeps capture data and copyright on JPEG export at low cost.

**Cons:** Solves metadata only, and must let users strip GPS data for privacy.

## Trade-off Analysis

Option A was enough for a first version and suits the main audience of the looks feature, who mostly work with JPEGs. RAW is a major project, not an add-on: it needs decoding, demosaicing, colour management, and a higher-precision pipeline. It should get its own ADR.

## Consequences

- RAW files are either ignored by the drop handler or fail to decode, depending on the MIME type the browser reports.
- Dropping a non-image file does nothing, without any message.
- There is no file picker, which leaves no keyboard-accessible way to open a file, and makes loading awkward on tablets.
- 8-bit processing can cause banding after strong adjustments.
- Export silently drops EXIF, GPS and copyright data, along with any embedded colour profile.
- The export size estimate is a rough formula, not a measurement.

## Action Items

1. [x] Add a file picker alongside drag and drop.
2. [x] Show a clear message for unsupported files, RAW in particular.
3. [x] Align the README with what is supported today.
4. [ ] Decide whether RAW is in scope, in a dedicated ADR.
5. [ ] Evaluate Option C for metadata preservation.
