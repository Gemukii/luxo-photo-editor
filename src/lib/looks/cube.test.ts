import { describe, expect, it } from 'vitest'
import { applyLut, sampleLut } from '@/lib/imageProcessor'
import { parseCube } from './cube'

const identityCube = () => {
  const lines = ['TITLE "Identity"', '# A comment', 'LUT_3D_SIZE 2', 'DOMAIN_MIN 0 0 0', 'DOMAIN_MAX 1 1 1']
  for (let b = 0; b < 2; b++) {
    for (let g = 0; g < 2; g++) {
      for (let r = 0; r < 2; r++) lines.push(`${r} ${g} ${b}`)
    }
  }
  return lines.join('\n')
}

describe('parseCube', () => {
  it('reads a 3D LUT', () => {
    const lut = parseCube(identityCube(), 'identity')

    expect(lut.size).toBe(2)
    expect(lut.data).toHaveLength(24)
    expect(Array.from(lut.data.slice(3, 6))).toEqual([1, 0, 0])
  })

  it('handles Windows line endings', () => {
    expect(parseCube(identityCube().replace(/\n/g, '\r\n'), 'identity').size).toBe(2)
  })

  it('rejects 1D LUTs', () => {
    expect(() => parseCube('LUT_1D_SIZE 2\n0 0 0\n1 1 1', 'x')).toThrow(/1D/)
  })

  it('rejects incomplete files', () => {
    expect(() => parseCube('LUT_3D_SIZE 2\n0 0 0', 'x')).toThrow(/incomplete/)
  })

  it('rejects invalid values', () => {
    expect(() => parseCube('LUT_3D_SIZE 2\n0 zero 0', 'x')).toThrow(/invalid/)
  })

  it('rejects files with no LUT', () => {
    expect(() => parseCube('hello', 'x')).toThrow()
    expect(() => parseCube('', 'x')).toThrow(/not a 3D LUT/)
  })

  it('rejects custom input ranges', () => {
    const text = identityCube().replace('DOMAIN_MAX 1 1 1', 'DOMAIN_MAX 2 2 2')
    expect(() => parseCube(text, 'x')).toThrow(/range/)
  })
})

describe('sampleLut', () => {
  const identity = parseCube(identityCube(), 'identity')

  it('interpolates between points', () => {
    const [r, g, b] = sampleLut(identity, 0.25, 0.5, 0.75)

    expect(r).toBeCloseTo(0.25)
    expect(g).toBeCloseTo(0.5)
    expect(b).toBeCloseTo(0.75)
  })

  it('handles the top of the range', () => {
    expect(sampleLut(identity, 1, 1, 1)).toEqual([1, 1, 1])
  })
})

describe('applyLut', () => {
  const inverted = {
    id: 'inverted',
    size: 2,
    data: parseCube(identityCube(), 'x').data.map((value) => 1 - value),
  }

  const pixel = () => new ImageData(new Uint8ClampedArray([255, 0, 100, 255]), 1, 1)

  it('applies the LUT in full', () => {
    expect(Array.from(applyLut(pixel(), inverted, 1).data)).toEqual([0, 255, 155, 255])
  })

  it('blends with the original by the mix amount', () => {
    const [r, g] = applyLut(pixel(), inverted, 0.5).data

    expect(r).toBeCloseTo(128, -0.5)
    expect(g).toBeCloseTo(128, -0.5)
  })

  it('leaves the original alone at zero', () => {
    expect(Array.from(applyLut(pixel(), inverted, 0).data)).toEqual([255, 0, 100, 255])
  })
})
