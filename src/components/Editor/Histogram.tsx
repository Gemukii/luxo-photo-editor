'use client'
import React, { useEffect, useRef } from 'react'

interface HistogramProps {
  imageData: ImageData | null
}

const WIDTH = 300
const HEIGHT = 84

const CHANNELS = [
  { offset: 0, color: 'rgba(224, 105, 77, 0.75)' },
  { offset: 1, color: 'rgba(109, 156, 115, 0.75)' },
  { offset: 2, color: 'rgba(79, 159, 166, 0.75)' },
]

export const Histogram: React.FC<HistogramProps> = ({ imageData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    if (!imageData) return

    const bins = CHANNELS.map(() => new Uint32Array(256))
    const { data } = imageData

    for (let i = 0; i < data.length; i += 4) {
      bins[0][data[i]]++
      bins[1][data[i + 1]]++
      bins[2][data[i + 2]]++
    }

    // Square-root scale, so that one dominant tone does not flatten the others
    const peak = Math.sqrt(Math.max(...bins.map((channel) => Math.max(...channel)))) || 1

    ctx.globalCompositeOperation = 'lighter'

    CHANNELS.forEach(({ color }, index) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(0, HEIGHT)

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * WIDTH
        ctx.lineTo(x, HEIGHT - (Math.sqrt(bins[index][i]) / peak) * (HEIGHT - 4))
      }

      ctx.lineTo(WIDTH, HEIGHT)
      ctx.closePath()
      ctx.fill()
    })

    ctx.globalCompositeOperation = 'source-over'
  }, [imageData])

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      role="img"
      aria-label="RGB histogram of the edited photo"
      className="block h-[84px] w-full rounded-md bg-sumi-900"
    />
  )
}
