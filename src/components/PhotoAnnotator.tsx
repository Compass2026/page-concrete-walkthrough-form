'use client'
import { useRef, useState, useEffect, useCallback } from 'react'

export interface AnnotatedPhoto {
  url: string
  annotation_notes: string
}

interface PhotoAnnotatorProps {
  /** The public URL of the just-uploaded photo to annotate */
  photoUrl: string
  /** Called when the tech saves the annotated image; receives the new File and their notes */
  onSave: (annotatedFile: File, notes: string) => void
  /** Called if the tech cancels without saving */
  onCancel: () => void
}

export default function PhotoAnnotator({ photoUrl, onSave, onCancel }: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesError, setNotesError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  /* ── Load the photo onto the canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Scale canvas to a sensible display size while preserving aspect ratio
      const MAX_W = Math.min(window.innerWidth - 32, 800)
      const scale = MAX_W / img.naturalWidth
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      // CSS display size
      canvas.style.width = `${MAX_W}px`
      canvas.style.height = `${Math.round(img.naturalHeight * scale)}px`

      ctx.drawImage(img, 0, 0)
      setImageLoaded(true)
    }
    img.onerror = () => {
      // If CORS fails, try without crossOrigin
      const img2 = new Image()
      img2.onload = () => {
        canvas.width = img2.naturalWidth
        canvas.height = img2.naturalHeight
        const MAX_W = Math.min(window.innerWidth - 32, 800)
        const scale = MAX_W / img2.naturalWidth
        canvas.style.width = `${MAX_W}px`
        canvas.style.height = `${Math.round(img2.naturalHeight * scale)}px`
        ctx.drawImage(img2, 0, 0)
        setImageLoaded(true)
      }
      img2.src = photoUrl
    }
    img.src = photoUrl
  }, [photoUrl])

  /* ── Get canvas-space coordinates from a pointer/touch event ── */
  const getPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      // Scale from CSS pixels to canvas pixels
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ('touches' in e) {
        const t = e.touches[0]
        return {
          x: (t.clientX - rect.left) * scaleX,
          y: (t.clientY - rect.top) * scaleY,
        }
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    [],
  )

  /* ── Drawing helpers ── */
  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    setIsDrawing(true)
    lastPos.current = getPos(e)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    if (!isDrawing || !lastPos.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)

    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1d4ed8' // Royal Blue marker
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    lastPos.current = pos
  }

  function endDraw() {
    setIsDrawing(false)
    lastPos.current = null
  }

  /* ── Save: convert canvas → File, call onSave ── */
  async function handleSave() {
    if (!notes.trim()) {
      setNotesError(true)
      document.getElementById('annotation-notes-input')?.focus()
      return
    }
    setNotesError(false)

    const canvas = canvasRef.current!
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const filename = `annotated-${Date.now()}.jpg`
        const file = new File([blob], filename, { type: 'image/jpeg' })
        onSave(file, notes.trim())
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    /* ── Full-screen modal overlay ── */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.92)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        padding: '16px 16px 32px',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1.2,
            }}
          >
            ✏️ Annotate Photo
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#94a3b8' }}>
            Draw with the blue marker, then add notes below.
          </p>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderRadius: 10,
            border: '1px solid #334155',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {/* ── Tool Indicator ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
          padding: '10px 14px',
          borderRadius: 12,
          background: 'rgba(29, 78, 216, 0.18)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#1d4ed8',
            border: '3px solid #60a5fa',
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 700 }}>
          Blue Marker Active — Draw directly on the photo
        </span>
      </div>

      {/* ── Canvas ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 0 0 2px #1d4ed8, 0 8px 32px rgba(0,0,0,0.5)',
          cursor: 'crosshair',
          touchAction: 'none',
          userSelect: 'none',
          marginBottom: 16,
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          justifyContent: 'center',
          background: '#0f172a',
        }}
      >
        {!imageLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 28,
                height: 28,
                border: '3px solid #334155',
                borderTopColor: '#1d4ed8',
                borderRadius: '50%',
                animation: 'ann-spin 0.7s linear infinite',
              }}
            />
          </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          style={{
            display: 'block',
            maxWidth: '100%',
            touchAction: 'none',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      </div>

      {/* ── Annotation Notes (Required) ── */}
      <div style={{ width: '100%', maxWidth: 800, marginBottom: 16 }}>
        <label
          htmlFor="annotation-notes-input"
          style={{
            display: 'block',
            marginBottom: 7,
            fontSize: 13,
            fontWeight: 700,
            color: notesError ? '#f87171' : '#cbd5e1',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Annotation Notes{' '}
          <span style={{ color: '#f87171' }}>*</span>
        </label>
        <textarea
          id="annotation-notes-input"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            if (e.target.value.trim()) setNotesError(false)
          }}
          placeholder="Describe what you marked — e.g. 'Crack running from NE corner, ~8ft long. Existing rebar visible.'"
          rows={3}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px 16px',
            borderRadius: 12,
            border: notesError ? '2px solid #f87171' : '2px solid #334155',
            background: '#0f172a',
            color: '#f1f5f9',
            fontSize: 15,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
            boxShadow: notesError ? '0 0 0 3px rgba(248,113,113,0.2)' : 'none',
          }}
        />
        {notesError && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#f87171', fontWeight: 600 }}>
            ⚠ Annotation notes are required before saving.
          </p>
        )}
      </div>

      {/* ── Save Button ── */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!imageLoaded}
        style={{
          width: '100%',
          maxWidth: 800,
          padding: '17px 24px',
          borderRadius: 14,
          border: 'none',
          background: 'linear-gradient(135deg, #1d3aa4 0%, #1d4ed8 100%)',
          color: '#fff',
          fontSize: 16,
          fontWeight: 800,
          cursor: imageLoaded ? 'pointer' : 'not-allowed',
          opacity: imageLoaded ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: '0 4px 20px rgba(29,78,216,0.4)',
          transition: 'all 0.2s',
          letterSpacing: '0.01em',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Save Annotated Photo
      </button>

      {/* ── Spinner keyframe ── */}
      <style>{`
        @keyframes ann-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
