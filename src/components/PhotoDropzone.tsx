'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface PhotoDropzoneProps {
  files: File[]
  onChange: (files: File[]) => void
}

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
    (accepted: File[]) => {
      const remaining = 10 - files.length
      if (remaining <= 0) return
      const added = accepted.slice(0, remaining)
      const newFiles = [...files, ...added]
      onChange(newFiles)
      const newUrls = added.map((f) => URL.createObjectURL(f))
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
    maxFiles: 10,
    disabled: files.length >= 10,
  })

  const atMax = files.length >= 10

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
              Maximum 10 photos reached
            </p>
          ) : (
            <>
              <p style={{ fontWeight: 700, color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>
                Tap to add photos
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                JPG · PNG · HEIC · WEBP · Up to 10 images
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
            {files.length} / 10 selected
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
