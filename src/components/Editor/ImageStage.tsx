'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { croppedSize, fitContain } from '@/lib/crop'
import { getLook } from '@/lib/looks/catalog'
import { Lut } from '@/lib/looks/cube'
import { loadLookLut } from '@/lib/looks/loadLut'
import { createRenderer } from '@/lib/render/createRenderer'
import { createProxy, PREVIEW_MAX_EDGE } from '@/lib/render/proxy'
import { resolveEdit } from '@/lib/render/resolveEdit'
import { Renderer } from '@/lib/render/types'
import { useEditorStore } from '@/store/editorStore'
import { CompareOverlay } from './CompareOverlay'
import { CropOverlay } from './CropOverlay'

const HISTOGRAM_WIDTH = 320

const useActiveLut = (lookId: string | undefined) => {
  const setNotice = useEditorStore((state) => state.setNotice)
  const [lut, setLut] = useState<Lut | null>(null)

  useEffect(() => {
    const look = getLook(lookId)
    const loading = look ? loadLookLut(look) : null
    if (!loading) return

    let isActive = true

    loading
      .then((loaded) => {
        if (isActive) setLut(loaded)
      })
      .catch((error) => {
        console.error('Error loading look:', error)
        if (isActive) setNotice('This look could not be loaded. Please try again.')
      })

    return () => {
      isActive = false
    }
  }, [lookId, setNotice])

  return lut?.id === lookId ? lut : null
}

export const ImageStage: React.FC = () => {
  const currentImage = useEditorStore((state) => state.currentImage)
  const dimensions = useEditorStore((state) => state.dimensions)
  const adjustments = useEditorStore((state) => state.adjustments)
  const crop = useEditorStore((state) => state.crop)
  const look = useEditorStore((state) => state.look)
  const activeTab = useEditorStore((state) => state.activeTab)
  const showComparison = useEditorStore((state) => state.showComparison)
  const comparisonSplit = useEditorStore((state) => state.comparisonSplit)
  const setPreviewImageData = useEditorStore((state) => state.setPreviewImageData)
  const importFile = useEditorStore((state) => state.importFile)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const renderer = useRef<Renderer | null>(null)

  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  // Changes whenever the renderer needs to draw again with the same edit
  const [sourceVersion, setSourceVersion] = useState(0)

  const lut = useActiveLut(look?.id)

  // The crop tab shows the whole image, so the frame can be moved anywhere
  const isCropping = activeTab === 'crop'
  const visibleCrop = isCropping ? null : crop
  const isComparing = showComparison && !isCropping

  const imageBox = useMemo(
    () => fitContain(areaSize, croppedSize(dimensions, visibleCrop)),
    [areaSize, dimensions, visibleCrop]
  )

  useEffect(() => {
    const area = areaRef.current
    if (!area) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setAreaSize({ width, height })
    })

    observer.observe(area)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const instance = createRenderer(canvasRef.current, {
      onRestored: () => setSourceVersion((version) => version + 1),
    })
    renderer.current = instance

    return () => {
      instance.dispose()
      renderer.current = null
    }
  }, [])

  useEffect(() => {
    if (!currentImage) return

    renderer.current?.setSource(createProxy(currentImage, PREVIEW_MAX_EDGE))
    setSourceVersion((version) => version + 1)
  }, [currentImage])

  useEffect(() => {
    if (!sourceVersion) return

    const frame = requestAnimationFrame(() => {
      const instance = renderer.current
      if (!instance) return

      const edit = resolveEdit(adjustments, visibleCrop, look, lut)

      instance.render({ ...edit, compareSplit: isComparing ? comparisonSplit : null })
      setPreviewImageData(instance.readPreview(edit, HISTOGRAM_WIDTH))
    })

    return () => cancelAnimationFrame(frame)
  }, [sourceVersion, adjustments, visibleCrop, look, lut, isComparing, comparisonSplit, setPreviewImageData])

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) await importFile(file)
  }

  return (
    <main
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      className="relative h-[46dvh] shrink-0 bg-sumi-950 md:h-auto md:min-w-0 md:flex-1"
    >
      <div ref={areaRef} className="absolute inset-3 md:inset-6 lg:inset-8">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-contain" />

        <div className="absolute" style={imageBox}>
          {isCropping && <CropOverlay imageWidth={imageBox.width} imageHeight={imageBox.height} />}
          {isComparing && <CompareOverlay />}
        </div>
      </div>

      {isDragging && (
        <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-xl border-2 border-dashed border-kincha bg-sumi-950/80">
          <p className="font-serif text-2xl text-gofun">Drop your photo</p>
        </div>
      )}
    </main>
  )
}
