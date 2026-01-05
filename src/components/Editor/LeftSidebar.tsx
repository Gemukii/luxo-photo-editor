'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'

interface SidebarIconProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  disabled?: boolean
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, label, active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 border ${
      active
        ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-200 border-transparent'
        : disabled
        ? 'text-slate-300 cursor-not-allowed border-slate-100'
        : 'text-slate-600 bg-white/80 border-slate-200 hover:-translate-y-0.5 hover:shadow-md'
    }`}
    title={label}
  >
    {icon}
  </button>
)

export const LeftSidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentImage, setShowExportModal } = useEditorStore()

  const handleExport = () => {
    if (currentImage) {
      setShowExportModal(true)
    }
  }

  return (
    <aside className="w-16 bg-white/70 backdrop-blur-xl border border-white/70 shadow-lg shadow-indigo-200/30 rounded-3xl flex flex-col items-center py-6 gap-3">
      <SidebarIcon
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        }
        label="Adjustments"
        active={activeTab === 'adjust'}
        onClick={() => setActiveTab('adjust')}
        disabled={!currentImage}
      />
      
      <SidebarIcon
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        }
        label="Crop & Rotate"
        active={activeTab === 'crop'}
        onClick={() => setActiveTab('crop')}
        disabled={!currentImage}
      />
      
      <SidebarIcon
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        label="Presets"
        active={activeTab === 'presets'}
        onClick={() => setActiveTab('presets')}
        disabled={!currentImage}
      />
      
      <div className="flex-1" />
      
      <SidebarIcon
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
        label="Export"
        active={false}
        onClick={handleExport}
        disabled={!currentImage}
      />
    </aside>
  )
}
