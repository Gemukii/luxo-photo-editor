import { cropImageData } from '@/lib/crop'
import { downsampleImageData, renderEdit } from '@/lib/imageProcessor'
import { RenderEdit, Renderer, RenderParams } from './types'

/** Fallback for browsers without WebGL2. It is slower, but produces the same image. */
export class CpuRenderer implements Renderer {
  readonly kind = 'cpu'
  readonly maxSourceSize = Infinity

  private source: ImageData | null = null

  constructor(private readonly canvas: HTMLCanvasElement) {}

  setSource(source: HTMLCanvasElement) {
    const ctx = source.getContext('2d', { willReadFrequently: true })
    this.source = ctx?.getImageData(0, 0, source.width, source.height) ?? null
  }

  render(params: RenderParams) {
    const ctx = this.canvas.getContext('2d')
    if (!this.source || !ctx) return

    const edited = renderEdit(this.source, params)
    const { width, height } = edited

    if (this.canvas.width !== width) this.canvas.width = width
    if (this.canvas.height !== height) this.canvas.height = height

    ctx.putImageData(edited, 0, 0)

    if (params.compareSplit !== null) {
      const original = cropImageData(this.source, params.crop)
      ctx.putImageData(original, 0, 0, 0, 0, Math.round(width * params.compareSplit), height)
    }
  }

  readPreview(edit: RenderEdit, maxWidth: number) {
    if (!this.source) return new ImageData(1, 1)

    const small = downsampleImageData(cropImageData(this.source, edit.crop), maxWidth)
    return renderEdit(small, { ...edit, crop: null })
  }

  dispose() {
    this.source = null
  }
}
