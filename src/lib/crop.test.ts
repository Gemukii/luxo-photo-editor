import { describe, expect, it } from 'vitest'
import {
  clampCropRect,
  cropImageData,
  croppedSize,
  fitContain,
  fitRectToAspect,
  normalizedAspect,
} from './crop'

const image = { width: 600, height: 400 }

const imageWithPixelIds = (width: number, height: number) => {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) data[i * 4] = i
  return new ImageData(data, width, height)
}

describe('normalizedAspect', () => {
  it('accounts for the shape of the image', () => {
    expect(normalizedAspect('1:1', image)).toBeCloseTo(400 / 600)
  })

  it('returns null for a free crop', () => {
    expect(normalizedAspect('free', image)).toBeNull()
  })
})

describe('fitRectToAspect', () => {
  it('produces the requested ratio in pixels', () => {
    const rect = fitRectToAspect({ x: 0.2, y: 0.15, width: 0.6, height: 0.6 }, '1:1', image)
    expect(rect.width * image.width).toBeCloseTo(rect.height * image.height)
  })

  it('stays inside the image', () => {
    const rect = fitRectToAspect({ x: 0, y: 0, width: 1, height: 1 }, '16:9', image)
    expect(rect.x + rect.width).toBeLessThanOrEqual(1)
    expect(rect.y + rect.height).toBeLessThanOrEqual(1)
  })
})

describe('clampCropRect', () => {
  it('keeps the rectangle inside the image', () => {
    expect(clampCropRect({ x: 0.9, y: -1, width: 0.5, height: 2 })).toEqual({
      x: 0.5,
      y: 0,
      width: 0.5,
      height: 1,
    })
  })
})

describe('cropImageData', () => {
  it('returns the source when there is no crop', () => {
    const source = imageWithPixelIds(4, 4)
    expect(cropImageData(source, null)).toBe(source)
  })

  it('copies the selected pixels', () => {
    const source = imageWithPixelIds(4, 4)
    const result = cropImageData(source, { x: 0.25, y: 0.5, width: 0.5, height: 0.5 })

    expect([result.width, result.height]).toEqual([2, 2])
    expect([result.data[0], result.data[4], result.data[8], result.data[12]]).toEqual([9, 10, 13, 14])
  })
})

describe('croppedSize', () => {
  it('returns the output size in pixels', () => {
    expect(croppedSize(image, { x: 0, y: 0, width: 0.5, height: 0.25 })).toEqual({
      width: 300,
      height: 100,
    })
  })
})

describe('fitContain', () => {
  it('centres a wide image in a square container', () => {
    expect(fitContain({ width: 100, height: 100 }, { width: 200, height: 100 })).toEqual({
      left: 0,
      top: 25,
      width: 100,
      height: 50,
    })
  })
})
