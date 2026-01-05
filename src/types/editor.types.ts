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

export type CropAspect = 'free' | '16:9' | '1:1' | '4:3' | '4:5'

export interface CropRect {
  // Normalized coordinates relative to the image (0-1)
  x: number
  y: number
  width: number
  height: number
}

export interface EditorState {
  // Image data
  currentImage: HTMLImageElement | null
  originalImageData: ImageData | null
  previewImageData: ImageData | null
  canvasRef: HTMLCanvasElement | null
  
  // File info
  fileName: string
  fileSize: number
  fileType: string
  dimensions: { width: number; height: number }
  
  // Adjustments
  adjustments: Adjustments
  
  // History for undo/redo
  history: Adjustments[]
  historyIndex: number
  
  // UI state
  isLoading: boolean
  isProcessing: boolean
  showComparison: boolean
  comparisonMode: 'split' | 'toggle'
  activeTab: 'adjust' | 'crop' | 'presets' | 'export'
  cropRect: CropRect
  cropAspect: CropAspect
  
  // Export state
  showExportModal: boolean
  
  // Actions
  setImage: (image: HTMLImageElement, fileName: string, fileSize: number, fileType: string) => void
  setPreviewImageData: (data: ImageData | null) => void
  setCanvasRef: (canvas: HTMLCanvasElement | null) => void
  updateAdjustment: (key: keyof Adjustments, value: number) => void
  resetAdjustment: (key: keyof Adjustments) => void
  resetAllAdjustments: () => void
  undo: () => void
  redo: () => void
  toggleComparison: () => void
  setComparisonMode: (mode: 'split' | 'toggle') => void
  setActiveTab: (tab: 'adjust' | 'crop' | 'presets' | 'export') => void
  setCropRect: (rect: CropRect) => void
  setCropAspect: (aspect: CropAspect) => void
  resetCrop: () => void
  applyCrop: () => Promise<void>
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
  sharpness: 0,
  clarity: 0,
}
