import { cropToPixels } from '@/lib/crop'
import { createRenderer } from './createRenderer'
import { RenderEdit } from './types'

export type ExportFormat = 'jpeg' | 'png'

const MAX_TILE_SIZE = 4096

const nextTask = () => new Promise((resolve) => setTimeout(resolve))

/**
 * Renders the edit at full size, one tile at a time. Every adjustment reads a
 * single pixel, so tile boundaries cannot show. Filters that read neighbouring
 * pixels, such as sharpening, would need tiles with overlapping edges.
 */
export const renderFullSize = async (
  image: HTMLImageElement | HTMLCanvasElement,
  edit: RenderEdit,
  background?: string
): Promise<HTMLCanvasElement> => {
  const area = edit.crop
    ? cropToPixels(edit.crop, image)
    : { x: 0, y: 0, width: image.width, height: image.height }

  const output = document.createElement('canvas')
  output.width = area.width
  output.height = area.height

  const outputCtx = output.getContext('2d')
  if (!outputCtx) throw new Error('Failed to get canvas context')

  if (background) {
    outputCtx.fillStyle = background
    outputCtx.fillRect(0, 0, area.width, area.height)
  }

  const tileCanvas = document.createElement('canvas')
  const renderCanvas = document.createElement('canvas')
  const renderer = createRenderer(renderCanvas, { useMipmaps: false })
  const tileSize = Math.min(MAX_TILE_SIZE, renderer.maxSourceSize)

  try {
    for (let y = 0; y < area.height; y += tileSize) {
      for (let x = 0; x < area.width; x += tileSize) {
        const width = Math.min(tileSize, area.width - x)
        const height = Math.min(tileSize, area.height - y)

        tileCanvas.width = width
        tileCanvas.height = height

        const tileCtx = tileCanvas.getContext('2d', { willReadFrequently: true })
        if (!tileCtx) throw new Error('Failed to get canvas context')

        tileCtx.drawImage(image, area.x + x, area.y + y, width, height, 0, 0, width, height)

        renderer.setSource(tileCanvas)
        renderer.render({ ...edit, crop: null, compareSplit: null })
        outputCtx.drawImage(renderCanvas, x, y)

        await nextTask()
      }
    }
  } finally {
    renderer.dispose({ releaseContext: true })
  }

  return output
}

export const exportImage = async (
  image: HTMLImageElement,
  edit: RenderEdit,
  format: ExportFormat,
  quality: number
): Promise<Blob> => {
  // JPEG has no transparency, so transparent areas would otherwise turn black
  const canvas = await renderFullSize(image, edit, format === 'jpeg' ? '#ffffff' : undefined)

  const blob = await new Promise<Blob | null>((resolve) => {
    if (format === 'jpeg') canvas.toBlob(resolve, 'image/jpeg', quality / 100)
    else canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) throw new Error('Failed to create the file')

  return blob
}
