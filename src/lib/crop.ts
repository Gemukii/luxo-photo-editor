import { CropAspect, CropRect } from '@/types/editor.types'

export interface Size {
  width: number
  height: number
}

export const MIN_CROP_SIZE = 0.05

export const createDefaultCropRect = (): CropRect => ({
  x: 0.2,
  y: 0.15,
  width: 0.6,
  height: 0.6,
})

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const clampCropRect = (rect: CropRect): CropRect => {
  const width = clamp(rect.width, MIN_CROP_SIZE, 1)
  const height = clamp(rect.height, MIN_CROP_SIZE, 1)

  return {
    x: clamp(rect.x, 0, 1 - width),
    y: clamp(rect.y, 0, 1 - height),
    width,
    height,
  }
}

/**
 * Converts a pixel aspect ratio to the ratio between normalized width and height.
 * Crop rectangles are normalized per axis, so the image's own shape must be factored in.
 */
export const normalizedAspect = (aspect: CropAspect, image: Size): number | null => {
  if (aspect === 'free' || !image.width || !image.height) return null
  const [w, h] = aspect.split(':').map(Number)
  return h ? (w / h) * (image.height / image.width) : null
}

export const fitRectToAspect = (rect: CropRect, aspect: CropAspect, image: Size): CropRect => {
  const ratio = normalizedAspect(aspect, image)
  if (!ratio) return rect

  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2

  let width = rect.width
  let height = width / ratio

  if (height > rect.height) {
    height = rect.height
    width = height * ratio
  }

  return {
    x: clamp(centerX - width / 2, 0, 1 - width),
    y: clamp(centerY - height / 2, 0, 1 - height),
    width,
    height,
  }
}

export const cropToPixels = (crop: CropRect, image: Size) => {
  const x = clamp(Math.round(crop.x * image.width), 0, image.width - 1)
  const y = clamp(Math.round(crop.y * image.height), 0, image.height - 1)

  return {
    x,
    y,
    width: clamp(Math.round(crop.width * image.width), 1, image.width - x),
    height: clamp(Math.round(crop.height * image.height), 1, image.height - y),
  }
}

export const croppedSize = (image: Size, crop: CropRect | null): Size => {
  if (!crop) return { width: image.width, height: image.height }
  const { width, height } = cropToPixels(crop, image)
  return { width, height }
}

export const cropImageData = (source: ImageData, crop: CropRect | null): ImageData => {
  if (!crop) return source

  const { x, y, width, height } = cropToPixels(crop, source)
  const result = new ImageData(width, height)

  for (let row = 0; row < height; row++) {
    const start = ((y + row) * source.width + x) * 4
    result.data.set(source.data.subarray(start, start + width * 4), row * width * 4)
  }

  return result
}

export type CropHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se'

/**
 * Applies a drag to a crop frame. A corner drag keeps the opposite corner fixed.
 * `dx` and `dy` are normalized to the image, and `aspect` comes from `normalizedAspect`.
 */
export const dragCropRect = (
  start: CropRect,
  handle: CropHandle,
  dx: number,
  dy: number,
  aspect: number | null
): CropRect => {
  if (handle === 'move') {
    return {
      ...start,
      x: clamp(start.x + dx, 0, 1 - start.width),
      y: clamp(start.y + dy, 0, 1 - start.height),
    }
  }

  const growsRight = handle.includes('e')
  const growsDown = handle.includes('s')
  const anchorX = growsRight ? start.x : start.x + start.width
  const anchorY = growsDown ? start.y : start.y + start.height
  const maxWidth = growsRight ? 1 - anchorX : anchorX
  const maxHeight = growsDown ? 1 - anchorY : anchorY

  let width = clamp(start.width + (growsRight ? dx : -dx), MIN_CROP_SIZE, maxWidth)
  let height = clamp(start.height + (growsDown ? dy : -dy), MIN_CROP_SIZE, maxHeight)

  if (aspect) {
    height = width / aspect
    if (height > maxHeight) {
      height = maxHeight
      width = height * aspect
    }
  }

  return {
    x: growsRight ? anchorX : anchorX - width,
    y: growsDown ? anchorY : anchorY - height,
    width,
    height,
  }
}

/** Returns the box an image occupies inside a container under `object-fit: contain`. */
export const fitContain = (container: Size, image: Size) => {
  if (!container.width || !container.height || !image.width || !image.height) {
    return { left: 0, top: 0, width: 0, height: 0 }
  }

  const scale = Math.min(container.width / image.width, container.height / image.height)
  const width = image.width * scale
  const height = image.height * scale

  return {
    left: (container.width - width) / 2,
    top: (container.height - height) / 2,
    width,
    height,
  }
}
