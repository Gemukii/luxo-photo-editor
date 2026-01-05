import React, { useMemo, useState } from 'react'

interface Preset {
  id: string
  name: string
  category: 'All' | 'Landscape' | 'Portrait' | 'B&W' | 'Vintage'
  image: string
}

const filters: Preset['category'][] = ['All', 'Landscape', 'Portrait', 'B&W', 'Vintage']

const actions = [
  { label: 'Preview', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )},
  { label: 'Edit', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414l-3.586-3.586a1 1 0 00-1.414 0L4 14.586a1 1 0 00-.293.707V20z" />
    </svg>
  )},
  { label: 'Share', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v13" />
    </svg>
  )},
]

const sampleImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'

const presetItems: Preset[] = [
  { id: 'golden-hour', name: 'Golden Hour', category: 'Landscape', image: sampleImage },
  { id: 'moody-blue-1', name: 'Moody Blue', category: 'Portrait', image: sampleImage },
  { id: 'moody-blue-2', name: 'Moody Blue', category: 'B&W', image: sampleImage },
  { id: 'film-vintage-1', name: 'Film Vintage', category: 'Vintage', image: sampleImage },
  { id: 'warm-nostalgia', name: 'Warm Nostalgia', category: 'Portrait', image: sampleImage },
  { id: 'high-contrast', name: 'High Contrast B&W', category: 'B&W', image: sampleImage },
  { id: 'film-vintage-2', name: 'Film Vintage', category: 'Vintage', image: sampleImage },
  { id: 'moody-blue-3', name: 'Moody Blue', category: 'Landscape', image: sampleImage },
  { id: 'golden-hour-2', name: 'Golden Hour', category: 'Landscape', image: sampleImage },
  { id: 'warm-nostalgia-2', name: 'Warm Nostalgia', category: 'Portrait', image: sampleImage },
  { id: 'film-vintage-3', name: 'Film Vintage', category: 'Vintage', image: sampleImage },
  { id: 'high-contrast-2', name: 'High Contrast B&W', category: 'B&W', image: sampleImage },
]

const PresetCard: React.FC<{
  preset: Preset
  active?: boolean
  onMenuToggle: (id: string) => void
  menuOpen: boolean
}> = ({ preset, active, onMenuToggle, menuOpen }) => {
  return (
    <div className="relative group">
      <div className={`relative rounded-[22px] bg-white/80 border border-white/70 shadow-xl shadow-slate-200/60 overflow-hidden transition-transform duration-150 ${
        active ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-white' : 'hover:-translate-y-1'
      }`}>
        <div className="relative aspect-[4/4.3] w-full overflow-hidden">
          <img
            src={preset.image}
            alt={preset.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex">
            <div className="w-1/2 bg-gradient-to-r from-slate-900/40 to-transparent" />
            <div className="w-1/2 bg-gradient-to-l from-white/30 via-transparent to-transparent" />
          </div>
          <div className="absolute top-3 right-3">
            <button
              onClick={() => onMenuToggle(preset.id)}
              className="h-7 w-7 rounded-full bg-white/80 border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-indigo-600 transition"
              aria-label="Preset actions"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-slate-900 truncate">{preset.name}</p>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-16 right-0 z-20 w-56 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Apply</span>
            <button
              onClick={() => onMenuToggle('')}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="py-2">
            {actions.map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PresetsPage() {
  const [activeFilter, setActiveFilter] = useState<Preset['category']>('All')
  const [search, setSearch] = useState('')
  const [menuId, setMenuId] = useState('')

  const filteredPresets = useMemo(() => {
    return presetItems.filter((preset) => {
      const matchesFilter = activeFilter === 'All' || preset.category === activeFilter
      const matchesSearch = preset.name.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [activeFilter, search])

  return (
    <div className="min-h-screen flex flex-col px-6 pb-8 pt-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        {/* Top filters and actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/70 shadow-lg shadow-indigo-200/40 rounded-full px-2 py-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-200 border-transparent'
                      : 'bg-white/80 text-slate-700 border-slate-200 hover:shadow-sm'
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white/80 border border-slate-200 rounded-full px-4 py-2 shadow-inner">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-32"
              />
            </div>
            <button className="px-5 h-11 rounded-full border border-slate-300 text-slate-800 bg-white/90 hover:shadow-md transition-all font-semibold">
              Import Presets
             </button>
            <button className="px-5 h-11 rounded-full border border-slate-300 text-slate-800 bg-white/90 hover:shadow-md transition-all font-semibold">
              Create New
            </button>
           </div>
         </div>
 
         {/* Grid */}
         <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
           {filteredPresets.map((preset) => (
             <PresetCard
               key={preset.id}
               preset={preset}
               active={menuId === preset.id}
               menuOpen={menuId === preset.id}
               onMenuToggle={(id) => setMenuId((prev) => (prev === id ? '' : id))}
             />
           ))}
         </div>
       </div>
     </div>
   )
 }
