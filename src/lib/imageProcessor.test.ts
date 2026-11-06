import { describe, expect, it } from 'vitest'
import { defaultAdjustments } from '@/types/editor.types'
import { applyAdjustments, downsampleImageData, renderEdit } from './imageProcessor'

const solid = (r: number, g: number, b: number, width = 2, height = 2) => {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  return new ImageData(data, width, height)
}

const firstPixel = (image: ImageData) => Array.from(image.data.slice(0, 4))

describe('applyAdjustments', () => {
  it('leaves pixels unchanged with default adjustments', () => {
    const source = solid(10, 120, 240)
    expect(firstPixel(applyAdjustments(source, defaultAdjustments))).toEqual([10, 120, 240, 255])
  })

  it('never modifies the source', () => {
    const source = solid(100, 100, 100)
    applyAdjustments(source, { ...defaultAdjustments, exposure: 1 })
    expect(firstPixel(source)).toEqual([100, 100, 100, 255])
  })

  it('doubles values for one stop of exposure', () => {
    const result = applyAdjustments(solid(50, 60, 70), { ...defaultAdjustments, exposure: 1 })
    expect(firstPixel(result)).toEqual([100, 120, 140, 255])
  })

  it('clamps values to the valid range', () => {
    const result = applyAdjustments(solid(200, 200, 200), { ...defaultAdjustments, exposure: 2 })
    expect(firstPixel(result)).toEqual([255, 255, 255, 255])
  })

  it('removes all colour at minimum saturation', () => {
    const [r, g, b] = firstPixel(
      applyAdjustments(solid(200, 100, 50), { ...defaultAdjustments, saturation: -100 })
    )
    expect(r).toBe(g)
    expect(g).toBe(b)
  })

  it('warms the image with positive temperature', () => {
    const [r, , b] = firstPixel(
      applyAdjustments(solid(100, 100, 100), { ...defaultAdjustments, temperature: 50 })
    )
    expect(r).toBeGreaterThan(100)
    expect(b).toBeLessThan(100)
  })
})

describe('renderEdit', () => {
  it('applies the crop and the adjustments', () => {
    const result = renderEdit(solid(50, 50, 50, 4, 4), {
      adjustments: { ...defaultAdjustments, exposure: 1 },
      crop: { x: 0, y: 0, width: 0.5, height: 0.5 },
      lut: null,
      lutMix: 0,
    })

    expect([result.width, result.height]).toEqual([2, 2])
    expect(firstPixel(result)).toEqual([100, 100, 100, 255])
  })
})

describe('downsampleImageData', () => {
  it('reduces the width and keeps the proportions', () => {
    const result = downsampleImageData(solid(1, 2, 3, 100, 50), 10)
    expect([result.width, result.height]).toEqual([10, 5])
    expect(firstPixel(result)).toEqual([1, 2, 3, 255])
  })

  it('returns small images unchanged', () => {
    const source = solid(1, 2, 3, 4, 4)
    expect(downsampleImageData(source, 10)).toBe(source)
  })
})
