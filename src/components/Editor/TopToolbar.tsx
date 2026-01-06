'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useEditorStore } from '@/store/editorStore'

export const TopToolbar: React.FC = () => {
  const { 
    undo, 
    redo, 
    toggleComparison, 
    showComparison, 
    historyIndex, 
    history,
    currentImage 
  } = useEditorStore()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const [showShortcuts, setShowShortcuts] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Spacebar for comparison
      if (e.code === 'Space' && currentImage) {
        e.preventDefault()
        toggleComparison()
      }

      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      }

      // Cmd/Ctrl + Shift + Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        if (canRedo) redo()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleComparison, undo, redo, canUndo, canRedo, currentImage])

  return (
    <div className="w-full px-4 pt-4 pb-3">
      <div className="w-full max-w-[1400px] mx-auto bg-white/85 backdrop-blur-xl border border-white/60 shadow-lg shadow-indigo-200/40 rounded-2xl px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200/60">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Luxo Editor</span>
            <span className="text-sm font-semibold text-slate-900">Workspace</span>
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-200/60">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="w-10 h-10 rounded-xl bg-white/80 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:-translate-y-0.5 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Undo (Ctrl/Cmd + Z)"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="w-10 h-10 rounded-xl bg-white/80 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:-translate-y-0.5 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Redo (Ctrl/Cmd + Shift + Z)"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        {/* View toggle & nav */}
        <div className="flex items-center gap-3 ml-auto relative">
          <button
            onClick={toggleComparison}
            disabled={!currentImage}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg border border-indigo-200/60 ${
              showComparison
                ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                : 'bg-white/90 text-indigo-600 hover:bg-indigo-50'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Toggle split view (Spacebar)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M12 5v14" />
            </svg>
          </button>

          <Link
            href="/presets"
            className="px-5 h-12 rounded-full border border-slate-300 text-slate-800 bg-white/90 hover:shadow-md transition-all font-semibold inline-flex items-center"
          >
            Go to presets
          </Link>
          <Link
            href="/logout"
            className="px-4 h-12 rounded-full border border-rose-200 text-rose-600 bg-white/90 hover:shadow-md transition-all font-semibold inline-flex items-center"
          >
            Sign out
          </Link>

          <button
            onClick={() => setShowShortcuts((prev) => !prev)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white/90 border border-slate-200 text-slate-600 hover:-translate-y-0.5 hover:shadow-md"
            title="Keyboard shortcuts"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 12h14M5 16h6" />
            </svg>
          </button>

          {showShortcuts && (
            <div className="absolute right-0 top-14 z-30 w-72 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-indigo-200/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-900">Keyboard shortcuts</p>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close shortcuts"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid gap-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Toggle compare</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Space</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Undo</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Ctrl/Cmd + Z</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Redo</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Ctrl/Cmd + Shift + Z</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Drag to import</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Drop image</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
