'use client'
import React, { useState } from 'react'
import { buttonStyles } from '@/components/UI/Button'
import { useEditorStore } from '@/store/editorStore'
import { OpenImageButton } from './OpenImageButton'

const COLOR_PLATES = [
  [
    { name: 'Shu', color: '#BF4128' },
    { name: 'Kinari', color: '#CFC7B8' },
    { name: 'Ai', color: '#2E4A7A' },
  ],
  [
    { name: 'Kincha', color: '#CF9A3F' },
    { name: 'Sumi', color: '#292521' },
    { name: 'Asagi', color: '#4F9FA6' },
  ],
  [
    { name: 'Wakatake', color: '#6D9C73' },
    { name: 'Gofun', color: '#F4EFE6' },
    { name: 'Shu', color: '#BF4128' },
  ],
]

const STEPS = ['Open a photo', 'Pick a look', 'Export']

export const Welcome: React.FC = () => {
  const importFile = useEditorStore((state) => state.importFile)
  const isLoading = useEditorStore((state) => state.isLoading)
  const [isDragging, setIsDragging] = useState(false)

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
      className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-sumi-950 px-6 py-10"
    >
      <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <h1 className="font-serif text-4xl font-medium leading-tight text-gofun sm:text-5xl">
            Your photo, finished
            <br />
            in one click.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-kinari">
            Choose a look and let LUXO handle the colour, or take full control with manual
            adjustments. Your photos never leave this device.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <OpenImageButton className={`${buttonStyles.base} ${buttonStyles.primary} h-12 px-6 text-base`}>
              {isLoading ? 'Opening…' : 'Choose a photo'}
            </OpenImageButton>
            <span className="text-sm text-nezumi">or drop it anywhere</span>
          </div>

          <ol className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-nezumi">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="font-serif text-kincha">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          <p className="mt-6 text-xs text-nezumi">JPEG, PNG and WebP</p>
        </div>

        <div className="hidden gap-3 lg:grid" aria-hidden="true">
          {COLOR_PLATES.map((plate, plateIndex) => (
            <div key={plateIndex} className="grid h-28 grid-cols-[2fr_1fr_1.4fr] overflow-hidden rounded-sm">
              {plate.map(({ name, color }) => (
                <div key={name} style={{ background: color }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {isDragging && (
        <div className="pointer-events-none absolute inset-4 flex items-center justify-center rounded-xl border-2 border-dashed border-kincha bg-sumi-950/80">
          <p className="font-serif text-2xl text-gofun">Drop your photo</p>
        </div>
      )}
    </main>
  )
}
