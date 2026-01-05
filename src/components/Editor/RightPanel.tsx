'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'
import { Slider } from '@/components/UI/Slider'
import { Badge } from '@/components/UI/Badge'
import { Button } from '@/components/UI/Button'
import { formatFileSize } from '@/lib/imageLoader'

export const RightPanel: React.FC = () => {
  const {
    adjustments,
    updateAdjustment,
    resetAdjustment,
    resetAllAdjustments,
    fileName,
    fileSize,
    isRaw,
    currentImage,
  } = useEditorStore()

  if (!currentImage) {
    return (
      <aside className="w-80 bg-white shadow-sm p-6">
        <div className="text-center text-gray-400 mt-8">
          <p className="text-sm">No image loaded</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-80 bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Adjustments</h2>
          {isRaw && <Badge variant="success">RAW</Badge>}
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p className="truncate" title={fileName}>{fileName}</p>
          <p>{formatFileSize(fileSize)}</p>
          <p>{currentImage.width} × {currentImage.height}</p>
        </div>
      </div>

      {/* Scrollable adjustments */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Light section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Light
          </h3>
          
          <Slider
            label="Exposure"
            value={adjustments.exposure}
            min={-2}
            max={2}
            step={0.1}
            onChange={(val) => updateAdjustment('exposure', val)}
            onReset={() => resetAdjustment('exposure')}
          />
          
          <Slider
            label="Contrast"
            value={adjustments.contrast}
            min={-100}
            max={100}
            step={1}
            onChange={(val) => updateAdjustment('contrast', val)}
            onReset={() => resetAdjustment('contrast')}
          />
          
          <Slider
            label="Highlights"
            value={adjustments.highlights}
            min={-100}
            max={100}
            step={1}
            onChange={(val) => updateAdjustment('highlights', val)}
            onReset={() => resetAdjustment('highlights')}
          />
          
          <Slider
            label="Shadows"
            value={adjustments.shadows}
            min={-100}
            max={100}
            step={1}
            onChange={(val) => updateAdjustment('shadows', val)}
            onReset={() => resetAdjustment('shadows')}
          />
        </div>

        {/* Color section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Color
          </h3>
          
          <Slider
            label="Saturation"
            value={adjustments.saturation}
            min={-100}
            max={100}
            step={1}
            onChange={(val) => updateAdjustment('saturation', val)}
            onReset={() => resetAdjustment('saturation')}
          />
          
          <Slider
            label="Vibrance"
            value={adjustments.vibrance}
            min={-100}
            max={100}
            step={1}
            onChange={(val) => updateAdjustment('vibrance', val)}
            onReset={() => resetAdjustment('vibrance')}
          />
          
          <Slider
            label="Temperature"
            value={adjustments.temperature}
            min={-100}
            max={100}
            step={1}
            onChange={(val) => updateAdjustment('temperature', val)}
            onReset={() => resetAdjustment('temperature')}
          />
        </div>

        {/* Reset button */}
        <Button
          variant="secondary"
          size="md"
          onClick={resetAllAdjustments}
          className="w-full"
        >
          Reset All Adjustments
        </Button>
      </div>
    </aside>
  )
}
