'use client'
import React, { useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'

const LABEL = 'pointer-events-none absolute top-3 rounded bg-sumi-950/70 px-2 py-0.5 text-xs text-gofun'
const KEYBOARD_STEP = 0.02

export const CompareOverlay: React.FC = () => {
  const split = useEditorStore((state) => state.comparisonSplit)
  const setSplit = useEditorStore((state) => state.setComparisonSplit)

  const area = useRef<HTMLDivElement>(null)

  const moveTo = (clientX: number) => {
    const box = area.current?.getBoundingClientRect()
    if (box?.width) setSplit((clientX - box.left) / box.width)
  }

  return (
    <div
      ref={area}
      className="absolute inset-0 cursor-ew-resize touch-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        moveTo(e.clientX)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e.clientX)
      }}
    >
      <span className={`${LABEL} left-3`}>Before</span>
      <span className={`${LABEL} right-3`}>After</span>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Before and after divider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split * 100)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSplit(split - KEYBOARD_STEP)
          if (e.key === 'ArrowRight') setSplit(split + KEYBOARD_STEP)
        }}
        className="absolute inset-y-0 w-px -translate-x-1/2 bg-gofun"
        style={{ left: `${split * 100}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gofun text-sumi-900 shadow-lg">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </span>
      </div>
    </div>
  )
}
