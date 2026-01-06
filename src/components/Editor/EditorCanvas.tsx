'use client'
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { loadImageFromFile } from '@/lib/imageLoader'
import { applyAdjustments } from '@/lib/imageProcessor'

const aspectOptions = [
  { label: '16:9', value: '16:9' as const },
  { label: '1:1', value: '1:1' as const },
  { label: '4:3', value: '4:3' as const },
  { label: '4:5', value: '4:5' as const },
]

export const EditorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 })
  const dragHandleRef = useRef<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null)
  const dragStartPointRef = useRef<{ x: number; y: number } | null>(null)
  const dragStartRectRef = useRef<typeof cropRect | null>(null)
  
  const {
    currentImage,
    setImage,
    adjustments,
    showComparison,
    originalImageData,
    setPreviewImageData,
    setIsProcessing,
    setCanvasRef,
    activeTab,
    cropRect,
    cropAspect,
    setCropRect,
    setCropAspect,
    resetCrop,
  } = useEditorStore()

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      try {
        const { image, fileName, fileSize } = await loadImageFromFile(file)
        setImage(image, fileName, fileSize, file.type)
      } catch (error) {
        console.error('Error loading image:', error)
        alert('Failed to load image. Please try another file.')
      }
    }
  }, [setImage])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const aspectValue = useMemo(() => {
    if (cropAspect === 'free') return null
    const [w, h] = cropAspect.split(':').map(Number)
    return h ? w / h : null
  }, [cropAspect])

  useEffect(() => {
    const updateSize = () => {
      if (!overlayRef.current) return
      const rect = overlayRef.current.getBoundingClientRect()
      setOverlaySize({ width: rect.width, height: rect.height })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (overlayRef.current) observer.observe(overlayRef.current)

    return () => observer.disconnect()
  }, [])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragHandleRef.current || !dragStartPointRef.current || !dragStartRectRef.current) return
      if (!overlaySize.width || !overlaySize.height) return

      const dx = (e.clientX - dragStartPointRef.current.x) / overlaySize.width
      const dy = (e.clientY - dragStartPointRef.current.y) / overlaySize.height
      const start = dragStartRectRef.current
      const minSize = 0.1

      const clampSize = (value: number) => Math.max(minSize, Math.min(1, value))

      const applyBounds = (rect: typeof start) => {
        let { x, y, width, height } = rect
        width = clampSize(width)
        height = clampSize(height)

        if (aspectValue) {
          height = width / aspectValue
        }

        if (x + width > 1) {
          x = 1 - width
        }
        if (y + height > 1) {
          y = 1 - height
        }

        if (aspectValue && y + height > 1) {
          height = clampSize(1 - y)
          width = clampSize(height * aspectValue)
          x = Math.min(x, 1 - width)
        }

        x = Math.max(0, x)
        y = Math.max(0, y)

        return { x, y, width, height }
      }

      const handle = dragHandleRef.current
      let nextRect = { ...start }

      if (handle === 'move') {
        nextRect = applyBounds({ ...start, x: start.x + dx, y: start.y + dy })
      } else if (handle === 'se') {
        nextRect = applyBounds({
          ...start,
          width: start.width + dx,
          height: aspectValue ? (start.width + dx) / aspectValue : start.height + dy,
        })
      } else if (handle === 'sw') {
        const width = start.width - dx
        const height = aspectValue ? width / aspectValue : start.height + dy
        nextRect = applyBounds({
          ...start,
          x: start.x + dx,
          width,
          height,
        })
      } else if (handle === 'ne') {
        const width = start.width + dx
        const height = aspectValue ? width / aspectValue : start.height - dy
        nextRect = applyBounds({
          ...start,
          y: start.y + (start.height - height),
          width,
          height,
        })
      } else if (handle === 'nw') {
        const width = start.width - dx
        const height = aspectValue ? width / aspectValue : start.height - dy
        nextRect = applyBounds({
          ...start,
          x: start.x + dx,
          y: start.y + (start.height - height),
          width,
          height,
        })
      }

      setCropRect(nextRect)
    },
    [aspectValue, overlaySize.height, overlaySize.width, setCropRect]
  )

  const stopDragging = useCallback(() => {
    dragHandleRef.current = null
    dragStartPointRef.current = null
    dragStartRectRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopDragging)
  }, [handlePointerMove])

  const handlePointerDown = useCallback(
    (
      e: React.PointerEvent,
      handle: 'move' | 'nw' | 'ne' | 'sw' | 'se'
    ) => {
      e.preventDefault()
      e.stopPropagation()
      dragHandleRef.current = handle
      dragStartPointRef.current = { x: e.clientX, y: e.clientY }
      dragStartRectRef.current = cropRect
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', stopDragging)
    },
    [cropRect, handlePointerMove, stopDragging]
  )

  useEffect(() => () => stopDragging(), [stopDragging])

  const showCropOverlay = !!currentImage && activeTab === 'crop'

  const cropBoxStyle = useMemo(() => ({
    left: `${cropRect.x * 100}%`,
    top: `${cropRect.y * 100}%`,
    width: `${cropRect.width * 100}%`,
    height: `${cropRect.height * 100}%`,
  }), [cropRect])

  // Store original image data
  useEffect(() => {
    if (!currentImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    canvas.width = currentImage.width
    canvas.height = currentImage.height

    ctx.drawImage(currentImage, 0, 0)
    const original = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    useEditorStore.setState({ originalImageData: original })
    setCanvasRef(canvasRef.current)
  }, [currentImage, setCanvasRef])

  // Process image with adjustments (debounced)
  useEffect(() => {
    if (!canvasRef.current || !currentImage || !useEditorStore.getState().originalImageData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Clear previous timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }

    setIsProcessing(true)

    // Debounce processing for 16ms (60fps)
    processingTimeoutRef.current = setTimeout(() => {
      const original = useEditorStore.getState().originalImageData
      if (!original) return

      // Apply adjustments
      const processed = applyAdjustments(original, adjustments)
      // Downsample for lightweight preview/histogram to avoid huge ImageData in state
      const previewWidth = Math.min(320, canvas.width)
      const scale = previewWidth / canvas.width
      const previewHeight = Math.max(1, Math.round(canvas.height * scale))

      const previewCanvas = document.createElement('canvas')
      previewCanvas.width = previewWidth
      previewCanvas.height = previewHeight
      const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true })
      if (previewCtx) {
        previewCtx.drawImage(canvas, 0, 0, previewWidth, previewHeight)
        const previewData = previewCtx.getImageData(0, 0, previewWidth, previewHeight)
        setPreviewImageData(previewData)
      }

      // Draw to canvas
      if (showComparison) {
        // Split screen comparison
        const splitX = Math.floor(canvas.width / 2)
        
        // Left side: original
        ctx.putImageData(original, 0, 0, 0, 0, splitX, canvas.height)
        
        // Right side: processed
        ctx.putImageData(processed, 0, 0, splitX, 0, canvas.width - splitX, canvas.height)
        
        // Draw divider
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.moveTo(splitX, 0)
        ctx.lineTo(splitX, canvas.height)
        ctx.stroke()
        ctx.shadowBlur = 0
        
        // Draw labels
        ctx.font = 'bold 14px sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 4
        ctx.fillText('Before', 20, 30)
        ctx.fillText('After', splitX + 20, 30)
        ctx.shadowBlur = 0
      } else {
        // Normal view: just processed
        ctx.putImageData(processed, 0, 0)
      }
    }, 16)

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [currentImage, adjustments, showComparison, setPreviewImageData, setIsProcessing])

  if (!currentImage) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[640px]">
        <div
          className={`relative w-full h-full max-w-[1200px] max-h-[860px] min-h-[640px] rounded-[28px] border-2 border-dashed transition-all duration-200 backdrop-blur-xl bg-white/70 shadow-2xl shadow-indigo-200/30 ${
            isDragging ? 'border-blue-500/70 scale-[1.01]' : 'border-slate-200/80'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/80 via-white/40 to-slate-100/60" />
          <div className="relative h-full w-full flex items-center justify-center text-center px-10">
            <div className={`transition-transform duration-200 ${isDragging ? 'scale-105' : ''}`}>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 border border-slate-200 shadow-md">
                <svg
                  className="h-10 w-10 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Drop your image here</h3>
              <p className="text-sm text-slate-500">or drag & drop to start editing</p>
              <p className="text-xs text-slate-400 mt-2">JPEG, PNG, WebP • Max 50MB</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[640px]">
      <div ref={overlayRef} className="relative w-full h-full max-w-[1400px] max-h-[860px] min-h-[640px] bg-white/85 border border-white/70 rounded-[32px] shadow-[0_20px_70px_rgba(99,102,241,0.18)] overflow-hidden backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-slate-100/60" />
        <div className="absolute inset-4 rounded-[28px] bg-slate-900/4" />

        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full"
          style={{
            objectFit: 'contain',
            imageRendering: 'auto',
          }}
        />

        {showCropOverlay && (
          <div className="absolute inset-0 z-40">
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-x-0 top-0 bg-slate-900/40"
                style={{ height: `${cropRect.y * 100}%` }}
              />
              <div
                className="absolute inset-x-0 bg-slate-900/40"
                style={{ top: `${(cropRect.y + cropRect.height) * 100}%`, bottom: 0 }}
              />
              <div
                className="absolute bg-slate-900/40"
                style={{
                  top: `${cropRect.y * 100}%`,
                  left: 0,
                  width: `${cropRect.x * 100}%`,
                  height: `${cropRect.height * 100}%`,
                }}
              />
              <div
                className="absolute bg-slate-900/40"
                style={{
                  top: `${cropRect.y * 100}%`,
                  right: 0,
                  width: `${(1 - (cropRect.x + cropRect.width)) * 100}%`,
                  height: `${cropRect.height * 100}%`,
                }}
              />
            </div>

            <div
              className="absolute border-2 border-white/90 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.35)] bg-white/5 backdrop-blur-[2px] cursor-move"
              style={cropBoxStyle}
              onPointerDown={(e) => handlePointerDown(e, 'move')}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/70" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/70" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/70" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/70" />
                <div className="absolute inset-0 rounded-2xl border border-white/60" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-white drop-shadow-lg" />
              </div>

              {['nw', 'ne', 'sw', 'se'].map((handle) => {
                const isTop = handle.includes('n')
                const isLeft = handle.includes('w')
                return (
                  <button
                    key={handle}
                    onPointerDown={(e) => handlePointerDown(e, handle as 'nw' | 'ne' | 'sw' | 'se')}
                    className="absolute w-5 h-5 -mx-[10px] -my-[10px] rounded-full bg-white text-slate-700 shadow-lg border border-slate-200 hover:scale-105 transition"
                    style={{
                      left: isLeft ? 0 : '100%',
                      top: isTop ? 0 : '100%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    aria-label={`Resize ${handle}`}
                  />
                )
              })}
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-2 bg-slate-900/70 text-white px-3 py-2 rounded-full backdrop-blur-md shadow-xl border border-white/10">
              {aspectOptions.map((option) => {
                const isActive = cropAspect === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setCropAspect(option.value)}
                    className={`px-3 h-8 rounded-full text-xs font-semibold transition-all border ${
                      isActive
                        ? 'bg-white text-slate-900 border-transparent shadow-sm'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
              <button
                onClick={resetCrop}
                className="ml-1 px-3 h-8 rounded-full text-xs font-semibold bg-white/10 border border-white/20 hover:bg-white/20"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {showComparison && (
          <>
            <div className="absolute inset-y-10 left-1/2 w-[3px] bg-white/90 shadow-md shadow-black/20 rounded-full z-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white shadow-xl shadow-black/25 border border-slate-200 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full border border-white" />
            </div>
            <div className="absolute top-6 left-6 z-30 text-white font-semibold drop-shadow-md text-lg">Before</div>
            <div className="absolute top-6 right-6 z-30 text-white font-semibold drop-shadow-md text-lg">After</div>
          </>
        )}
      </div>
    </div>
  )
}
