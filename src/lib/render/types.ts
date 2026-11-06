import { Adjustments, CropRect } from '@/types/editor.types'
import { Lut } from '@/lib/looks/cube'

/** Everything that defines the rendered pixels. */
export interface RenderEdit {
  adjustments: Adjustments
  crop: CropRect | null
  lut: Lut | null
  lutMix: number
}

export interface RenderParams extends RenderEdit {
  /** Width fraction shown unedited on the left, or null for no comparison. */
  compareSplit: number | null
}

export interface Renderer {
  readonly kind: 'webgl2' | 'cpu'
  /** Largest source the renderer accepts in one piece. */
  readonly maxSourceSize: number
  setSource: (source: HTMLCanvasElement) => void
  /** Sizes the canvas to the cropped source, and draws the edit on it. */
  render: (params: RenderParams) => void
  /** Returns a small version of the edit, for the histogram. */
  readPreview: (edit: RenderEdit, maxWidth: number) => ImageData
  dispose: (options?: { releaseContext?: boolean }) => void
}
