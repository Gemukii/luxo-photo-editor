import create from 'zustand'
import { EditorState, defaultAdjustments, Adjustments } from '../types/editor.types'

const MAX_HISTORY = 30

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  currentImage: null,
  originalImageData: null,
  processedImageData: null,
  fileName: '',
  fileSize: 0,
  isRaw: false,
  adjustments: { ...defaultAdjustments },
  history: [{ ...defaultAdjustments }],
  historyIndex: 0,
  isLoading: false,
  showComparison: false,
  comparisonMode: 'split',

  // Set image
  setImage: (image, fileName, fileSize) => {
    set({
      currentImage: image,
      fileName,
      fileSize,
      isRaw: /\.(dng|cr2|cr3|nef|arw)$/i.test(fileName),
      isLoading: false,
      adjustments: { ...defaultAdjustments },
      history: [{ ...defaultAdjustments }],
      historyIndex: 0,
    })
  },

  // Update single adjustment
  updateAdjustment: (key, value) => {
    const state = get()
    const newAdjustments = {
      ...state.adjustments,
      [key]: value,
    }

    // Add to history (remove future history if we're not at the end)
    const newHistory = [
      ...state.history.slice(0, state.historyIndex + 1),
      newAdjustments,
    ].slice(-MAX_HISTORY) // Keep only last MAX_HISTORY states

    set({
      adjustments: newAdjustments,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  // Reset single adjustment
  resetAdjustment: (key) => {
    get().updateAdjustment(key, defaultAdjustments[key])
  },

  // Reset all adjustments
  resetAllAdjustments: () => {
    set({
      adjustments: { ...defaultAdjustments },
      history: [{ ...defaultAdjustments }],
      historyIndex: 0,
    })
  },

  // Undo
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

  // Redo
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

  // Toggle comparison
  toggleComparison: () => {
    set((state) => ({ showComparison: !state.showComparison }))
  },

  // Set comparison mode
  setComparisonMode: (mode) => {
    set({ comparisonMode: mode })
  },
}))
