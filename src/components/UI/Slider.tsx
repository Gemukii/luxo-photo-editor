'use client'
import React, { useState } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  onReset: () => void
  unit?: string
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onReset,
  unit = '',
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const range = max - min
  const zeroPoint = (-min / range) * 100
  const thumbPercent = ((value - min) / range) * 100
  const isDefault = Math.abs(value) < 0.01

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)))
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-700 select-none">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              type="number"
              value={value.toFixed(step < 1 ? 1 : 0)}
              onChange={handleInputChange}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="w-16 px-2 py-1 text-xs text-right border border-indigo-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              step={step}
              min={min}
              max={max}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-16 px-2 py-1 text-xs text-right text-slate-700 bg-white/70 border border-slate-200 rounded-md hover:shadow-sm transition"
            >
              {value.toFixed(step < 1 ? 1 : 0)}{unit}
            </button>
          )}
          <button
            onClick={onReset}
            disabled={isDefault}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-slate-100"
            title="Reset to default"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative h-9 flex items-center">
        <div className="absolute inset-x-0 h-1 bg-slate-200 rounded-full" />
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-4 bg-slate-300" />

        <div
          className="absolute h-1 bg-gradient-to-r from-indigo-400 via-blue-500 to-sky-400 rounded-full transition-all duration-150"
          style={{
            width: `${Math.abs(thumbPercent - zeroPoint)}%`,
            left: value >= 0 ? `${zeroPoint}%` : `${thumbPercent}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />

        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border rounded-full shadow-md transition-all duration-100 pointer-events-none ${
            isFocused ? 'border-indigo-400 shadow-indigo-100 scale-110' : 'border-slate-200'
          }`}
          style={{ left: `calc(${thumbPercent}% - 10px)` }}
        />
      </div>
    </div>
  )
}
