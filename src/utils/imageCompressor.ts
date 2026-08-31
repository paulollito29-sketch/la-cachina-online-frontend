/**
 * Smart Client-side Image Compression Utility
 * Resizes large smartphone/camera photos (e.g. 5MB-15MB) to crisp, lightweight 
 * web-optimized JPEG/WebP data URLs (~100KB-200KB, max 1200px dimension)
 * preventing 413 Payload Too Large and ensuring instant uploads and fast rendering.
 */

export interface ProcessedImage {
  dataUrl: string
  sizeBytes: number
  width: number
  height: number
}

export async function compressImageFile(file: File, maxDimension = 1200, quality = 0.82): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'))

    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Error al decodificar la imagen.'))

      img.onload = () => {
        let { width, height } = img

        // Calculate proportional scale
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // Fallback to original data URL if canvas context fails
          const rawUrl = event.target?.result as string
          resolve({
            dataUrl: rawUrl,
            sizeBytes: file.size,
            width: img.width,
            height: img.height,
          })
          return
        }

        // Clean rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Try webp or fallback to jpeg
        let compressedDataUrl = ''
        try {
          compressedDataUrl = canvas.toDataURL('image/webp', quality)
          if (!compressedDataUrl.startsWith('data:image/webp')) {
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          }
        } catch {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        }

        // Calculate approximate size in bytes
        const base64Str = compressedDataUrl.split(',')[1] || ''
        const sizeBytes = Math.round((base64Str.length * 3) / 4)

        resolve({
          dataUrl: compressedDataUrl,
          sizeBytes,
          width,
          height,
        })
      }

      img.src = event.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}

export async function compressMultipleFiles(files: FileList | File[], maxDimension = 1200, quality = 0.82): Promise<string[]> {
  const fileArray = Array.from(files)
  const results: string[] = []

  for (const file of fileArray) {
    try {
      const processed = await compressImageFile(file, maxDimension, quality)
      results.push(processed.dataUrl)
    } catch (err) {
      console.warn('Error compressing image:', err)
    }
  }

  return results
}
