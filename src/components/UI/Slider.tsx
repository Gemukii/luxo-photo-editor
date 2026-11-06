'use client'
import React, { useState } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  /** Called when the gesture ends, to record one undo step. */
  onCommit: () => void
  onReset: () => void
  defaultValue?: number
  unit?: string
  /** CSS gradient for sliders whose direction is a colour. */
  track?: string
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onCommit,
  onReset,
  defaultValue = 0,
  unit = '',
  track,
}) => {
  const [isEditing, setIsEditing] = useState(false)

  const range = max - min
  const originPercent = ((Math.max(min, Math.min(max, 0)) - min) / range) * 100
  const valuePercent = ((value - min) / range) * 100
  const isDefault = Math.abs(value - defaultValue) < 0.01
  const decimals = step < 1 ? 1 : 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)))
    }
  }

  return (
    <div className="group">
      <div className="mb-0.5 flex h-6 items-center justify-between">
        <span className="select-none text-[13px] text-kinari">{label}</span>
        <div className="flex items-center gap-1">
          {!isDefault && (
            <button
              type="button"
              onClick={onReset}
              className="rounded px-1 text-[11px] text-nezumi hover:text-gofun"
              aria-label={`Reset ${label}`}
            >
              Reset
            </button>
          )}
          {isEditing ? (
            <input
              type="number"
              defaultValue={value.toFixed(decimals)}
              onChange={handleInputChange}
              onBlur={() => {
                setIsEditing(false)
                onCommit()
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="h-6 w-14 rounded border border-kincha bg-sumi-900 px-1 text-right text-xs tabular-nums text-gofun focus:outline-none"
              aria-label={`${label} value`}
              step={step}
              min={min}
              max={max}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="h-6 w-14 rounded px-1 text-right text-xs tabular-nums text-gofun hover:bg-sumi-700"
              aria-label={`Edit ${label} value`}
            >
              {value.toFixed(decimals)}{unit}
            </button>
          )}
        </div>
      </div>

      <div className="relative flex h-6 items-center">
        <div
          className="absolute inset-x-0 h-[3px] rounded-full bg-sumi-600"
          style={track ? { background: track } : undefined}
        />

        {!track && (
          <div
            className="absolute h-[3px] rounded-full bg-kinari"
            style={{
              left: `${Math.min(originPercent, valuePercent)}%`,
              width: `${Math.abs(valuePercent - originPercent)}%`,
            }}
          />
        )}

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onPointerDown={() => window.addEventListener('pointerup', onCommit, { once: true })}
          onKeyUp={onCommit}
          onDoubleClick={onReset}
          className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0"
        />

        <div
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-sumi-800 bg-gofun shadow transition-transform group-hover:scale-110 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-kincha"
          style={{ left: `${valuePercent}%` }}
        />
      </div>
    </div>
  )
}
