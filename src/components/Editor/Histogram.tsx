'use client'
import { useEffect, useRef } from 'react'

interface HistogramProps {
  imageData: ImageData | null
}

export const Histogram: React.FC<HistogramProps> = ({ imageData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!imageData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Calculate histogram
    const r = new Array(256).fill(0)
    const g = new Array(256).fill(0)
    const b = new Array(256).fill(0)

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      r[data[i]]++
      g[data[i + 1]]++
      b[data[i + 2]]++
    }

    // Find max for scaling
    const max = Math.max(...r, ...g, ...b)

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const y = (canvas.height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw histograms
    const drawChannel = (data: number[], color: string) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      
      for (let i = 0; i < 256; i++) {
        const x = (i / 256) * canvas.width
        const y = canvas.height - (data[i] / max) * canvas.height * 0.9
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    ctx.globalAlpha = 0.6
    drawChannel(r, '#ef4444') // Red
    drawChannel(g, '#10b981') // Green
    drawChannel(b, '#3b82f6') // Blue
    ctx.globalAlpha = 1

    // Border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

  }, [imageData])

  if (!imageData) {
    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Histogram
        </h3>
        <div className="w-full h-20 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
          <span className="text-xs text-gray-400">No data</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Histogram
      </h3>
      <canvas
        ref={canvasRef}
        width={280}
        height={80}
        className="w-full rounded-lg"
      />
    </div>
  )
}
