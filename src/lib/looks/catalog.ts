import { Adjustments } from '@/types/editor.types'

export type LookCategory = 'Landscape' | 'Portrait' | 'B&W' | 'Vintage'

export interface Look {
  id: string
  name: string
  category: LookCategory
  adjustments?: Partial<Adjustments>
  lut?: { src: string }
}

export const LOOK_CATEGORIES: LookCategory[] = ['Landscape', 'Portrait', 'B&W', 'Vintage']

export const LOOKS: Look[] = [
  {
    id: 'clear-day',
    name: 'Clear Day',
    category: 'Landscape',
    adjustments: { contrast: 12, vibrance: 28, shadows: 14, highlights: -12 },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'Landscape',
    lut: { src: '/luts/golden-hour.cube' },
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    category: 'Landscape',
    lut: { src: '/luts/evergreen.cube' },
  },
  {
    id: 'soft-light',
    name: 'Soft Light',
    category: 'Portrait',
    adjustments: { exposure: 0.15, contrast: -10, shadows: 18, saturation: -6, temperature: 6 },
  },
  {
    id: 'warm-skin',
    name: 'Warm Skin',
    category: 'Portrait',
    lut: { src: '/luts/warm-skin.cube' },
  },
  {
    id: 'moody-blue',
    name: 'Moody Blue',
    category: 'Portrait',
    adjustments: { exposure: -0.1 },
    lut: { src: '/luts/moody-blue.cube' },
  },
  {
    id: 'cinema',
    name: 'Cinema',
    category: 'Portrait',
    lut: { src: '/luts/cinema.cube' },
  },
  {
    id: 'silver',
    name: 'Silver',
    category: 'B&W',
    lut: { src: '/luts/silver.cube' },
  },
  {
    id: 'hard-noir',
    name: 'Hard Noir',
    category: 'B&W',
    adjustments: { saturation: -100, contrast: 45, blacks: 40, whites: 25 },
  },
  {
    id: 'faded-film',
    name: 'Faded Film',
    category: 'Vintage',
    lut: { src: '/luts/faded-film.cube' },
  },
  {
    id: 'instant-film',
    name: 'Instant Film',
    category: 'Vintage',
    lut: { src: '/luts/instant-film.cube' },
  },
]

export const getLook = (id: string | undefined | null): Look | undefined =>
  LOOKS.find((look) => look.id === id)
