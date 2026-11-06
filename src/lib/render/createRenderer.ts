import { CpuRenderer } from './cpuRenderer'
import { GlRenderer } from './glRenderer'
import { Renderer } from './types'

export const createRenderer = (
  canvas: HTMLCanvasElement,
  options?: { useMipmaps?: boolean; onRestored?: () => void }
): Renderer => GlRenderer.create(canvas, options) ?? new CpuRenderer(canvas)
