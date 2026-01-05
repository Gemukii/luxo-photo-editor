'use client'
import React, { useRef, useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { loadImageFromFile } from '@/lib/imageLoader'

export const EditorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { currentImage, setImage, adjustments } = useEditorStore()

  // Handle file drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      try {
        const { image, fileName, fileSize } = await loadImageFromFile(file)
        setImage(image, fileName, fileSize)
      } catch (error) {
        console.error('Error loading image:', error)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  // Draw image on canvas
  useEffect(() => {
    if (!currentImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = currentImage.width
    canvas.height = currentImage.height

    // Draw image
    ctx.drawImage(currentImage, 0, 0)

    // Apply basic adjustments (simple Canvas 2D for now)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const exposureFactor = Math.pow(2, adjustments.exposure)
    const contrastFactor = (adjustments.contrast + 100) / 100
    const saturationFactor = (adjustments.saturation + 100) / 100

    for (let i = 0; i < data.length; i += 4) {
      // Exposure
      data[i] *= exposureFactor
      data[i + 1] *= exposureFactor
      data[i + 2] *= exposureFactor

      // Contrast
      data[i] = ((data[i] / 255 - 0.5) * contrastFactor + 0.5) * 255
      data[i + 1] = ((data[i + 1] / 255 - 0.5) * contrastFactor + 0.5) * 255
      data[i + 2] = ((data[i + 2] / 255 - 0.5) * contrastFactor + 0.5) * 255

      // Saturation (simple approximation)
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      data[i] = gray + (data[i] - gray) * saturationFactor
      data[i + 1] = gray + (data[i + 1] - gray) * saturationFactor
      data[i + 2] = gray + (data[i + 2] - gray) * saturationFactor

      // Clamp values
      data[i] = Math.max(0, Math.min(255, data[i]))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1]))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2]))
    }

    ctx.putImageData(imageData, 0, 0)
  }, [currentImage, adjustments])

  if (!currentImage) {
    return (
      <div
        className={`flex items-center justify-center w-full h-full border-2 border-dashed rounded-2xl transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center p-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop your image here
          </h3>
          <p className="text-sm text-gray-500">
            Supports JPEG, PNG, WebP
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full rounded-lg shadow-2xl"
        style={{
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

