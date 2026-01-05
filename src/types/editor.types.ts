export interface Adjustments {
  exposure: number
  contrast: number
  highlights: number
  shadows: number
  whites: number
  blacks: number
  saturation: number
  vibrance: number
  temperature: number
  tint: number
  sharpness: number
  clarity: number
}

export interface EditorState {
  // Image data
  currentImage: HTMLImageElement | null
  originalImageData: ImageData | null
  processedImageData: ImageData | null
  
  // File info
  fileName: string
  fileSize: number
  isRaw: boolean
  
  // Adjustments
  adjustments: Adjustments
  
  // History for undo/redo
  history: Adjustments[]
  historyIndex: number
  
  // UI state
  isLoading: boolean
  showComparison: boolean
  comparisonMode: 'split' | 'toggle' | 'side-by-side'
  
  // Actions
  setImage: (image: HTMLImageElement, fileName: string, fileSize: number) => void
  updateAdjustment: (key: keyof Adjustments, value: number) => void
  resetAdjustment: (key: keyof Adjustments) => void
  resetAllAdjustments: () => void
  undo: () => void
  redo: () => void
  toggleComparison: () => void
  setComparisonMode: (mode: 'split' | 'toggle' | 'side-by-side') => void
}

export const defaultAdjustments: Adjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  saturation: 0,
  vibrance: 0,
  temperature: 0,
  tint: 0,
  sharpness: 0,
  clarity: 0,
}
