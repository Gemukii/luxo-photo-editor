# LUXO

**A browser-based photo editor for the photos you already have**

LUXO combines Lightroom-style manual editing with one-click looks, so you can get a good result quickly without knowing colour grading.

---

## Why LUXO?

- **Private**: everything runs in your browser, and your photos never leave your device
- **Free**: no subscriptions, no accounts, no cloud storage
- **Web-based**: nothing to install
- **Safe for your originals**: edits never change the source file, and export creates a new one

---

## Features

### Looks
- 11 one-click looks for landscapes, portraits, black and white, and vintage styles
- Live previews on your own photo
- A single strength slider, and your manual adjustments stay in place

### Editing
- Adjustments: Exposure, Contrast, Saturation, Vibrance, Highlights, Shadows, Whites, Blacks, Temperature, Tint
- Live RGB histogram
- Non-destructive crop with free, 1:1, 4:5, 4:3 and 16:9 ratios and a rule-of-thirds grid
- Before/after view with a draggable divider
- Undo and redo, covering looks, adjustments and crop
- GPU rendering with WebGL2, with instant feedback whatever the size of the photo

### Import
- File picker or drag and drop
- JPEG, PNG, WebP, and any other format your browser can decode

### Export
- JPEG with a quality setting, or PNG, at full resolution

---

## Roadmap

- **Custom looks**: import `.cube` LUTs, and save and share your own looks
- **RAW support**, 16-bit export, and metadata preservation

Architecture decisions are recorded in [docs/adr](docs/adr/README.md).

---

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Development

```bash
npm test           # Unit tests
npm run typecheck  # Type check
npm run build      # Production build
npm run generate:luts  # Regenerate the bundled LUTs
```

With the dev server running, open `/dev/parity` to compare the GPU renderer with the TypeScript reference. Run it after changing `src/lib/render/shaders.ts` or `src/lib/imageProcessor.ts`, which must stay in step.

### Guidelines

- Everything in this repository is in English: UI text, code, comments, commit messages, and documentation.
- Use the colour tokens from `tailwind.config.js`, not raw colours. The interface around the photo stays dark and almost neutral ([ADR-0011](docs/adr/0011-looks-first-ui-and-japanese-palette.md)).
- Check the [architecture decisions](docs/adr/README.md) before changing the architecture, and keep them up to date.
