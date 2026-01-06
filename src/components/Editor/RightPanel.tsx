'use client'
import React, { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { Slider } from '@/components/UI/Slider'
import { Button } from '@/components/UI/Button'
import { formatFileSize } from '@/lib/imageLoader'

const cropOptions = [
  { label: '16:9', value: '16:9' as const },
  { label: '1:1', value: '1:1' as const },
  { label: '4:3', value: '4:3' as const },
  { label: '4:5', value: '4:5' as const },
]

export const RightPanel: React.FC = () => {
  const {
    adjustments,
    updateAdjustment,
    resetAdjustment,
    resetAllAdjustments,
    fileSize,
    dimensions,
    currentImage,
    isProcessing,
    activeTab,
    cropAspect,
    setCropAspect,
    resetCrop,
    applyCrop,
  } = useEditorStore()

  const [isCropping, setIsCropping] = useState(false)

  if (!currentImage) {
    return (
      <aside className="w-72 h-full bg-white/70 backdrop-blur-xl border border-white/70 shadow-xl shadow-indigo-200/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-slate-400">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 border border-slate-200 shadow-md mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600">No image loaded</p>
        <p className="text-xs text-slate-400 mt-1">Drop an image to start editing</p>
      </aside>
    )
  }

  if (activeTab === 'crop') {
    const handleApply = async () => {
      setIsCropping(true)
      try {
        await applyCrop()
      } finally {
        setIsCropping(false)
      }
    }

    return (
      <aside className="w-72 h-full bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl shadow-indigo-200/30 rounded-3xl p-5 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Tools</p>
            <h2 className="text-xl font-semibold text-slate-900">Crop & Rotate</h2>
            <p className="text-[11px] text-slate-400 mt-1">
              {dimensions.width} × {dimensions.height}px
            </p>
          </div>
          {isCropping && (
            <div className="flex items-center gap-2 text-[11px] text-indigo-600">
              <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              Cropping
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500">Aspect ratio</p>
          <div className="grid grid-cols-2 gap-2">
            {cropOptions.map((option) => {
              const isActive = cropAspect === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setCropAspect(option.value)}
                  className={`w-full h-11 rounded-xl border text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-transparent shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:shadow-sm'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Drag the frame to reposition. Use the corner handles to resize.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            Ratios lock the frame to the selected proportion.
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={resetCrop}
            className="w-full border-slate-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Crop
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            disabled={isCropping}
            className="w-full"
          >
            {isCropping ? 'Applying…' : 'Apply Crop'}
          </Button>
        </div>
      </aside>
    )
  }

  const isAdjusted = Object.values(adjustments).some(val => Math.abs(val) > 0.01)

  const controls: Array<{ key: keyof typeof adjustments; label: string; min: number; max: number; step: number }> = [
    { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.1 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1 },
    { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1 },
    { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1 },
    { key: 'whites', label: 'Whites', min: -100, max: 100, step: 1 },
    { key: 'blacks', label: 'Blacks', min: -100, max: 100, step: 1 },
    { key: 'temperature', label: 'Temperature', min: -100, max: 100, step: 1 },
    { key: 'tint', label: 'Tint', min: -100, max: 100, step: 1 },
    { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, step: 1 },
  ]

  return (
    <aside className="w-72 h-full bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl shadow-indigo-200/30 rounded-3xl p-5 flex flex-col gap-5 min-h-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Preset</p>
          <h2 className="text-xl font-semibold text-slate-900">Adjustments</h2>
          <p className="text-[11px] text-slate-400 mt-1">
            {formatFileSize(fileSize)} • {dimensions.width} × {dimensions.height}px
          </p>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-2 text-[11px] text-indigo-600">
            <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Processing
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-3">
        {controls.map((control) => (
          <Slider
            key={control.key}
            label={control.label}
            value={adjustments[control.key]}
            min={control.min}
            max={control.max}
            step={control.step}
            onChange={(val) => updateAdjustment(control.key, val)}
            onReset={() => resetAdjustment(control.key)}
          />
        ))}
      </div>

      {isAdjusted && (
        <Button
          variant="secondary"
          size="md"
          onClick={resetAllAdjustments}
          className="w-full border-slate-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset All Adjustments
        </Button>
      )}
    </aside>
  )
}
