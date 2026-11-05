'use client'
import React, { useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'

interface OpenImageButtonProps {
  className?: string
  children: React.ReactNode
}

export const OpenImageButton: React.FC<OpenImageButtonProps> = ({ className, children }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const importFile = useEditorStore((state) => state.importFile)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Clearing the value lets the same file be chosen twice in a row
    e.target.value = ''
    if (file) await importFile(file)
  }

  return (
    <>
      <button type="button" className={className} onClick={() => inputRef.current?.click()}>
        {children}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Open an image"
        onChange={handleChange}
      />
    </>
  )
}
