export const PREVIEW_MAX_EDGE = 2560
export const THUMBNAIL_MAX_EDGE = 320

/** Creates a downscaled copy, so that editing speed does not depend on the camera. */
export const createProxy = (image: HTMLImageElement, maxEdge: number): HTMLCanvasElement => {
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')

  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Failed to get canvas context')

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas
}
