// Generates the bundled LUTs in public/luts. Every grade is defined here, so the
// project owns the resulting files. Run with: npm run generate:luts
import { mkdirSync, writeFileSync } from 'node:fs'

const SIZE = 33
const OUTPUT_DIR = 'public/luts'

const clamp01 = (x) => Math.max(0, Math.min(1, x))
const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

const contrast = (c, amount) =>
  c.map((x) => {
    const s = x * x * (3 - 2 * x)
    return x + (s - x) * amount
  })

const saturate = (c, amount) => {
  const l = luma(c)
  return c.map((x) => l + (x - l) * amount)
}

const gain = (c, factors) => c.map((x, i) => x * factors[i])

// Raises the black point, optionally with a tint
const lift = (c, amount, tint = [1, 1, 1]) =>
  c.map((x, i) => {
    const floor = amount * tint[i]
    return floor + x * (1 - floor)
  })

// Pushes shadows and highlights towards separate colours
const splitTone = (c, shadow, highlight, amount) => {
  const l = clamp01(luma(c))
  const shadowWeight = (1 - l) ** 2
  const highlightWeight = l ** 2
  return c.map(
    (x, i) => x + ((shadow[i] - 0.5) * shadowWeight + (highlight[i] - 0.5) * highlightWeight) * amount
  )
}

// Compresses highlights, like the shoulder of a film curve
const softenHighlights = (c, amount) =>
  c.map((x) => (x > 0.7 ? 0.7 + (x - 0.7) * (1 - amount) : x))

const grades = {
  'golden-hour': {
    title: 'Golden Hour',
    grade: (c) => {
      c = gain(c, [1.06, 1.0, 0.9])
      c = splitTone(c, [0.5, 0.42, 0.58], [0.72, 0.58, 0.36], 0.32)
      c = contrast(c, 0.22)
      return saturate(c, 1.12)
    },
  },
  evergreen: {
    title: 'Evergreen',
    grade: ([r, g, b]) => {
      let c = [r * 0.94, g * 1.0 + (g - r) * 0.06, b + (g - r) * 0.1]
      c = splitTone(c, [0.4, 0.52, 0.52], [0.54, 0.56, 0.44], 0.22)
      c = contrast(c, 0.28)
      return saturate(c, 1.05)
    },
  },
  'warm-skin': {
    title: 'Warm Skin',
    grade: (c) => {
      c = lift(c, 0.025, [1, 0.92, 0.86])
      c = gain(c, [1.04, 1.0, 0.95])
      c = softenHighlights(c, 0.3)
      c = contrast(c, 0.1)
      return saturate(c, 0.96)
    },
  },
  'moody-blue': {
    title: 'Moody Blue',
    grade: (c) => {
      c = gain(c, [0.92, 0.97, 1.05])
      c = splitTone(c, [0.34, 0.44, 0.62], [0.56, 0.54, 0.48], 0.4)
      c = contrast(c, 0.34)
      return saturate(c, 0.78)
    },
  },
  cinema: {
    title: 'Cinema',
    grade: (c) => {
      c = splitTone(c, [0.3, 0.5, 0.56], [0.7, 0.54, 0.38], 0.42)
      c = contrast(c, 0.32)
      c = softenHighlights(c, 0.2)
      return saturate(c, 1.02)
    },
  },
  silver: {
    title: 'Silver',
    grade: ([r, g, b]) => {
      const l = 0.36 * r + 0.5 * g + 0.14 * b
      let c = contrast([l, l, l], 0.42)
      c = lift(c, 0.012)
      return splitTone(c, [0.49, 0.5, 0.52], [0.52, 0.5, 0.48], 0.1)
    },
  },
  'faded-film': {
    title: 'Faded Film',
    grade: (c) => {
      c = lift(c, 0.085, [1, 0.96, 0.9])
      c = softenHighlights(c, 0.38)
      c = gain(c, [1.02, 1.0, 0.94])
      c = splitTone(c, [0.46, 0.52, 0.5], [0.58, 0.54, 0.44], 0.2)
      return saturate(c, 0.78)
    },
  },
  'instant-film': {
    title: 'Instant Film',
    grade: (c) => {
      c = lift(c, 0.06, [0.8, 1, 1.06])
      c = splitTone(c, [0.4, 0.54, 0.56], [0.62, 0.58, 0.42], 0.3)
      c = contrast(c, 0.24)
      c = softenHighlights(c, 0.24)
      return saturate(c, 0.9)
    },
  },
}

const toCube = ({ title, grade }) => {
  const lines = [`TITLE "${title}"`, `LUT_3D_SIZE ${SIZE}`, 'DOMAIN_MIN 0.0 0.0 0.0', 'DOMAIN_MAX 1.0 1.0 1.0']
  const step = SIZE - 1

  // Red changes fastest, as the .cube format requires
  for (let b = 0; b < SIZE; b++) {
    for (let g = 0; g < SIZE; g++) {
      for (let r = 0; r < SIZE; r++) {
        const color = grade([r / step, g / step, b / step])
        lines.push(color.map((x) => clamp01(x).toFixed(4)).join(' '))
      }
    }
  }

  return lines.join('\n') + '\n'
}

mkdirSync(OUTPUT_DIR, { recursive: true })

for (const [id, definition] of Object.entries(grades)) {
  writeFileSync(`${OUTPUT_DIR}/${id}.cube`, toCube(definition))
}

console.log(`Generated ${Object.keys(grades).length} LUTs in ${OUTPUT_DIR}`)
