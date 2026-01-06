'use client'
import React from 'react'
import { LeftSidebar } from './LeftSidebar'
import { RightPanel } from './RightPanel'
import { TopToolbar } from './TopToolbar'
import { EditorCanvas } from './EditorCanvas'
import { ExportModal } from './ExportModal'

export const EditorLayout: React.FC = () => {
  return (
    <>
      <div className="flex flex-col h-screen">
        <TopToolbar />

        <div className="flex-1 px-4 pb-4 min-h-0">
          <div className="w-full h-full max-w-7xl mx-auto flex gap-4 items-stretch">
            <LeftSidebar />

            <main className="flex-1 flex items-center justify-center min-h-0">
              <EditorCanvas />
            </main>

            <RightPanel />
          </div>
        </div>
      </div>

      <ExportModal />
    </>
  )
}

