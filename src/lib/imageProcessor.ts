import { Adjustments } from '@/types/editor.types'

export const applyAdjustments = (
  imageData: ImageData,
  adjustments: Adjustments
): ImageData => {
  const data = new Uint8ClampedArray(imageData.data)
  const result = new ImageData(data, imageData.width, imageData.height)
  const pixels = result.data

  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i]
    let g = pixels[i + 1]
    let b = pixels[i + 2]

    // Exposure
    if (adjustments.exposure !== 0) {
      const exposureFactor = Math.pow(2, adjustments.exposure)
      r *= exposureFactor
      g *= exposureFactor
      b *= exposureFactor
    }

    // Contrast
    if (adjustments.contrast !== 0) {
      const contrastFactor = (adjustments.contrast + 100) / 100
      r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255
      g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255
      b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255
    }

    // Highlights (brighten bright areas)
    if (adjustments.highlights !== 0) {
      const brightness = (r + g + b) / 3
      if (brightness > 128) {
        const factor = ((brightness - 128) / 127) * (adjustments.highlights / 100)
        r += factor * 50
        g += factor * 50
        b += factor * 50
      }
    }

    // Shadows (brighten dark areas)
    if (adjustments.shadows !== 0) {
      const brightness = (r + g + b) / 3
      if (brightness < 128) {
        const factor = ((128 - brightness) / 128) * (adjustments.shadows / 100)
        r += factor * 50
        g += factor * 50
        b += factor * 50
      }
    }

    // Whites (brighten very bright areas)
    if (adjustments.whites !== 0) {
      const brightness = (r + g + b) / 3
      if (brightness > 180) {
        const factor = ((brightness - 180) / 75) * (adjustments.whites / 100)
        r += factor * 50
        g += factor * 50
        b += factor * 50
      }
    }

    // Blacks (darken very dark areas)
    if (adjustments.blacks !== 0) {
      const brightness = (r + g + b) / 3
      if (brightness < 75) {
        const factor = ((75 - brightness) / 75) * (adjustments.blacks / 100)
        r -= factor * 30
        g -= factor * 30
        b -= factor * 30
      }
    }

    // Temperature (warm/cool)
    if (adjustments.temperature !== 0) {
      const tempFactor = adjustments.temperature / 100
      r += tempFactor * 40
      b -= tempFactor * 40
    }

    // Tint (magenta/green)
    if (adjustments.tint !== 0) {
      const tintFactor = adjustments.tint / 100
      r += tintFactor * 20
      g -= tintFactor * 20
    }

    // Saturation
    if (adjustments.saturation !== 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      const saturationFactor = (adjustments.saturation + 100) / 100
      r = gray + (r - gray) * saturationFactor
      g = gray + (g - gray) * saturationFactor
      b = gray + (b - gray) * saturationFactor
    }

    // Vibrance (selective saturation)
    if (adjustments.vibrance !== 0) {
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const currentSaturation = max - min
      
      if (currentSaturation < 128) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        const vibranceFactor = 1 + (adjustments.vibrance / 100) * ((128 - currentSaturation) / 128)
        r = gray + (r - gray) * vibranceFactor
        g = gray + (g - gray) * vibranceFactor
        b = gray + (b - gray) * vibranceFactor
      }
    }

    // Clamp values
    pixels[i] = Math.max(0, Math.min(255, r))
    pixels[i + 1] = Math.max(0, Math.min(255, g))
    pixels[i + 2] = Math.max(0, Math.min(255, b))
  }

  return result
}
