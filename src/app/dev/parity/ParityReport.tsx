'use client'
import React, { useEffect, useState } from 'react'
import { renderEdit } from '@/lib/imageProcessor'
import { LOOKS } from '@/lib/looks/catalog'
import { loadLookLut } from '@/lib/looks/loadLut'
import { renderFullSize } from '@/lib/render/exportImage'
import { GlRenderer } from '@/lib/render/glRenderer'
import { RenderEdit } from '@/lib/render/types'
import { Adjustments, defaultAdjustments } from '@/types/editor.types'

const SIZE = 256
const MAX_ALLOWED_DIFFERENCE = 2

const createTestCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const across = ctx.createLinearGradient(0, 0, width, 0)
  across.addColorStop(0, '#000000')
  across.addColorStop(0.25, '#bf4128')
  across.addColorStop(0.5, '#6d9c73')
  across.addColorStop(0.75, '#2e4a7a')
  across.addColorStop(1, '#ffffff')
  ctx.fillStyle = across
  ctx.fillRect(0, 0, width, height)

  const down = ctx.createLinearGradient(0, 0, 0, height)
  down.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
  down.addColorStop(0.5, 'rgba(128, 128, 128, 0)')
  down.addColorStop(1, 'rgba(0, 0, 0, 0.6)')
  ctx.fillStyle = down
  ctx.fillRect(0, 0, width, height)

  return canvas
}

const edit = (changes: Partial<Adjustments>): RenderEdit => ({
  adjustments: { ...defaultAdjustments, ...changes },
  crop: null,
  lut: null,
  lutMix: 0,
})

const compare = (a: ImageData, b: ImageData) => {
  let max = 0
  let total = 0

  for (let i = 0; i < a.data.length; i++) {
    const difference = Math.abs(a.data[i] - b.data[i])
    max = Math.max(max, difference)
    total += difference
  }

  return { max, mean: Number((total / a.data.length).toFixed(3)) }
}

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

const runParity = async () => {
  const canvas = document.createElement('canvas')
  const renderer = GlRenderer.create(canvas, { useMipmaps: false })
  if (!renderer) throw new Error('WebGL2 is not available')

  const source = createTestCanvas(SIZE, SIZE)
  const reference = source.getContext('2d')!.getImageData(0, 0, SIZE, SIZE)
  renderer.setSource(source)

  const cases: [string, RenderEdit][] = [['default', edit({})]]

  for (const key of Object.keys(defaultAdjustments) as (keyof Adjustments)[]) {
    const amount = key === 'exposure' ? 1.2 : 70
    cases.push([`${key} +`, edit({ [key]: amount })], [`${key} -`, edit({ [key]: -amount })])
  }

  cases.push([
    'all',
    edit({
      exposure: 0.4, contrast: 25, highlights: -30, shadows: 35, whites: 15, blacks: 20,
      saturation: 15, vibrance: 30, temperature: 12, tint: -8,
    }),
  ])

  for (const look of LOOKS) {
    const lut = await loadLookLut(look)
    if (lut) {
      cases.push([`${look.id} 100%`, { ...edit({}), lut, lutMix: 1 }])
      cases.push([`${look.id} 50%`, { ...edit({}), lut, lutMix: 0.5 }])
    }
  }

  const results = cases.map(([name, testEdit]) => ({
    name,
    ...compare(renderEdit(reference, testEdit), renderer.readPreview(testEdit, SIZE)),
  }))

  renderer.dispose({ releaseContext: true })

  return results
}

const runPreviewTiming = async () => {
  const canvas = document.createElement('canvas')
  const renderer = GlRenderer.create(canvas)!
  const gl = canvas.getContext('webgl2')!
  const look = LOOKS.find((item) => item.id === 'cinema')!
  const lut = await loadLookLut(look)

  renderer.setSource(createTestCanvas(2560, 1707))

  const testEdit = { ...edit({ exposure: 0.4, contrast: 20, vibrance: 20 }), lut, lutMix: 1 }
  const pixel = new Uint8Array(4)
  const times: number[] = []

  for (let i = 0; i < 30; i++) {
    const start = performance.now()
    renderer.render({ ...testEdit, compareSplit: null })
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
    times.push(performance.now() - start)
  }

  renderer.dispose({ releaseContext: true })

  return { size: '2560 x 1707', medianMs: Number(median(times).toFixed(2)) }
}

const runExportTiming = async (width: number, height: number) => {
  const look = LOOKS.find((item) => item.id === 'cinema')!
  const lut = await loadLookLut(look)
  const source = createTestCanvas(width, height)

  const start = performance.now()
  const output = await renderFullSize(source, {
    ...edit({ exposure: 0.4, contrast: 20 }),
    lut,
    lutMix: 1,
  })
  const elapsed = performance.now() - start

  // The test image is smooth, so a tile seam would show as a jump in a row of pixels
  const row = output.getContext('2d')!.getImageData(0, Math.floor(height / 2), width, 1).data
  let largestStep = 0
  let largestStepAtSeam = 0

  for (let x = 1; x < width; x++) {
    const i = x * 4
    const step = Math.max(Math.abs(row[i] - row[i - 4]), Math.abs(row[i + 1] - row[i - 3]))

    largestStep = Math.max(largestStep, step)
    if (x % 4096 === 0) largestStepAtSeam = Math.max(largestStepAtSeam, step)
  }

  return {
    size: `${width} x ${height}`,
    megapixels: Number(((width * height) / 1e6).toFixed(1)),
    output: `${output.width} x ${output.height}`,
    milliseconds: Math.round(elapsed),
    largestStep,
    largestStepAtSeam,
  }
}

export const ParityReport: React.FC = () => {
  const [report, setReport] = useState('Running…')

  useEffect(() => {
    const run = async () => {
      const parity = await runParity()
      const worst = parity.reduce((a, b) => (b.max > a.max ? b : a))

      setReport(
        JSON.stringify(
          {
            pass: worst.max <= MAX_ALLOWED_DIFFERENCE,
            cases: parity.length,
            worst,
            preview: await runPreviewTiming(),
            export24: await runExportTiming(6000, 4000),
            export45: await runExportTiming(8256, 5504),
            parity,
          },
          null,
          2
        )
      )
    }

    run().catch((error) => setReport(`Failed: ${error}`))
  }, [])

  return <pre className="h-screen overflow-auto bg-sumi-900 p-6 text-xs text-gofun">{report}</pre>
}
