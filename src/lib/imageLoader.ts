export interface LoadedImage {
  image: HTMLImageElement
  fileName: string
  fileSize: number
  width: number
  height: number
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

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}
