export interface LoadedImage {
  image: HTMLImageElement
  fileName: string
  fileSize: number
  width: number
  height: number
}

const RAW_EXTENSIONS = /\.(dng|cr2|cr3|nef|arw|raf|orf|rw2)$/i

/** Returns a user-facing message when a file cannot be opened, or null when it can. */
export const getImportError = (file: Pick<File, 'name' | 'type'>): string | null => {
  if (RAW_EXTENSIONS.test(file.name)) {
    return 'RAW files are not supported yet. Please export a JPEG, PNG or WebP first.'
  }
  if (!file.type.startsWith('image/')) {
    return 'This file is not an image. Please choose a JPEG, PNG or WebP file.'
  }
  return null
}

export const loadImageFromFile = (file: File): Promise<LoadedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        resolve({
          image: img,
          fileName: file.name,
          fileSize: file.size,
          width: img.width,
          height: img.height,
        })
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
