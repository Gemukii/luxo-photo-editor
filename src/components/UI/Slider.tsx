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
  
  const percentage = ((value - min) / (max - min)) * 100
  const isDefault = value === 0

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value.toFixed(step < 1 ? 2 : 0)}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-16 px-2 py-1 text-xs text-right border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            step={step}
            min={min}
            max={max}
          />
          <button
            onClick={onReset}
            disabled={isDefault}
            className="text-xs text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Reset"
          >
            ↺
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full shadow-sm transition-all duration-150 pointer-events-none ${
            isFocused ? 'border-blue-500 scale-110' : 'border-gray-300'
          }`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  )
}
