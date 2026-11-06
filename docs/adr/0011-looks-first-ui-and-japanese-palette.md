# ADR-0011: Looks-first interface and Japanese colour palette

**Status:** Accepted
**Date:** 2026-11-05
**Deciders:** Gemukii

## Context

The first interface was a light, glass-style layout with blue and indigo gradients, a row of tool buttons that did nothing, and a separate `/presets` mock-up. Two things drove a redesign:

- The main audience has no colour-grading knowledge, so one-click looks should come first ([ADR-0007](0007-looks-presets-and-3d-luts.md)).
- The project owner asked for a current design based on traditional Japanese colour combinations, in the spirit of Sanzo Wada's *A Dictionary of Color Combinations*.

## Decision

**Layout**

- One side panel with three tabs: **Looks**, **Adjust** and **Crop**. Looks is the default.
- The photo takes all remaining space. Export is always one click away in the top bar.
- A welcome screen explains the three steps, and the whole page accepts a dropped file.
- On phones, the panel sits below the photo.
- `/presets`, the inactive tool buttons (Retouch, Curves, Text, Frames), and the second set of crop ratio buttons are removed.

**Colour**

Tokens are named after traditional Japanese colours, in `tailwind.config.js`. The hex values are our own approximations.

| Token | Use |
|-------|-----|
| Sumi (ink) | Backgrounds, panels, lines |
| Gofun, Kinari, Nezumi | Text, from strongest to weakest |
| Shu (vermilion) | Primary action and active tab |
| Kincha (golden brown) | Selection and focus |
| Asagi, Wakatake | Histogram, and the Temperature and Tint sliders |
| Ai (indigo) | Welcome screen combinations |

**The interface around the photo stays dark and almost neutral.** Accent colours appear only on small controls and on the welcome screen. Strong colour next to a photo changes how its colours are perceived, which would undermine an editing tool.

**Type:** Shippori Mincho for the wordmark and headings, and Zen Kaku Gothic New for the interface. `next/font` serves both from our own host, so no request reaches Google at runtime ([ADR-0001](0001-local-first-browser-processing.md)).

## Options Considered

### Option A: Dark interface with restrained Japanese accents (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium: every component is restyled |
| Cost | None |
| Scalability | Good: colours are shared tokens |
| Team familiarity | High |

**Pros:** Colours in the photo are judged accurately, and the palette gives LUXO a recognisable identity.

**Cons:** The Japanese combinations show fully only on the welcome screen.

### Option B: Light interface using washi paper tones

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | None |
| Scalability | Good |
| Team familiarity | High |

**Pros:** More distinctive, and closer to the printed book.

**Cons:** A bright surround makes photos look darker than they are, and tires the eyes during long sessions.

### Option C: Bold colour blocks throughout

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | None |
| Scalability | Good |
| Team familiarity | High |

**Pros:** Maximum visual impact.

**Cons:** It competes directly with the photo.

## Trade-off Analysis

The photo must be the most colourful thing on screen. Option A keeps the Japanese palette as the design's structure and accents, without letting it affect how the user judges their colours. This is also why dark interfaces are the norm in professional photo editors.

## Consequences

- A new user sees looks straight away, and needs no knowledge of the sliders.
- Colours must be changed through the tokens, not written directly in components.
- Fonts are downloaded at build time, so a build needs network access.
- There is no light theme.
- Tools that return later, such as Curves, should be added only once they work.

## Action Items

1. [x] Add the colour tokens and fonts.
2. [x] Rebuild the layout, panels, and export dialog.
3. [x] Remove `/presets` and the inactive tool buttons.
4. [ ] Test the interface with people who have no editing experience.
