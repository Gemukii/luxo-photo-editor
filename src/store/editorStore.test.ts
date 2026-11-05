import { beforeEach, describe, expect, it } from 'vitest'
import { defaultAdjustments } from '@/types/editor.types'
import { MAX_HISTORY, useEditorStore } from './editorStore'

const store = () => useEditorStore.getState()
const image = { width: 600, height: 400 } as HTMLImageElement
const frame = { x: 0.1, y: 0.1, width: 0.5, height: 0.5 }

beforeEach(() => {
  store().setImage(image, 'photo.jpg', 1000, 'image/jpeg')
})

describe('history', () => {
  it('records one step per gesture', () => {
    store().updateAdjustment('exposure', 0.1)
    store().updateAdjustment('exposure', 0.2)
    store().updateAdjustment('exposure', 0.3)
    store().commitHistory()

    expect(store().history).toHaveLength(2)

    store().undo()
    expect(store().adjustments.exposure).toBe(0)
  })

  it('ignores a commit with no change', () => {
    store().commitHistory()
    expect(store().history).toHaveLength(1)
  })

  it('redoes an undone step', () => {
    store().updateAdjustment('contrast', 20)
    store().commitHistory()
    store().undo()
    store().redo()

    expect(store().adjustments.contrast).toBe(20)
  })

  it('commits a pending change before undoing it', () => {
    store().updateAdjustment('contrast', 20)
    store().undo()

    expect(store().adjustments.contrast).toBe(0)
    store().redo()
    expect(store().adjustments.contrast).toBe(20)
  })

  it('makes reset all undoable', () => {
    store().updateAdjustment('contrast', 20)
    store().commitHistory()
    store().resetAllAdjustments()
    expect(store().adjustments).toEqual(defaultAdjustments)

    store().undo()
    expect(store().adjustments.contrast).toBe(20)
  })

  it('keeps at most the maximum number of steps', () => {
    for (let i = 1; i <= MAX_HISTORY + 10; i++) {
      store().updateAdjustment('contrast', i)
      store().commitHistory()
    }

    expect(store().history).toHaveLength(MAX_HISTORY)
    expect(store().historyIndex).toBe(MAX_HISTORY - 1)
  })
})

describe('crop', () => {
  const applyFrame = () => {
    store().setActiveTab('crop')
    store().setCropRect(frame)
    store().applyCrop()
  }

  it('applies the frame and returns to the adjust tab', () => {
    applyFrame()

    expect(store().crop).toEqual(frame)
    expect(store().activeTab).toBe('adjust')
  })

  it('can be undone and redone', () => {
    applyFrame()

    store().undo()
    expect(store().crop).toBeNull()

    store().redo()
    expect(store().crop).toEqual(frame)
  })

  it('reset restores the full image', () => {
    applyFrame()
    store().resetCrop()

    expect(store().crop).toBeNull()
  })

  it('reopens on the applied crop', () => {
    applyFrame()
    store().setActiveTab('crop')

    expect(store().cropRect).toEqual(frame)
  })

  it('does not apply a frame that was left without confirming', () => {
    store().setActiveTab('crop')
    store().setCropRect(frame)
    store().setActiveTab('adjust')

    expect(store().crop).toBeNull()
  })

  it('keeps the adjustments', () => {
    store().updateAdjustment('contrast', 20)
    store().commitHistory()
    applyFrame()

    expect(store().adjustments.contrast).toBe(20)
  })
})

describe('setImage', () => {
  it('clears the previous edit', () => {
    store().updateAdjustment('contrast', 20)
    store().commitHistory()
    store().setImage(image, 'other.jpg', 1000, 'image/jpeg')

    expect(store().adjustments).toEqual(defaultAdjustments)
    expect(store().history).toHaveLength(1)
    expect(store().crop).toBeNull()
  })
})

describe('importFile', () => {
  it('shows a message for an unsupported file', async () => {
    await store().importFile({ name: 'IMG_0001.CR2', type: '', size: 1 } as File)

    expect(store().importError).toMatch(/RAW/)
  })
})
