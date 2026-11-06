import { describe, expect, it } from 'vitest'
import { defaultAdjustments } from '@/types/editor.types'
import { resolveAdjustments } from './adjustments'
import { getLook, Look, LOOKS } from './looks/catalog'
import { existsSync } from 'node:fs'

const look: Look = {
  id: 'test',
  name: 'Test',
  category: 'Vintage',
  adjustments: { contrast: 40, exposure: 1 },
}

describe('resolveAdjustments', () => {
  it('returns the user values without a look', () => {
    expect(resolveAdjustments(defaultAdjustments, undefined, null)).toBe(defaultAdjustments)
  })

  it('scales a look by its strength and adds it to the user values', () => {
    const resolved = resolveAdjustments(
      { ...defaultAdjustments, contrast: 10 },
      look,
      { id: 'test', strength: 0.5 }
    )

    expect(resolved.contrast).toBe(30)
    expect(resolved.exposure).toBe(0.5)
  })

  it('stays within the slider range', () => {
    const resolved = resolveAdjustments(
      { ...defaultAdjustments, contrast: 90, exposure: 1.8 },
      look,
      { id: 'test', strength: 1 }
    )

    expect(resolved.contrast).toBe(100)
    expect(resolved.exposure).toBe(2)
  })
})

describe('catalogue', () => {
  it('has unique ids', () => {
    expect(new Set(LOOKS.map((item) => item.id)).size).toBe(LOOKS.length)
  })

  it('points every LUT look to a bundled file', () => {
    for (const item of LOOKS) {
      if (item.lut) expect(existsSync(`public${item.lut.src}`), item.id).toBe(true)
    }
  })

  it('finds a look by id', () => {
    expect(getLook('silver')?.name).toBe('Silver')
    expect(getLook('missing')).toBeUndefined()
  })
})
