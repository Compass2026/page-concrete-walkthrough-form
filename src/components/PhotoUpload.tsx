'use client'
import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'
import PhotoAnnotator, { AnnotatedPhoto } from './PhotoAnnotator'

interface PhotoUploadProps {
  /** Array of already-annotated photo objects stored in RHF state */
  photos: AnnotatedPhoto[]
  /** Called with the full updated photos array after each add or remove */
  onChange: (photos: AnnotatedPhoto[]) => void
}

export default function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // URL of the just-uploaded (un-annotated) photo, triggers the annotator modal
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  const MAX_PHOTOS = 20
  const atMax = photos.length >= MAX_PHOTOS

  /* ── Step 1: User picks/captures a photo → compress → upload to storage ── */
  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset so the same file can be re-selected
    e.target.value = ''

    if (atMax) return

    setUploading(true)
    setUploadError(null)

    try {
      // Compress before upload to avoid cellular-network timeouts
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
      })

      const path = `walkthroughs/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

      const { error: uploadErr } = await supabase.storage
        .from('job-photos')
        .upload(path, compressedFile, { upsert: false, contentType: 'image/jpeg' })

      if (uploadErr) throw new Error(uploadErr.message)

      const { data } = supabase.storage.from('job-photos').getPublicUrl(path)

      // Step 2: open annotator on the freshly-uploaded image
      setPendingUrl(data.publicUrl)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  /* ── Step 2: Annotator saves → compress annotated canvas → upload annotated file ── */
  async function handleAnnotationSave(annotatedFile: File, notes: string) {
    if (!pendingUrl) return
    setPendingUrl(null) // close modal immediately

    setUploading(true)
    setUploadError(null)

    try {
      // Compress annotated image as well
      const compressed = await imageCompression(annotatedFile, {
        maxSizeMB: 0.9,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
      })

      const path = `walkthroughs/annotated-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

      const { error: uploadErr } = await supabase.storage
        .from('job-photos')
        .upload(path, compressed, { upsert: false, contentType: 'image/jpeg' })

      if (uploadErr) throw new Error(uploadErr.message)

      const { data } = supabase.storage.from('job-photos').getPublicUrl(path)

      const newPhoto: AnnotatedPhoto = {
        url: data.publicUrl,
        annotation_notes: notes,
      }

      onChange([...photos, newPhoto])
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Annotated upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  /* ── Cancel annotation (discard un-annotated photo) ── */
  function handleAnnotationCancel() {
    setPendingUrl(null)
  }

  /* ── Remove a specific photo by index ── */
  function remove(idx: number) {
    onChange(photos.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Annotation Modal (portal-like, fixed overlay) ── */}
      {pendingUrl && (
        <PhotoAnnotator
          photoUrl={pendingUrl}
          onSave={handleAnnotationSave}
          onCancel={handleAnnotationCancel}
        />
      )}

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
              Processing…
            </span>
          </>
        ) : atMax ? (
          <>
            <span style={{ fontSize: 22 }}>🚫</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)' }}>
              Maximum {MAX_PHOTOS} photos reached
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
                {photos.length > 0
                  ? `${photos.length} / ${MAX_PHOTOS} captured — tap to add more`
                  : 'Tap to open camera · Annotation step will follow'}
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
      {photos.length > 0 && (
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
            {photos.length} / {MAX_PHOTOS} uploaded
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {photos.map((photo, i) => (
              <div
                key={`${photo.url}-${i}`}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  boxShadow: '0 2px 8px rgb(0 0 0 / 0.10)',
                  border: '2px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Thumbnail image */}
                <div style={{ position: 'relative', aspectRatio: '4 / 3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Annotated site photo ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {/* Annotated badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 5,
                      left: 5,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: 'rgba(29,78,216,0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                    }}
                  >
                    ✏️ ANNOTATED
                  </div>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remove photo ${i + 1}`}
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      color: '#fff',
                      fontSize: 15,
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

                {/* Notes preview */}
                <div
                  style={{
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#1d4ed8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 3,
                    }}
                  >
                    Notes
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: '#334155',
                      lineHeight: 1.5,
                      // Clamp to 2 lines
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {photo.annotation_notes}
                  </p>
                </div>
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
