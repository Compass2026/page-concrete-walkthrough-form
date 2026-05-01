'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'

interface PhotoDropzoneProps {
  files: File[]
  onChange: (files: File[]) => void
}

const MAX_PHOTOS = 20

export default function PhotoDropzone({ files, onChange }: PhotoDropzoneProps) {
  const [previews, setPreviews] = useState<string[]>([])
  // Keep a ref to track which URLs we created so we can revoke them
  const previewUrlsRef = useRef<string[]>([])

  // Sync previews whenever `files` changes externally (e.g., on form reset)
  useEffect(() => {
    if (files.length === 0 && previews.length > 0) {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      previewUrlsRef.current = []
      setPreviews([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length])

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const remaining = MAX_PHOTOS - files.length
      if (remaining <= 0) return
      const added = accepted.slice(0, remaining)

      // Compress each image before passing upstream
      const compressed = await Promise.all(
        added.map((f) =>
          imageCompression(f, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/jpeg',
          })
        )
      )

      const newFiles = [...files, ...compressed]
      onChange(newFiles)
      const newUrls = compressed.map((f) => URL.createObjectURL(f))
      previewUrlsRef.current = [...previewUrlsRef.current, ...newUrls]
      setPreviews((p) => [...p, ...newUrls])
    },
    [files, onChange]
  )

  const remove = (idx: number) => {
    URL.revokeObjectURL(previews[idx])
    previewUrlsRef.current = previewUrlsRef.current.filter((_, i) => i !== idx)
    onChange(files.filter((_, i) => i !== idx))
    setPreviews((p) => p.filter((_, i) => i !== idx))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.gif'] },
    maxFiles: MAX_PHOTOS,
    disabled: files.length >= MAX_PHOTOS,
  })

  const atMax = files.length >= MAX_PHOTOS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Drop zone / tap zone */}
      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? ' dropzone-active' : ''}`}
        style={{ opacity: atMax ? 0.5 : 1, cursor: atMax ? 'not-allowed' : 'pointer' }}
        aria-label="Photo upload area"
      >
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          <span className="dropzone-icon">
            {isDragActive ? '🎯' : '📷'}
          </span>
          {isDragActive ? (
            <p style={{ fontWeight: 700, color: 'var(--brand)', margin: 0, fontSize: 15 }}>
              Drop photos here…
            </p>
          ) : atMax ? (
            <p style={{ fontWeight: 700, color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>
              Maximum {MAX_PHOTOS} photos reached
            </p>
          ) : (
            <>
              <p style={{ fontWeight: 700, color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>
                Tap to add photos
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                JPG · PNG · HEIC · WEBP · Up to {MAX_PHOTOS} images
              </p>
            </>
          )}
        </div>
      </div>

      {/* Photo thumbnail grid */}
      {previews.length > 0 && (
        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 8px',
          }}>
            {files.length} / {MAX_PHOTOS} selected
          </p>
          <div className="photo-thumb-grid">
            {previews.map((src, i) => (
              <div key={i} className="photo-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Site photo ${i + 1}`} />
                <button
                  type="button"
                  className="photo-thumb-remove"
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
