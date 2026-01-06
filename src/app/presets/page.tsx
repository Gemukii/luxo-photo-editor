'use client'
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
    <div className="relative group h-full">
      <div
        className={`relative flex h-full flex-col rounded-[22px] bg-white/85 border border-white/70 shadow-xl shadow-slate-200/60 overflow-hidden transition-transform duration-150 ${
          active ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-white' : 'hover:-translate-y-1'
        }`}
      >
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
          <p className="text-xs text-slate-500">{preset.category}</p>
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

  const categoryCounts = useMemo(() => {
    return filters
      .filter((item) => item !== 'All')
      .map((category) => ({
        category,
        count: presetItems.filter((preset) => preset.category === category).length,
      }))
  }, [])

  const totalVisible = filteredPresets.length

  return (
    <div className="min-h-screen bg-slate-50/60 px-8 py-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px,1fr]">
        <aside className="space-y-6 sticky top-6 self-start">
          <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl shadow-indigo-200/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Filters</p>
                <h2 className="text-lg font-semibold text-slate-900">Preset types</h2>
              </div>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600">
                {presetItems.length}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {filters.map((filter) => {
                const isActive = activeFilter === filter
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`w-full h-11 rounded-xl text-sm font-semibold transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-200 border-transparent'
                        : 'bg-white/90 text-slate-700 border-slate-200 hover:shadow-sm'
                    }`}
                  >
                    {filter}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl shadow-indigo-200/40 p-5 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 border border-slate-200 px-4 py-3 shadow-inner">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search presets"
                className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="w-full h-12 rounded-2xl border border-slate-200 text-slate-800 bg-white/90 hover:shadow-md transition-all font-semibold">
                Import Presets
              </button>
              <button className="w-full h-12 rounded-2xl border border-slate-200 text-slate-800 bg-white/90 hover:shadow-md transition-all font-semibold">
                Create New
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl shadow-indigo-200/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Library snapshot</p>
              <span className="text-xs text-emerald-600">Live</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {categoryCounts.map((item) => (
                <div
                  key={item.category}
                  className="rounded-2xl border border-slate-100 bg-white/90 px-3 py-2 shadow-sm"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.category}</p>
                  <p className="text-xl font-semibold text-slate-900">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Library</p>
              <h1 className="text-2xl font-semibold text-slate-900">Explore presets</h1>
              <p className="text-sm text-slate-500">{totalVisible} {totalVisible === 1 ? 'preset' : 'presets'} found</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-600">
                {activeFilter}
              </span>
              {search && (
                <span className="rounded-full bg-slate-900/5 px-3 py-1 text-sm text-slate-700">
                  "{search}"
                </span>
              )}
              <button
                onClick={() => {
                  setSearch('')
                  setActiveFilter('All')
                }}
                className="h-10 rounded-full border border-slate-200 bg-white/90 px-4 text-sm font-semibold text-slate-700 hover:shadow-sm"
              >
                Reset view
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-indigo-200/40">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredPresets.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 py-16 text-center">
                  <p className="text-lg font-semibold text-slate-800">No presets match</p>
                  <p className="text-sm text-slate-500">Try a different filter or clear the search.</p>
                </div>
              ) : (
                filteredPresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    active={menuId === preset.id}
                    menuOpen={menuId === preset.id}
                    onMenuToggle={(id) => setMenuId((prev) => (prev === id ? '' : id))}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
