'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'

export const ImportErrorToast: React.FC = () => {
  const importError = useEditorStore((state) => state.importError)
  const clearImportError = useEditorStore((state) => state.clearImportError)

  if (!importError) return null

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-700 shadow-xl"
    >
      {importError}
      <button
        type="button"
        onClick={clearImportError}
        className="text-rose-400 hover:text-rose-600"
        aria-label="Dismiss message"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
