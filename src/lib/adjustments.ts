import { Adjustments, AppliedLook } from '@/types/editor.types'
import { Look } from '@/lib/looks/catalog'

export interface AdjustmentControl {
  key: keyof Adjustments
  label: string
  min: number
  max: number
  step: number
  /** CSS gradient for sliders whose direction is a colour. */
  track?: string
}

const percent = { min: -100, max: 100, step: 1 }

export const LIGHT_CONTROLS: AdjustmentControl[] = [
  { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.1 },
  { key: 'contrast', label: 'Contrast', ...percent },
  { key: 'highlights', label: 'Highlights', ...percent },
  { key: 'shadows', label: 'Shadows', ...percent },
  { key: 'whites', label: 'Whites', ...percent },
  { key: 'blacks', label: 'Blacks', ...percent },
]

export const COLOR_CONTROLS: AdjustmentControl[] = [
  {
    key: 'temperature',
    label: 'Temperature',
    ...percent,
    track: 'linear-gradient(90deg, #4f8fa8, #5a554c 50%, #cf9a3f)',
  },
  {
    key: 'tint',
    label: 'Tint',
    ...percent,
    track: 'linear-gradient(90deg, #6d9c73, #5a554c 50%, #b1608a)',
  },
  { key: 'saturation', label: 'Saturation', ...percent },
  { key: 'vibrance', label: 'Vibrance', ...percent },
]

const ALL_CONTROLS = [...LIGHT_CONTROLS, ...COLOR_CONTROLS]

/** Adds a look's adjustments, scaled by its strength, to the user's own. */
export const resolveAdjustments = (
  adjustments: Adjustments,
  look: Look | undefined,
  applied: AppliedLook | null
): Adjustments => {
  if (!look?.adjustments || !applied) return adjustments

  const resolved = { ...adjustments }

  for (const { key, min, max } of ALL_CONTROLS) {
    const amount = (look.adjustments[key] ?? 0) * applied.strength
    resolved[key] = Math.max(min, Math.min(max, resolved[key] + amount))
  }

  return resolved
}
