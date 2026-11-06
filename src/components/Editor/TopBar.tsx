'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button, buttonStyles } from '@/components/UI/Button'
import { useEditorStore } from '@/store/editorStore'
import { OpenImageButton } from './OpenImageButton'

const SHORTCUTS = [
  { label: 'Compare before and after', keys: 'Space' },
  { label: 'Undo', keys: 'Ctrl/Cmd + Z' },
  { label: 'Redo', keys: 'Ctrl/Cmd + Shift + Z' },
  { label: 'Reset a slider', keys: 'Double-click' },
]

const iconButton =
  'flex h-9 w-9 items-center justify-center rounded-lg text-kinari transition-colors hover:bg-sumi-700 hover:text-gofun disabled:cursor-not-allowed disabled:opacity-30'

const Icon: React.FC<{ path: string }> = ({ path }) => (
  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={path} />
  </svg>
)

// A focused control keeps its own keyboard behaviour, unless it was focused by a click
const shouldIgnoreShortcut = (target: EventTarget | null, code: string) => {
  if (!(target instanceof HTMLElement)) return false
  if (target instanceof HTMLInputElement && target.type === 'number') return true
  return code === 'Space' && target.matches('button:focus-visible, [role="slider"]')
}

export const TopBar: React.FC = () => {
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const toggleComparison = useEditorStore((state) => state.toggleComparison)
  const showComparison = useEditorStore((state) => state.showComparison)
  const historyIndex = useEditorStore((state) => state.historyIndex)
  const historyLength = useEditorStore((state) => state.history.length)
  const currentImage = useEditorStore((state) => state.currentImage)
  const fileName = useEditorStore((state) => state.fileName)
  const setShowExportModal = useEditorStore((state) => state.setShowExportModal)

  const [showShortcuts, setShowShortcuts] = useState(false)
  const shortcutsRef = useRef<HTMLDivElement>(null)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < historyLength - 1

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentImage || shouldIgnoreShortcut(e.target, e.code)) return

      if (e.code === 'Space') {
        e.preventDefault()
        toggleComparison()
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleComparison, undo, redo, currentImage])

  useEffect(() => {
    if (!showShortcuts) return

    const close = (e: PointerEvent) => {
      if (!shortcutsRef.current?.contains(e.target as Node)) setShowShortcuts(false)
    }

    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [showShortcuts])

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sumi-700 bg-sumi-900 px-4">
      <span className="font-serif text-lg font-medium tracking-[0.32em] text-gofun">LUXO</span>

      {currentImage && (
        <>
          <span className="ml-4 hidden max-w-[240px] truncate text-sm text-nezumi md:block" title={fileName}>
            {fileName}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={undo} disabled={!canUndo} className={iconButton} aria-label="Undo" title="Undo">
              <Icon path="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 010 11H11" />
            </button>
            <button type="button" onClick={redo} disabled={!canRedo} className={iconButton} aria-label="Redo" title="Redo">
              <Icon path="M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 000 11H13" />
            </button>
            <button
              type="button"
              onClick={toggleComparison}
              aria-pressed={showComparison}
              aria-label="Compare before and after"
              title="Compare before and after"
              className={`${iconButton} ${showComparison ? 'bg-sumi-700 text-kincha hover:text-kincha' : ''}`}
            >
              <Icon path="M12 3v18M8 6H5a1 1 0 00-1 1v10a1 1 0 001 1h3m8-12h3a1 1 0 011 1v10a1 1 0 01-1 1h-3" />
            </button>

            <div ref={shortcutsRef} className="relative">
              <button
                type="button"
                onClick={() => setShowShortcuts((value) => !value)}
                aria-expanded={showShortcuts}
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts"
                className={`${iconButton} hidden sm:flex`}
              >
                <Icon path="M4 7h16v10H4zM8 11h.01M12 11h.01M16 11h.01M9 14.5h6" />
              </button>

              {showShortcuts && (
                <div className="absolute right-0 top-11 z-30 w-72 rounded-lg border border-sumi-600 bg-sumi-700 p-3 shadow-2xl">
                  <dl className="grid gap-2 text-sm">
                    {SHORTCUTS.map(({ label, keys }) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <dt className="text-kinari">{label}</dt>
                        <dd className="shrink-0 text-xs text-nezumi">{keys}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            <div className="mx-2 hidden h-6 w-px bg-sumi-600 sm:block" />

            <OpenImageButton className={`${buttonStyles.base} ${buttonStyles.ghost} hidden sm:inline-flex`}>
              Open
            </OpenImageButton>
            <Button variant="primary" onClick={() => setShowExportModal(true)}>
              Export
            </Button>
          </div>
        </>
      )}
    </header>
  )
}
