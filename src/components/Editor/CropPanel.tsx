'use client'
import React from 'react'
import { Button } from '@/components/UI/Button'
import { croppedSize } from '@/lib/crop'
import { useEditorStore } from '@/store/editorStore'
import { CropAspect } from '@/types/editor.types'

const RATIOS: { label: string; value: CropAspect }[] = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:5', value: '4:5' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
]

export const CropPanel: React.FC = () => {
  const cropAspect = useEditorStore((state) => state.cropAspect)
  const setCropAspect = useEditorStore((state) => state.setCropAspect)
  const cropRect = useEditorStore((state) => state.cropRect)
  const dimensions = useEditorStore((state) => state.dimensions)
  const applyCrop = useEditorStore((state) => state.applyCrop)
  const resetCrop = useEditorStore((state) => state.resetCrop)

  const size = croppedSize(dimensions, cropRect)

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <h2 className="mb-2 font-serif text-sm text-gofun">Aspect ratio</h2>
        <div className="grid grid-cols-5 gap-1 rounded-lg bg-sumi-900 p-1">
          {RATIOS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCropAspect(value)}
              aria-pressed={cropAspect === value}
              className={`h-9 rounded-md text-xs transition-colors ${
                cropAspect === value ? 'bg-sumi-600 text-gofun' : 'text-nezumi hover:text-gofun'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm tabular-nums text-kinari">
          {size.width} × {size.height} px
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-nezumi">
          Drag the frame to move it, or its corners to resize it. You can come back and change a crop
          at any time.
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-sumi-700 p-3">
        <Button onClick={resetCrop}>Reset</Button>
        <Button variant="primary" onClick={applyCrop}>
          Apply crop
        </Button>
      </div>
    </>
  )
}
