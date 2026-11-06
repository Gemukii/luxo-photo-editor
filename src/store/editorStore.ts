import { create } from 'zustand'
import {
  EditorState,
  EditSnapshot,
  defaultAdjustments,
} from '@/types/editor.types'
import {
  clampCropRect,
  createDefaultCropRect,
  fitRectToAspect,
} from '@/lib/crop'
import { getImportError, loadImageFromFile } from '@/lib/imageLoader'

export const MAX_HISTORY = 30

const createInitialSnapshot = (): EditSnapshot => ({
  adjustments: { ...defaultAdjustments },
  crop: null,
  look: null,
})

const isSameSnapshot = (a: EditSnapshot, b: EditSnapshot) =>
  JSON.stringify(a) === JSON.stringify(b)

export const useEditorStore = create<EditorState>((set, get) => {
  const restoreSnapshot = (index: number) => {
    const snapshot = get().history[index]
    set({
      adjustments: snapshot.adjustments,
      crop: snapshot.crop,
      look: snapshot.look,
      cropRect: snapshot.crop ?? createDefaultCropRect(),
      historyIndex: index,
    })
  }

  return {
    // Initial state
    currentImage: null,
    previewImageData: null,
    fileName: '',
    fileSize: 0,
    fileType: '',
    dimensions: { width: 0, height: 0 },
    adjustments: { ...defaultAdjustments },
    crop: null,
    look: null,
    history: [createInitialSnapshot()],
    historyIndex: 0,
    isLoading: false,
    notice: null,
    showComparison: false,
    comparisonSplit: 0.5,
    activeTab: 'looks',
    cropRect: createDefaultCropRect(),
    cropAspect: 'free',
    showExportModal: false,

    importFile: async (file) => {
      const notice = getImportError(file)
      if (notice) {
        set({ notice })
        return
      }

      set({ isLoading: true, notice: null })

      try {
        const { image, fileName, fileSize } = await loadImageFromFile(file)
        get().setImage(image, fileName, fileSize, file.type)
      } catch (error) {
        console.error('Error loading image:', error)
        set({
          isLoading: false,
          notice: 'This image could not be opened. Please try another file.',
        })
      }
    },

    setNotice: (notice) => {
      set({ notice })
    },

    setImage: (image, fileName, fileSize, fileType) => {
      set({
        currentImage: image,
        previewImageData: null,
        fileName,
        fileSize,
        fileType,
        dimensions: { width: image.width, height: image.height },
        isLoading: false,
        adjustments: { ...defaultAdjustments },
        crop: null,
        look: null,
        history: [createInitialSnapshot()],
        historyIndex: 0,
        showComparison: false,
        comparisonSplit: 0.5,
        activeTab: 'looks',
        cropRect: createDefaultCropRect(),
        cropAspect: 'free',
      })
    },

    setPreviewImageData: (data) => {
      set({ previewImageData: data })
    },

    // Updates the live value only. Call commitHistory when the gesture ends.
    updateAdjustment: (key, value) => {
      set((state) => ({ adjustments: { ...state.adjustments, [key]: value } }))
    },

    commitHistory: () => {
      const { adjustments, crop, look, history, historyIndex } = get()
      const snapshot: EditSnapshot = { adjustments, crop, look }

      if (isSameSnapshot(snapshot, history[historyIndex])) return

      const newHistory = [...history.slice(0, historyIndex + 1), snapshot].slice(-MAX_HISTORY)
      set({ history: newHistory, historyIndex: newHistory.length - 1 })
    },

    resetAdjustment: (key) => {
      get().updateAdjustment(key, defaultAdjustments[key])
      get().commitHistory()
    },

    resetAllAdjustments: () => {
      set({ adjustments: { ...defaultAdjustments } })
      get().commitHistory()
    },

    setLook: (id) => {
      set((state) => ({
        look: id ? { id, strength: state.look?.strength ?? 1 } : null,
      }))
      get().commitHistory()
    },

    // Updates the live value only. Call commitHistory when the gesture ends.
    setLookStrength: (strength) => {
      set((state) => ({ look: state.look ? { ...state.look, strength } : null }))
    },

    undo: () => {
      get().commitHistory()
      const { historyIndex } = get()
      if (historyIndex > 0) restoreSnapshot(historyIndex - 1)
    },

    redo: () => {
      const { history, historyIndex } = get()
      if (historyIndex < history.length - 1) restoreSnapshot(historyIndex + 1)
    },

    toggleComparison: () => {
      set((state) => ({ showComparison: !state.showComparison }))
    },

    setComparisonSplit: (split) => {
      set({ comparisonSplit: Math.max(0, Math.min(1, split)) })
    },

    // Opening the crop tab starts from the applied crop, so it can be adjusted again.
    setActiveTab: (tab) => {
      set((state) => ({
        activeTab: tab,
        cropRect:
          tab === 'crop'
            ? fitRectToAspect(state.crop ?? createDefaultCropRect(), state.cropAspect, state.dimensions)
            : state.cropRect,
      }))
    },

    setCropRect: (rect) => {
      set({ cropRect: clampCropRect(rect) })
    },

    setCropAspect: (aspect) => {
      set((state) => ({
        cropAspect: aspect,
        cropRect: fitRectToAspect(state.cropRect, aspect, state.dimensions),
      }))
    },

    resetCrop: () => {
      set({ crop: null, cropRect: createDefaultCropRect(), cropAspect: 'free' })
      get().commitHistory()
    },

    applyCrop: () => {
      set((state) => ({ crop: state.cropRect, activeTab: 'adjust' }))
      get().commitHistory()
    },

    setShowExportModal: (show) => {
      set({ showExportModal: show })
    },
  }
})
