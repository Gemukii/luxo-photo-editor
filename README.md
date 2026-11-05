# LUXO

**A browser-based photo editor for the photos you already have**

LUXO combines Lightroom-style manual editing with one-click looks, so you can get a good result quickly without knowing colour grading. One-click looks are the next major feature: see the [roadmap](#roadmap).

---

## Why LUXO?

- **Private**: everything runs in your browser, and your photos never leave your device
- **Free**: no subscriptions, no accounts, no cloud storage
- **Web-based**: nothing to install
- **Safe for your originals**: edits never change the source file, and export creates a new one

---

## Features

### Editing
- Adjustments: Exposure, Contrast, Saturation, Vibrance, Highlights, Shadows, Whites, Blacks, Temperature, Tint
- Live RGB histogram
- Non-destructive crop with 16:9, 1:1, 4:3 and 4:5 ratios and a rule-of-thirds grid
- Before/after split view
- Undo and redo, covering both adjustments and crop

### Import
- File picker or drag and drop
- JPEG, PNG, WebP, and any other format your browser can decode

### Export
- JPEG with a quality setting, or PNG

---

## Roadmap

- **Looks**: predefined filters and LUTs, with a single strength slider
- **GPU rendering**: instant feedback on large photos (currently about 1 to 3 seconds per change at 24 MP)
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
```
