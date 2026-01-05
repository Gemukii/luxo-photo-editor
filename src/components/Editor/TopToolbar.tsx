'use client'
import React, { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'

const filters = ['All', 'Landscape', 'Portrait', 'B&W', 'Vintage']

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

  const [activeFilter, setActiveFilter] = useState('B&W')

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

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
    <div className="w-full px-6 pt-6 pb-4">
      <div className="w-full max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-indigo-200/40 rounded-2xl px-4 py-3 flex items-center gap-4">
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

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {filters.map((filter) => {
            const isActive = activeFilter === filter
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 border ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-200 border-transparent'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:shadow-sm'
                }`}
              >
                {filter}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white/80 border border-slate-200 rounded-full px-4 py-2 shadow-inner">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-32"
          />
        </div>

        {/* View toggle & create */}
        <div className="flex items-center gap-3">
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

          <button className="px-5 h-12 rounded-full border border-slate-300 text-slate-800 bg-white/90 hover:shadow-md transition-all font-semibold">
            Create New
          </button>
        </div>
      </div>
    </div>
  )
}
