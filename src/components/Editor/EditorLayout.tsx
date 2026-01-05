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

        <div className="flex-1 px-6 pb-6">
          <div className="w-full h-full max-w-6xl mx-auto flex gap-6">
            <LeftSidebar />

            <main className="flex-1 flex items-center justify-center">
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

