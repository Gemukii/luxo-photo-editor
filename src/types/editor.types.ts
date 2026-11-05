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
}

export type CropAspect = 'free' | '16:9' | '1:1' | '4:3' | '4:5'

export interface CropRect {
  // Normalized coordinates relative to the source image (0-1)
  x: number
  y: number
  width: number
  height: number
}

/** One undo step: everything needed to render an edit from the source image. */
export interface EditSnapshot {
  adjustments: Adjustments
  crop: CropRect | null
}

export type EditorTab = 'adjust' | 'crop' | 'presets' | 'export'

export interface EditorState {
  // Image data
  currentImage: HTMLImageElement | null
  originalImageData: ImageData | null
  previewImageData: ImageData | null

  // File info
  fileName: string
  fileSize: number
  fileType: string
  dimensions: { width: number; height: number }

  // Edit data
  adjustments: Adjustments
  crop: CropRect | null

  // History for undo/redo
  history: EditSnapshot[]
  historyIndex: number

  // UI state
  isLoading: boolean
  isProcessing: boolean
  importError: string | null
  showComparison: boolean
  comparisonMode: 'split' | 'toggle'
  activeTab: EditorTab
  cropRect: CropRect
  cropAspect: CropAspect

  // Export state
  showExportModal: boolean

  // Actions
  importFile: (file: File) => Promise<void>
  clearImportError: () => void
  setImage: (image: HTMLImageElement, fileName: string, fileSize: number, fileType: string) => void
  setPreviewImageData: (data: ImageData | null) => void
  updateAdjustment: (key: keyof Adjustments, value: number) => void
  commitHistory: () => void
  resetAdjustment: (key: keyof Adjustments) => void
  resetAllAdjustments: () => void
  undo: () => void
  redo: () => void
  toggleComparison: () => void
  setComparisonMode: (mode: 'split' | 'toggle') => void
  setActiveTab: (tab: EditorTab) => void
  setCropRect: (rect: CropRect) => void
  setCropAspect: (aspect: CropAspect) => void
  resetCrop: () => void
  applyCrop: () => void
  setShowExportModal: (show: boolean) => void
  setIsProcessing: (processing: boolean) => void
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
}
