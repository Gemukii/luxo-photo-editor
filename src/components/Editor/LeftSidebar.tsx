'use client'
import React from 'react'

interface SidebarIconProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
      active
        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
    title={label}
  >
    {icon}
  </button>
)

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('adjust')

  return (
    <aside className="w-16 bg-white shadow-sm flex flex-col items-center py-4 gap-2">
      <SidebarIcon
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        }
        label="Files"
        active={activeTab === 'files'}
        onClick={() => setActiveTab('files')}
      />
      
      <SidebarIcon
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        }
        label="Crop"
        active={activeTab === 'crop'}
        onClick={() => setActiveTab('crop')}
      />
      
      <SidebarIcon
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        }
        label="Presets"
        active={activeTab === 'presets'}
        onClick={() => setActiveTab('presets')}
      />
      
      <SidebarIcon
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
        label="Export"
        active={activeTab === 'export'}
        onClick={() => setActiveTab('export')}
      />
    </aside>
  )
}
