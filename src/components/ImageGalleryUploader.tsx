import { useState, useRef } from 'react'
import { compressMultipleFiles } from '../utils/imageCompressor'

interface ImageGalleryUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageGalleryUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageGalleryUploaderProps) {
  const [compressing, setCompressing] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) return

    setCompressing(true)
    try {
      const validFiles = Array.from(files).slice(0, remainingSlots)
      const compressedDataUrls = await compressMultipleFiles(validFiles)
      const updated = [...images, ...compressedDataUrls].slice(0, maxImages)
      onChange(updated)
    } catch (err) {
      console.error('Error al procesar imágenes:', err)
    } finally {
      setCompressing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddUrl = (e: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (images.length >= maxImages) return

    onChange([...images, trimmed].slice(0, maxImages))
    setUrlInput('')
  }

  const handleRemove = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index))
  }

  const handleSetCover = (index: number) => {
    if (index === 0) return
    const selected = images[index]
    const rest = images.filter((_, idx) => idx !== index)
    onChange([selected, ...rest])
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className="image-uploader-container">
      <div className="image-uploader-header">
        <label className="image-uploader-title">
          📸 Galería de Fotos de la Prenda
        </label>
        <span className={`image-count-tag ${images.length >= maxImages ? 'full' : ''}`}>
          {images.length} / {maxImages} fotos
        </span>
      </div>

      {/* Upload Methods */}
      {images.length < maxImages && (
        <div className="uploader-inputs-row">
          {/* Dropzone for local file upload */}
          <div
            className={`uploader-dropzone ${dragOver ? 'drag-active' : ''} ${compressing ? 'compressing' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/heic"
              multiple
              className="hidden-file-input"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files)
              }}
            />
            <div className="dropzone-inner-content">
              <span className="dropzone-emoji">{compressing ? '⏳' : '📁'}</span>
              <div className="dropzone-text-group">
                <strong>{compressing ? 'Optimizando imágenes...' : 'Subir fotos desde tu dispositivo'}</strong>
                <p>Haz clic o arrastra fotos aquí (JPG, PNG, WebP) · Se optimizan automáticamente</p>
              </div>
            </div>
          </div>

          {/* URL Input Bar */}
          <div className="uploader-url-bar">
            <input
              type="url"
              placeholder="O pega enlace directo de imagen (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddUrl(e) }}
            />
            <button
              type="button"
              className="btn-add-url"
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
            >
              + Agregar URL
            </button>
          </div>
        </div>
      )}

      {/* Preview Thumbnails Grid */}
      {images.length > 0 ? (
        <div className="uploader-thumbnails-grid">
          {images.map((img, idx) => (
            <div key={idx} className={`thumbnail-card ${idx === 0 ? 'is-cover' : ''}`}>
              <img
                src={img}
                alt={`Foto ${idx + 1}`}
                className="thumbnail-img"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=200&q=80'
                }}
              />

              <div className="thumbnail-badge">
                {idx === 0 ? '⭐ Portada' : `#${idx + 1}`}
              </div>

              <div className="thumbnail-actions-overlay">
                {idx !== 0 && (
                  <button
                    type="button"
                    className="action-btn-cover"
                    onClick={() => handleSetCover(idx)}
                    title="Poner como foto principal"
                  >
                    ⭐ Principal
                  </button>
                )}
                <button
                  type="button"
                  className="action-btn-delete"
                  onClick={() => handleRemove(idx)}
                  title="Eliminar esta foto"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="uploader-empty-hint">
          <span>ℹ️ Agrega al menos 1 foto para que la prenda aparezca en el catálogo. La primera foto será la portada principal.</span>
        </div>
      )}
    </div>
  )
}
