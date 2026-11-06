'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'
import { ExportModal } from './ExportModal'
import { ImageStage } from './ImageStage'
import { NoticeToast } from './NoticeToast'
import { SidePanel } from './SidePanel'
import { TopBar } from './TopBar'
import { Welcome } from './Welcome'

export const EditorLayout: React.FC = () => {
  const hasImage = useEditorStore((state) => state.currentImage !== null)

  return (
    <div className="flex h-[100dvh] flex-col bg-sumi-900 text-gofun">
      <TopBar />

      {hasImage ? (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <ImageStage />
          <SidePanel />
        </div>
      ) : (
        <Welcome />
      )}

      <ExportModal />
      <NoticeToast />
    </div>
  )
}
