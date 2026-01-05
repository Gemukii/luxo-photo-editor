'use client'
import React from 'react'
import { LeftSidebar } from './LeftSidebar'
import { RightPanel } from './RightPanel'
import { TopToolbar } from './TopToolbar'
import { EditorCanvas } from './EditorCanvas'

export const EditorLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopToolbar />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        
        <main className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <EditorCanvas />
        </main>
        
        <RightPanel />
      </div>
    </div>
  )
}
