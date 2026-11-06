'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/UI/Button'
import { croppedSize } from '@/lib/crop'
import { getLook } from '@/lib/looks/catalog'
import { loadLookLut } from '@/lib/looks/loadLut'
import { ExportFormat, exportImage } from '@/lib/render/exportImage'
import { resolveEdit } from '@/lib/render/resolveEdit'
import { useEditorStore } from '@/store/editorStore'

const FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: 'jpeg', label: 'JPEG', hint: 'Smaller file' },
  { id: 'png', label: 'PNG', hint: 'Lossless' },
]

export const ExportModal: React.FC = () => {
  const showExportModal = useEditorStore((state) => state.showExportModal)
  const setShowExportModal = useEditorStore((state) => state.setShowExportModal)
  const setNotice = useEditorStore((state) => state.setNotice)
  const currentImage = useEditorStore((state) => state.currentImage)
  const adjustments = useEditorStore((state) => state.adjustments)
  const crop = useEditorStore((state) => state.crop)
  const look = useEditorStore((state) => state.look)
  const dimensions = useEditorStore((state) => state.dimensions)
  const fileName = useEditorStore((state) => state.fileName)

  const [format, setFormat] = useState<ExportFormat>('jpeg')
  const [quality, setQuality] = useState(90)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!showExportModal) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowExportModal(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showExportModal, setShowExportModal])

  if (!showExportModal || !currentImage) return null

  const outputSize = croppedSize(dimensions, crop)

  const handleExport = async () => {
    setIsExporting(true)

    // Let the spinner paint before the render starts
    await new Promise((resolve) => setTimeout(resolve))

    try {
      const activeLook = getLook(look?.id)
      const lut = activeLook ? await loadLookLut(activeLook) : null
      const edit = resolveEdit(adjustments, crop, look, lut ?? null)
      const blob = await exportImage(currentImage, edit, format, quality)

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName.replace(/\.[^/.]+$/, '')}_edited.${format === 'jpeg' ? 'jpg' : 'png'}`
      link.click()
      URL.revokeObjectURL(url)

      setShowExportModal(false)
    } catch (error) {
      console.error('Export error:', error)
      setNotice('The export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-sumi-950/75 p-4"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !isExporting) setShowExportModal(false)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        className="w-full max-w-sm rounded-xl border border-sumi-600 bg-sumi-800 p-6 shadow-2xl"
      >
        <h2 id="export-title" className="font-serif text-xl text-gofun">
          Export photo
        </h2>
        <p className="mt-1 text-sm tabular-nums text-nezumi">
          {outputSize.width} × {outputSize.height} px
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {FORMATS.map(({ id, label, hint }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormat(id)}
              aria-pressed={format === id}
              className={`rounded-lg border p-3 text-left transition-colors ${
                format === id ? 'border-kincha bg-sumi-700' : 'border-sumi-600 hover:border-sumi-500'
              }`}
            >
              <span className="block text-sm font-medium text-gofun">{label}</span>
              <span className="block text-xs text-nezumi">{hint}</span>
            </button>
          ))}
        </div>

        {format === 'jpeg' && (
          <label className="mt-5 block">
            <span className="flex items-center justify-between text-sm text-kinari">
              Quality
              <span className="tabular-nums text-gofun">{quality}%</span>
            </span>
            <input
              type="range"
              min={60}
              max={100}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="mt-2 w-full accent-kincha"
            />
          </label>
        )}

        <p className="mt-4 text-xs leading-relaxed text-nezumi">
          Your original file stays unchanged. Camera data such as EXIF and GPS is not copied.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button onClick={() => setShowExportModal(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting…' : 'Export'}
          </Button>
        </div>
      </div>
    </div>
  )
}
