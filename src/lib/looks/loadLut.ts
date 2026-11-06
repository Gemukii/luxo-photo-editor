import { Look } from './catalog'
import { Lut, parseCube } from './cube'

const cache = new Map<string, Promise<Lut>>()

export const loadLookLut = (look: Look): Promise<Lut> | null => {
  if (!look.lut) return null

  const cached = cache.get(look.id)
  if (cached) return cached

  const { src } = look.lut
  const loading = fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${src}`)
      return response.text()
    })
    .then((text) => parseCube(text, look.id))

  // A failed load can be retried the next time the look is chosen
  loading.catch(() => cache.delete(look.id))
  cache.set(look.id, loading)

  return loading
}
