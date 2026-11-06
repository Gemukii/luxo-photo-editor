'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'

export const NoticeToast: React.FC = () => {
  const notice = useEditorStore((state) => state.notice)
  const setNotice = useEditorStore((state) => state.setNotice)

  if (!notice) return null

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border border-sumi-600 border-l-shu-bright bg-sumi-700 py-3 pl-4 pr-3 text-sm text-gofun shadow-2xl"
    >
      {notice}
      <button
        type="button"
        onClick={() => setNotice(null)}
        className="text-nezumi hover:text-gofun"
        aria-label="Dismiss message"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
