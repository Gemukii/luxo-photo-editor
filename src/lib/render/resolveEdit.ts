import { Adjustments, AppliedLook, CropRect } from '@/types/editor.types'
import { resolveAdjustments } from '@/lib/adjustments'
import { getLook } from '@/lib/looks/catalog'
import { Lut } from '@/lib/looks/cube'
import { RenderEdit } from './types'

/** Combines the user's edit and a look into what the renderers draw. */
export const resolveEdit = (
  adjustments: Adjustments,
  crop: CropRect | null,
  look: AppliedLook | null,
  lut: Lut | null
): RenderEdit => ({
  adjustments: resolveAdjustments(adjustments, getLook(look?.id), look),
  crop,
  lut,
  lutMix: lut ? look?.strength ?? 0 : 0,
})
