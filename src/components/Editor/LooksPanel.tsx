'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Slider } from '@/components/UI/Slider'
import { getLook, Look, LookCategory, LOOK_CATEGORIES, LOOKS } from '@/lib/looks/catalog'
import { Lut } from '@/lib/looks/cube'
import { loadLookLut } from '@/lib/looks/loadLut'
import { createRenderer } from '@/lib/render/createRenderer'
import { createProxy, THUMBNAIL_MAX_EDGE } from '@/lib/render/proxy'
import { resolveEdit } from '@/lib/render/resolveEdit'
import { Renderer } from '@/lib/render/types'
import { useEditorStore } from '@/store/editorStore'

type CategoryFilter = LookCategory | 'All'

const ORIGINAL_ID = 'original'
const THUMBNAIL_DELAY_MS = 120

const FILTERS: CategoryFilter[] = ['All', ...LOOK_CATEGORIES]

const useBundledLuts = () => {
  const [luts, setLuts] = useState<Map<string, Lut>>(new Map())

  useEffect(() => {
    let isActive = true

    Promise.allSettled(LOOKS.map(loadLookLut)).then((results) => {
      if (!isActive) return

      const loaded = results.flatMap((result) =>
        result.status === 'fulfilled' && result.value ? [result.value] : []
      )
      setLuts(new Map(loaded.map((lut) => [lut.id, lut])))
    })

    return () => {
      isActive = false
    }
  }, [])

  return luts
}

interface LookCardProps {
  id: string
  name: string
  isSelected: boolean
  onSelect: () => void
  registerCanvas: (id: string, canvas: HTMLCanvasElement | null) => void
}

const LookCard: React.FC<LookCardProps> = ({ id, name, isSelected, onSelect, registerCanvas }) => (
  <button type="button" onClick={onSelect} aria-pressed={isSelected} className="group min-w-0 text-left">
    <span
      className={`block overflow-hidden rounded-md outline outline-2 outline-offset-2 transition-[outline-color] ${
        isSelected ? 'outline-kincha' : 'outline-transparent group-hover:outline-sumi-500'
      }`}
    >
      <canvas
        ref={(canvas) => registerCanvas(id, canvas)}
        className="block aspect-[4/3] w-full bg-sumi-700 object-cover"
      />
    </span>
    <span className={`mt-1.5 block truncate text-[13px] ${isSelected ? 'text-gofun' : 'text-kinari'}`}>
      {name}
    </span>
  </button>
)

export const LooksPanel: React.FC = () => {
  const currentImage = useEditorStore((state) => state.currentImage)
  const adjustments = useEditorStore((state) => state.adjustments)
  const crop = useEditorStore((state) => state.crop)
  const look = useEditorStore((state) => state.look)
  const setLook = useEditorStore((state) => state.setLook)
  const setLookStrength = useEditorStore((state) => state.setLookStrength)
  const commitHistory = useEditorStore((state) => state.commitHistory)

  const [filter, setFilter] = useState<CategoryFilter>('All')
  const luts = useBundledLuts()

  const visibleLooks = useMemo(
    () => LOOKS.filter((item) => filter === 'All' || item.category === filter),
    [filter]
  )

  const canvases = useRef(new Map<string, HTMLCanvasElement>())
  const renderTarget = useRef<HTMLCanvasElement | null>(null)
  const renderer = useRef<Renderer | null>(null)

  const registerCanvas = (id: string, canvas: HTMLCanvasElement | null) => {
    if (canvas) canvases.current.set(id, canvas)
    else canvases.current.delete(id)
  }

  useEffect(() => {
    if (!currentImage) return

    const canvas = document.createElement('canvas')
    const instance = createRenderer(canvas, { useMipmaps: false })

    instance.setSource(createProxy(currentImage, THUMBNAIL_MAX_EDGE))
    renderTarget.current = canvas
    renderer.current = instance

    return () => {
      instance.dispose({ releaseContext: true })
      renderer.current = null
    }
  }, [currentImage])

  // Every thumbnail shows the user's own photo, with their current edit
  useEffect(() => {
    const timeout = setTimeout(() => {
      const instance = renderer.current
      const target = renderTarget.current
      if (!instance || !target) return

      const draw = (id: string, item: Look | null) => {
        const thumbnail = canvases.current.get(id)
        if (!thumbnail) return

        const applied = item ? { id: item.id, strength: 1 } : null
        const lut = item ? luts.get(item.id) ?? null : null

        instance.render({ ...resolveEdit(adjustments, crop, applied, lut), compareSplit: null })

        thumbnail.width = target.width
        thumbnail.height = target.height
        thumbnail.getContext('2d')?.drawImage(target, 0, 0)
      }

      draw(ORIGINAL_ID, null)
      visibleLooks.forEach((item) => draw(item.id, item))
    }, THUMBNAIL_DELAY_MS)

    return () => clearTimeout(timeout)
  }, [adjustments, crop, luts, visibleLooks, currentImage])

  const activeLook = getLook(look?.id)

  return (
    <>
      <div className="flex shrink-0 gap-1 overflow-x-auto px-4 pb-2 pt-3">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            className={`h-7 shrink-0 rounded-full px-3 text-xs transition-colors ${
              filter === item ? 'bg-sumi-600 text-gofun' : 'text-nezumi hover:text-gofun'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-1">
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-2">
          <LookCard
            id={ORIGINAL_ID}
            name="Original"
            isSelected={!look}
            onSelect={() => setLook(null)}
            registerCanvas={registerCanvas}
          />
          {visibleLooks.map((item) => (
            <LookCard
              key={item.id}
              id={item.id}
              name={item.name}
              isSelected={look?.id === item.id}
              onSelect={() => setLook(item.id)}
              registerCanvas={registerCanvas}
            />
          ))}
        </div>
      </div>

      {look && activeLook && (
        <div className="shrink-0 border-t border-sumi-700 px-4 pb-3 pt-2">
          <Slider
            label={`${activeLook.name} strength`}
            value={look.strength * 100}
            min={0}
            max={100}
            step={1}
            defaultValue={100}
            unit="%"
            onChange={(value) => setLookStrength(value / 100)}
            onCommit={commitHistory}
            onReset={() => {
              setLookStrength(1)
              commitHistory()
            }}
          />
        </div>
      )}
    </>
  )
}
