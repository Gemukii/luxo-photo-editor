import { create } from 'zustand'
import {
  EditorState,
  defaultAdjustments,
  Adjustments,
  CropRect,
  CropAspect,
} from '@/types/editor.types'

const MAX_HISTORY = 30

const parseAspectValue = (aspect: CropAspect): number | null => {
  if (aspect === 'free') return null
  const [w, h] = aspect.split(':').map(Number)
  return h ? w / h : null
}

const createDefaultCropRect = (): CropRect => ({
  x: 0.2,
  y: 0.15,
  width: 0.6,
  height: 0.6,
})

const adjustRectToAspect = (rect: CropRect, aspect: CropAspect): CropRect => {
  const ratio = parseAspectValue(aspect)
  if (!ratio) return rect

  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2

  let width = rect.width
  let height = width / ratio

  if (height > rect.height) {
    height = rect.height
    width = height * ratio
  }

  // Clamp to bounds
  width = Math.min(width, 1)
  height = Math.min(height, 1)

  let x = Math.max(0, Math.min(1 - width, centerX - width / 2))
  let y = Math.max(0, Math.min(1 - height, centerY - height / 2))

  return { x, y, width, height }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  currentImage: null,
  originalImageData: null,
  previewImageData: null,
  canvasRef: null,
  fileName: '',
  fileSize: 0,
  fileType: '',
  dimensions: { width: 0, height: 0 },
  adjustments: { ...defaultAdjustments },
  history: [{ ...defaultAdjustments }],
  historyIndex: 0,
  isLoading: false,
  isProcessing: false,
  showComparison: false,
  comparisonMode: 'split',
  activeTab: 'adjust',
  cropRect: createDefaultCropRect(),
  cropAspect: 'free',
  showExportModal: false,

  setImage: (image, fileName, fileSize, fileType) => {
    set({
      currentImage: image,
      fileName,
      fileSize,
      fileType,
      dimensions: { width: image.width, height: image.height },
      isLoading: false,
      adjustments: { ...defaultAdjustments },
      history: [{ ...defaultAdjustments }],
      historyIndex: 0,
      cropRect: createDefaultCropRect(),
      cropAspect: 'free',
    })
  },

  setPreviewImageData: (data) => {
    set({ previewImageData: data, isProcessing: false })
  },

  setCanvasRef: (canvas) => {
    set({ canvasRef: canvas })
  },

  updateAdjustment: (key, value) => {
    const state = get()
    const newAdjustments = {
      ...state.adjustments,
      [key]: value,
    }

    const newHistory = [
      ...state.history.slice(0, state.historyIndex + 1),
      newAdjustments,
    ].slice(-MAX_HISTORY)

    set({
      adjustments: newAdjustments,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  resetAdjustment: (key) => {
    get().updateAdjustment(key, defaultAdjustments[key])
  },

  resetAllAdjustments: () => {
    set({
      adjustments: { ...defaultAdjustments },
      history: [{ ...defaultAdjustments }],
      historyIndex: 0,
    })
  },

  undo: () => {
    const state = get()
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1
      set({
        adjustments: state.history[newIndex],
        historyIndex: newIndex,
      })
    }
  },

  redo: () => {
    const state = get()
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1
      set({
        adjustments: state.history[newIndex],
        historyIndex: newIndex,
      })
    }
  },

  toggleComparison: () => {
    set((state) => ({ showComparison: !state.showComparison }))
  },

  setComparisonMode: (mode) => {
    set({ comparisonMode: mode })
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab })
  },

  setCropRect: (rect) => {
    const clamped: CropRect = {
      x: Math.max(0, Math.min(1 - rect.width, rect.x)),
      y: Math.max(0, Math.min(1 - rect.height, rect.y)),
      width: Math.max(0.05, Math.min(1, rect.width)),
      height: Math.max(0.05, Math.min(1, rect.height)),
    }

    set({ cropRect: clamped })
  },

  setCropAspect: (aspect) => {
    set((state) => ({
      cropAspect: aspect,
      cropRect: adjustRectToAspect(state.cropRect, aspect),
    }))
  },

  resetCrop: () => {
    set({ cropRect: createDefaultCropRect(), cropAspect: 'free' })
  },

  applyCrop: async () => {
    const state = get()
    const { originalImageData, cropRect, fileType } = state

    if (!originalImageData || !state.currentImage) return

    const baseWidth = originalImageData.width
    const baseHeight = originalImageData.height

    const cropX = Math.round(cropRect.x * baseWidth)
    const cropY = Math.round(cropRect.y * baseHeight)
    const cropWidth = Math.max(1, Math.round(cropRect.width * baseWidth))
    const cropHeight = Math.max(1, Math.round(cropRect.height * baseHeight))

    const clampedX = Math.min(Math.max(0, cropX), baseWidth - 1)
    const clampedY = Math.min(Math.max(0, cropY), baseHeight - 1)
    const clampedW = Math.min(cropWidth, baseWidth - clampedX)
    const clampedH = Math.min(cropHeight, baseHeight - clampedY)

    const cropped = new ImageData(clampedW, clampedH)
    const source = originalImageData.data
    const dest = cropped.data

    for (let y = 0; y < clampedH; y++) {
      const srcStart = ((clampedY + y) * baseWidth + clampedX) * 4
      const destStart = y * clampedW * 4
      dest.set(source.slice(srcStart, srcStart + clampedW * 4), destStart)
    }

    const canvas = document.createElement('canvas')
    canvas.width = clampedW
    canvas.height = clampedH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.putImageData(cropped, 0, 0)

    const dataUrl = canvas.toDataURL(fileType || 'image/png')

    const newImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = (err) => reject(err)
      img.src = dataUrl
    })

    set({
      currentImage: newImage,
      originalImageData: cropped,
      dimensions: { width: clampedW, height: clampedH },
      cropRect: createDefaultCropRect(),
    })
  },

  setShowExportModal: (show) => {
    set({ showExportModal: show })
  },

  setIsProcessing: (processing) => {
    set({ isProcessing: processing })
  },
}))
