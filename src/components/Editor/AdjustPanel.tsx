'use client'
import React from 'react'
import { Button } from '@/components/UI/Button'
import { Slider } from '@/components/UI/Slider'
import { AdjustmentControl, COLOR_CONTROLS, LIGHT_CONTROLS } from '@/lib/adjustments'
import { croppedSize } from '@/lib/crop'
import { formatFileSize } from '@/lib/imageLoader'
import { useEditorStore } from '@/store/editorStore'
import { Histogram } from './Histogram'

const GROUPS: { title: string; controls: AdjustmentControl[] }[] = [
  { title: 'Light', controls: LIGHT_CONTROLS },
  { title: 'Colour', controls: COLOR_CONTROLS },
]

export const AdjustPanel: React.FC = () => {
  const adjustments = useEditorStore((state) => state.adjustments)
  const updateAdjustment = useEditorStore((state) => state.updateAdjustment)
  const commitHistory = useEditorStore((state) => state.commitHistory)
  const resetAdjustment = useEditorStore((state) => state.resetAdjustment)
  const resetAllAdjustments = useEditorStore((state) => state.resetAllAdjustments)
  const previewImageData = useEditorStore((state) => state.previewImageData)
  const fileSize = useEditorStore((state) => state.fileSize)
  const dimensions = useEditorStore((state) => state.dimensions)
  const crop = useEditorStore((state) => state.crop)

  const outputSize = croppedSize(dimensions, crop)
  const isAdjusted = Object.values(adjustments).some((value) => Math.abs(value) > 0.01)

  return (
    <>
      <div className="shrink-0 px-4 pt-3">
        <Histogram imageData={previewImageData} />
        <p className="mt-1.5 text-[11px] tabular-nums text-nezumi">
          {outputSize.width} × {outputSize.height} px · {formatFileSize(fileSize)}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {GROUPS.map(({ title, controls }) => (
          <section key={title} className="mb-5">
            <h2 className="mb-2 font-serif text-sm text-gofun">{title}</h2>
            <div className="grid gap-1.5">
              {controls.map((control) => (
                <Slider
                  key={control.key}
                  label={control.label}
                  value={adjustments[control.key]}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  track={control.track}
                  onChange={(value) => updateAdjustment(control.key, value)}
                  onCommit={commitHistory}
                  onReset={() => resetAdjustment(control.key)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {isAdjusted && (
        <div className="shrink-0 border-t border-sumi-700 p-3">
          <Button onClick={resetAllAdjustments} className="w-full">
            Reset all adjustments
          </Button>
        </div>
      )}
    </>
  )
}
