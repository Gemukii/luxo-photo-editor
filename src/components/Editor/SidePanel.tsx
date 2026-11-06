'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'
import { EditorTab } from '@/types/editor.types'
import { AdjustPanel } from './AdjustPanel'
import { CropPanel } from './CropPanel'
import { LooksPanel } from './LooksPanel'

const TABS: { id: EditorTab; label: string }[] = [
  { id: 'looks', label: 'Looks' },
  { id: 'adjust', label: 'Adjust' },
  { id: 'crop', label: 'Crop' },
]

export const SidePanel: React.FC = () => {
  const activeTab = useEditorStore((state) => state.activeTab)
  const setActiveTab = useEditorStore((state) => state.setActiveTab)

  return (
    <aside className="flex min-h-0 flex-1 flex-col border-t border-sumi-700 bg-sumi-800 md:w-[300px] md:flex-none md:border-l md:border-t-0 lg:w-[340px]">
      <div role="tablist" aria-label="Editing tools" className="flex shrink-0 border-b border-sumi-700 px-2">
        {TABS.map(({ id, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={`relative h-11 flex-1 text-sm transition-colors ${
                isActive ? 'font-medium text-gofun' : 'text-nezumi hover:text-gofun'
              }`}
            >
              {label}
              {isActive && <span className="absolute inset-x-5 bottom-0 h-0.5 bg-shu-bright" />}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="flex min-h-0 flex-1 flex-col">
        {activeTab === 'looks' && <LooksPanel />}
        {activeTab === 'adjust' && <AdjustPanel />}
        {activeTab === 'crop' && <CropPanel />}
      </div>
    </aside>
  )
}
