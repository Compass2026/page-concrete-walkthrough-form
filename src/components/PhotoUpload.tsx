'use client'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PhotoUploadProps {
  /** Array of already-uploaded public URLs stored in RHF state */
  urls: string[]
  /** Called with the full updated URLs array after each add or remove */
  onChange: (urls: string[]) => void
}

export default function PhotoUpload({ urls, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const atMax = urls.length >= 10

  /* ── Triggered the instant the user confirms a captured photo ── */
  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset the input so the same file can be re-selected if needed
    e.target.value = ''

    if (atMax) return

    setUploading(true)
    setUploadError(null)

    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `walkthroughs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('job-photos')
        .upload(path, file, { upsert: false, contentType: file.type })

      if (uploadErr) throw new Error(uploadErr.message)

      const { data } = supabase.storage.from('job-photos').getPublicUrl(path)
      onChange([...urls, data.publicUrl])
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  /* ── Remove a specific photo by index ── */
  function remove(idx: number) {
    onChange(urls.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Hidden camera input ── */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCapture}
      />

      {/* ── Large "Add Photo" button ── */}
      <button
        type="button"
        disabled={uploading || atMax}
        onClick={() => inputRef.current?.click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          padding: '18px 24px',
          borderRadius: 16,
          border: atMax ? '2px dashed var(--border)' : '2px dashed #2563eb',
          background: atMax
            ? 'var(--bg-input)'
            : uploading
            ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          cursor: atMax ? 'not-allowed' : uploading ? 'wait' : 'pointer',
          opacity: atMax ? 0.55 : 1,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
          boxShadow: uploading ? '0 0 0 3px rgb(37 99 235 / 0.2)' : 'none',
        }}
      >
        {uploading ? (
          <>
            {/* ── Spinner ── */}
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                border: '3px solid #93c5fd',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'photo-spin 0.7s linear infinite',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1d4ed8' }}>
              Uploading…
            </span>
          </>
        ) : atMax ? (
          <>
            <span style={{ fontSize: 22 }}>🚫</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)' }}>
              Maximum 10 photos reached
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 26 }}>📸</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>
                Add Photo
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#3b82f6', fontWeight: 500 }}>
                {urls.length > 0
                  ? `${urls.length} / 10 captured — tap to add more`
                  : 'Tap to open camera'}
              </p>
            </div>
          </>
        )}
      </button>

      {/* ── Upload error ── */}
      {uploadError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
          }}
        >
          <span style={{ fontSize: 16 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
            {uploadError}
          </p>
        </div>
      )}

      {/* ── Thumbnail grid ── */}
      {urls.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 10px',
            }}
          >
            {urls.length} / 10 uploaded
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
            }}
          >
            {urls.map((src, i) => (
              <div
                key={src}
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  boxShadow: '0 2px 8px rgb(0 0 0 / 0.10)',
                  border: '2px solid #e2e8f0',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Site photo ${i + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* ── Delete button ── */}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    padding: 0,
                    transition: 'background 0.15s',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Spinner keyframe ── */}
      <style>{`
        @keyframes photo-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
