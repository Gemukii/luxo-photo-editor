'use client'
import React, { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { Button } from '@/components/UI/Button'

type ExportFormat = 'jpeg' | 'png'

export const ExportModal: React.FC = () => {
  const { showExportModal, setShowExportModal, currentImage, canvasRef, fileName } = useEditorStore()
  const [format, setFormat] = useState<ExportFormat>('jpeg')
  const [quality, setQuality] = useState(90)
  const [isExporting, setIsExporting] = useState(false)

  if (!showExportModal || !currentImage || !canvasRef) return null

  const estimatedSize = () => {
    const pixels = canvasRef.width * canvasRef.height
    if (format === 'png') {
      return ((pixels * 3) / 1024 / 1024).toFixed(1) + ' MB'
    }
    const compressionRatio = quality / 100
    return ((pixels * 3 * compressionRatio * 0.1) / 1024 / 1024).toFixed(1) + ' MB'
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = canvasRef.width
      canvas.height = canvasRef.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')

      ctx.drawImage(canvasRef, 0, 0)

      const blob = await new Promise<Blob | null>((resolve) => {
        if (format === 'jpeg') {
          canvas.toBlob(resolve, 'image/jpeg', quality / 100)
        } else {
          canvas.toBlob(resolve, 'image/png')
        }
      })

      if (!blob) throw new Error('Failed to create blob')

      // Download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const baseName = fileName.replace(/\.[^/.]+$/, '')
      a.download = `${baseName}_edited.${format}`
      a.click()
      URL.revokeObjectURL(url)

      setShowExportModal(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export image. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Export Image</h2>
          <button
            onClick={() => setShowExportModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('jpeg')}
              className={`p-4 rounded-xl border-2 transition-all ${
                format === 'jpeg'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">JPEG</div>
              <div className="text-xs text-gray-500 mt-1">Smaller size</div>
            </button>
            <button
              onClick={() => setFormat('png')}
              className={`p-4 rounded-xl border-2 transition-all ${
                format === 'png'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">PNG</div>
              <div className="text-xs text-gray-500 mt-1">Lossless</div>
            </button>
          </div>
        </div>

        {/* Quality Slider (JPEG only) */}
        {format === 'jpeg' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Quality
              </label>
              <span className="text-sm font-semibold text-gray-900">{quality}%</span>
            </div>
            <input
              type="range"
              min={60}
              max={100}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Smaller</span>
              <span>Better quality</span>
            </div>
          </div>
        )}

        {/* File Size Estimate */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estimated size:</span>
            <span className="text-lg font-semibold text-gray-900">{estimatedSize()}</span>
          </div>
        </div>

        {/* Export Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Image
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
