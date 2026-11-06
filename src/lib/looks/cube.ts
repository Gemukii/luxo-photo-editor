export interface Lut {
  id: string
  size: number
  /** RGB triplets from 0 to 1, with red changing fastest. */
  data: Float32Array
}

const MIN_SIZE = 2
const MAX_SIZE = 128

/** Parses a 3D LUT in the .cube format. Throws a user-facing message on invalid files. */
export const parseCube = (text: string, id: string): Lut => {
  let size = 0
  let data: Float32Array | null = null
  let domainMin = [0, 0, 0]
  let domainMax = [1, 1, 1]
  let count = 0

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('TITLE')) continue

    const parts = line.split(/\s+/)

    if (parts[0] === 'LUT_1D_SIZE') {
      throw new Error('1D LUTs are not supported. Please use a 3D LUT.')
    }

    if (parts[0] === 'LUT_3D_SIZE') {
      size = Number(parts[1])
      if (!Number.isInteger(size) || size < MIN_SIZE || size > MAX_SIZE) {
        throw new Error('This LUT has an invalid size.')
      }
      data = new Float32Array(size ** 3 * 3)
      continue
    }

    if (parts[0] === 'DOMAIN_MIN' || parts[0] === 'DOMAIN_MAX') {
      const values = parts.slice(1).map(Number)
      if (parts[0] === 'DOMAIN_MIN') domainMin = values
      else domainMax = values
      continue
    }

    if (/^[A-Z_]/.test(parts[0])) continue

    if (!data) throw new Error('This LUT does not declare a size.')

    const values = parts.map(Number)
    if (values.length !== 3 || values.some(Number.isNaN)) {
      throw new Error('This LUT contains invalid values.')
    }
    if (count >= size ** 3) throw new Error('This LUT contains too many values.')

    data.set(values, count * 3)
    count++
  }

  if (!data) throw new Error('This file is not a 3D LUT.')
  if (count !== size ** 3) throw new Error('This LUT is incomplete.')

  if (domainMin.some((v) => v !== 0) || domainMax.some((v) => v !== 1)) {
    throw new Error('LUTs with a custom input range are not supported.')
  }

  return { id, size, data }
}
