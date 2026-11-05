import { describe, expect, it } from 'vitest'
import { getImportError } from './imageLoader'

describe('getImportError', () => {
  it('accepts browser-decodable images', () => {
    expect(getImportError({ name: 'photo.jpg', type: 'image/jpeg' })).toBeNull()
  })

  it('explains that RAW files are not supported, whatever their MIME type', () => {
    expect(getImportError({ name: 'IMG_0001.CR2', type: '' })).toMatch(/RAW/)
    expect(getImportError({ name: 'photo.dng', type: 'image/x-adobe-dng' })).toMatch(/RAW/)
  })

  it('rejects files that are not images', () => {
    expect(getImportError({ name: 'notes.txt', type: 'text/plain' })).toMatch(/not an image/)
  })
})
