'use client'
import React, { useRef } from 'react'
import { CropHandle, dragCropRect, normalizedAspect } from '@/lib/crop'
import { useEditorStore } from '@/store/editorStore'
import { CropRect } from '@/types/editor.types'

interface CropOverlayProps {
  imageWidth: number
  imageHeight: number
}

interface Drag {
  handle: CropHandle
  x: number
  y: number
  rect: CropRect
}

const CORNERS: { handle: CropHandle; label: string; className: string }[] = [
  { handle: 'nw', label: 'Resize from top left', className: 'left-0 top-0 cursor-nwse-resize' },
  { handle: 'ne', label: 'Resize from top right', className: 'left-full top-0 cursor-nesw-resize' },
  { handle: 'sw', label: 'Resize from bottom left', className: 'left-0 top-full cursor-nesw-resize' },
  { handle: 'se', label: 'Resize from bottom right', className: 'left-full top-full cursor-nwse-resize' },
]

const MASK = 'absolute bg-sumi-950/65'

export const CropOverlay: React.FC<CropOverlayProps> = ({ imageWidth, imageHeight }) => {
  const cropRect = useEditorStore((state) => state.cropRect)
  const cropAspect = useEditorStore((state) => state.cropAspect)
  const dimensions = useEditorStore((state) => state.dimensions)
  const setCropRect = useEditorStore((state) => state.setCropRect)

  const drag = useRef<Drag | null>(null)

  const startDrag = (e: React.PointerEvent, handle: CropHandle) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { handle, x: e.clientX, y: e.clientY, rect: cropRect }
  }

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag.current || !imageWidth || !imageHeight) return

    const { handle, x, y, rect } = drag.current
    setCropRect(
      dragCropRect(
        rect,
        handle,
        (e.clientX - x) / imageWidth,
        (e.clientY - y) / imageHeight,
        normalizedAspect(cropAspect, dimensions)
      )
    )
  }

  const endDrag = () => {
    drag.current = null
  }

  const dragProps = (handle: CropHandle) => ({
    onPointerDown: (e: React.PointerEvent) => startDrag(e, handle),
    onPointerMove: moveDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  })

  const right = cropRect.x + cropRect.width
  const bottom = cropRect.y + cropRect.height

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className={`${MASK} inset-x-0 top-0`} style={{ height: `${cropRect.y * 100}%` }} />
        <div className={`${MASK} inset-x-0 bottom-0`} style={{ top: `${bottom * 100}%` }} />
        <div
          className={`${MASK} left-0`}
          style={{
            top: `${cropRect.y * 100}%`,
            height: `${cropRect.height * 100}%`,
            width: `${cropRect.x * 100}%`,
          }}
        />
        <div
          className={`${MASK} right-0`}
          style={{
            top: `${cropRect.y * 100}%`,
            height: `${cropRect.height * 100}%`,
            left: `${right * 100}%`,
          }}
        />
      </div>

      <div
        data-testid="crop-frame"
        className="absolute cursor-move touch-none border border-gofun"
        style={{
          left: `${cropRect.x * 100}%`,
          top: `${cropRect.y * 100}%`,
          width: `${cropRect.width * 100}%`,
          height: `${cropRect.height * 100}%`,
        }}
        {...dragProps('move')}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-1/3 w-px bg-gofun/40" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-gofun/40" />
          <div className="absolute inset-x-0 top-1/3 h-px bg-gofun/40" />
          <div className="absolute inset-x-0 top-2/3 h-px bg-gofun/40" />
        </div>

        {CORNERS.map(({ handle, label, className }) => (
          <div
            key={handle}
            role="presentation"
            aria-label={label}
            data-testid={`crop-${handle}`}
            className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center ${className}`}
            {...dragProps(handle)}
          >
            <span className="h-3 w-3 rounded-full border-2 border-sumi-950 bg-gofun" />
          </div>
        ))}
      </div>
    </>
  )
}
