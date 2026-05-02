'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  User, Phone, Mail, MapPin, Briefcase, FileText,
  CheckCircle, AlertCircle, X, ChevronDown, Loader2,
  ClipboardList,
} from 'lucide-react'

/* ─── US States ─────────────────────────────────────────────── */
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

/* ─── Project Types ──────────────────────────────────────────── */
const PROJECT_TYPES = [
  { value: 'Concrete',   emoji: '🪨', label: 'Concrete',   desc: 'Driveways, patios, foundations' },
  { value: 'Deck',       emoji: '🪵', label: 'Deck',        desc: 'Wood, composite, or Trex builds' },
  { value: 'Fence',      emoji: '🔩', label: 'Fence',       desc: 'Privacy, chain-link, ornamental' },
  { value: 'Commercial', emoji: '🏗️', label: 'Commercial',  desc: 'Large-scale commercial projects' },
] as const

type ProjectType = 'Concrete' | 'Deck' | 'Fence' | 'Commercial' | ''

/* ─── Assigned Owners ─────────────────────────────────────────── */
const OWNERS = ['Ann Marie Page', 'Derek Page', 'Drew Valles', 'Unassigned']

/* ─── Form Values ─────────────────────────────────────────────── */
interface IntakeFormValues {
  first_name:     string
  last_name:      string
  phone:          string
  email:          string
  street_address: string
  city:           string
  state:          string
  postal_code:    string
  assigned_owner: string
  project_type:   ProjectType
  notes:          string
}

/* ─── Toast ───────────────────────────────────────────────────── */
interface ToastState {
  type: 'success' | 'error'
  message: string
}

/* ─── Sub-components ──────────────────────────────────────────── */
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      paddingBottom: 16, borderBottom: '1px solid #e2e8f0', marginBottom: 20,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'linear-gradient(135deg, #1d3aa4 0%, #2563eb 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{
        fontSize: 12, fontWeight: 700, color: '#475569',
        letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
          >
            <AlertCircle size={12} /> {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 14px',
  background: hasError ? '#fff5f5' : '#f8fafc',
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
  borderRadius: 10, fontSize: 14, color: '#0f172a', fontWeight: 500,
  outline: 'none', transition: 'all 0.15s ease', fontFamily: 'inherit',
})

const selectStyle = (hasError?: boolean): React.CSSProperties => ({
  ...inputStyle(hasError),
  paddingRight: 36, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
})

/* ═══════════════════════════════════════════════════════════════ */
/*  PAGE COMPONENT                                                 */
/* ═══════════════════════════════════════════════════════════════ */
export default function IntakePage() {
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const {
    register, handleSubmit, control, reset,
    formState: { errors },
  } = useForm<IntakeFormValues>({
    defaultValues: {
      first_name: '', last_name: '', phone: '', email: '',
      street_address: '', city: '', state: '', postal_code: '',
      assigned_owner: 'Unassigned', project_type: '', notes: '',
    },
  })

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  /* Focus style helper */
  const onFocus = (name: string) => setFocusedField(name)
  const onBlur  = () => setFocusedField(null)

  const dynInputStyle = (name: string, hasError?: boolean): React.CSSProperties => ({
    ...inputStyle(hasError),
    borderColor: hasError ? '#fca5a5' : focusedField === name ? '#1d3aa4' : '#e2e8f0',
    background:  focusedField === name ? '#ffffff' : hasError ? '#fff5f5' : '#f8fafc',
    boxShadow:   focusedField === name && !hasError ? '0 0 0 3px rgb(29 58 164 / 0.12)' : 'none',
  })

  const dynSelectStyle = (name: string, hasError?: boolean): React.CSSProperties => ({
    ...selectStyle(hasError),
    borderColor: hasError ? '#fca5a5' : focusedField === name ? '#1d3aa4' : '#e2e8f0',
    background:  focusedField === name ? '#ffffff' : hasError ? '#fff5f5' : '#f8fafc',
    boxShadow:   focusedField === name && !hasError ? '0 0 0 3px rgb(29 58 164 / 0.12)' : 'none',
  })

  /* ── Submit ─────────────────────────────────────────────────── */
  const onSubmit = async (data: IntakeFormValues) => {
    setSubmitting(true)
    try {
      const { data: inserted, error } = await supabase.from('walkthroughs').insert([{
        first_name:     data.first_name,
        last_name:      data.last_name,
        phone:          data.phone,
        email:          data.email    || null,
        street_address: data.street_address,
        city:           data.city,
        state:          data.state,
        postal_code:    data.postal_code || null,
        project_type:   data.project_type,
        notes:          data.notes    || null,
        status:         'pending',
        project_details: {
          assigned_owner: data.assigned_owner,
          project_type:   data.project_type,
        },
      }]).select('id').single()

      if (error) throw new Error(error.message)

      const supabaseId = inserted?.id ?? null

      // Fire-and-forget webhook — does NOT block the success toast
      fetch(
        'https://services.leadconnectorhq.com/hooks/PLTocizoauUvHMW47HiN/webhook-trigger/a3d45aaa-3e30-410c-b08d-412b1af806e5',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id:             supabaseId,
            first_name:     data.first_name,
            last_name:      data.last_name,
            phone:          data.phone,
            email:          data.email    || null,
            street:         data.street_address,
            city:           data.city,
            state:          data.state,
            zip:            data.postal_code || null,
            assigned_owner: data.assigned_owner,
            project_type:   data.project_type,
            notes:          data.notes    || null,
          }),
        }
      ).catch(() => { /* silent — webhook errors never surface to the user */ })

      reset()
      setToast({ type: 'success', message: `Lead for ${data.first_name} ${data.last_name} added successfully!` })
    } catch (err: unknown) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 16px 60px', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* ── Toast ───────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
              zIndex: 1000, minWidth: 340, maxWidth: 480,
              background: toast.type === 'success' ? '#f0fdf4' : '#fff5f5',
              border: `1.5px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ color: toast.type === 'success' ? '#16a34a' : '#dc2626', flexShrink: 0, marginTop: 1 }}>
              {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: toast.type === 'success' ? '#166534' : '#991b1b', lineHeight: 1.4, flex: 1 }}>
              {toast.message}
            </p>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, flexShrink: 0 }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form Card ───────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 768 }}>

        {/* Back to Command Center */}
        <div style={{ marginBottom: 20 }}>
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            ← Command Center
          </a>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pageconcretenewlogo.png" alt="Page Concrete" style={{ height: 56, width: 'auto', objectFit: 'contain', marginBottom: 16 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #1d3aa4, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ClipboardList size={20} color="#fff" />
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Lead Intake Form
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
            Internal use only — Page Concrete & Outdoor Services
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Section 1: Lead Details ───────────────────────── */}
            <div style={cardStyle}>
              <SectionLabel icon={<User size={15} />} label="Lead Details" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="First Name" required error={errors.first_name?.message}>
                  <input
                    {...register('first_name', { required: 'Required' })}
                    placeholder="Jane"
                    style={dynInputStyle('first_name', !!errors.first_name)}
                    onFocus={() => onFocus('first_name')} onBlur={onBlur}
                  />
                </Field>
                <Field label="Last Name" required error={errors.last_name?.message}>
                  <input
                    {...register('last_name', { required: 'Required' })}
                    placeholder="Smith"
                    style={dynInputStyle('last_name', !!errors.last_name)}
                    onFocus={() => onFocus('last_name')} onBlur={onBlur}
                  />
                </Field>
                <Field label="Phone" required error={errors.phone?.message}>
                  <input
                    {...register('phone', {
                      required: 'Required',
                      pattern: { value: /^\+?[\d\s\-()+]{7,}$/, message: 'Invalid phone number' },
                    })}
                    type="tel" placeholder="(555) 000-0000"
                    style={dynInputStyle('phone', !!errors.phone)}
                    onFocus={() => onFocus('phone')} onBlur={onBlur}
                  />
                </Field>
                <Field label="Email" required error={errors.email?.message}>
                  <input
                    {...register('email', {
                      required: 'Required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                    })}
                    type="email" placeholder="jane@example.com"
                    style={dynInputStyle('email', !!errors.email)}
                    onFocus={() => onFocus('email')} onBlur={onBlur}
                  />
                </Field>
              </div>
            </div>

            {/* ── Section 2: Project Location ───────────────────── */}
            <div style={cardStyle}>
              <SectionLabel icon={<MapPin size={15} />} label="Project Location" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Street Address" required error={errors.street_address?.message}>
                  <input
                    {...register('street_address', { required: 'Required' })}
                    placeholder="123 Main Street"
                    style={dynInputStyle('street_address', !!errors.street_address)}
                    onFocus={() => onFocus('street_address')} onBlur={onBlur}
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
                  <Field label="City" required error={errors.city?.message}>
                    <input
                      {...register('city', { required: 'Required' })}
                      placeholder="Dallas"
                      style={dynInputStyle('city', !!errors.city)}
                      onFocus={() => onFocus('city')} onBlur={onBlur}
                    />
                  </Field>
                  <Field label="State" required error={errors.state?.message}>
                    <div style={{ position: 'relative' }}>
                      <select
                        {...register('state', { required: 'Required' })}
                        style={dynSelectStyle('state', !!errors.state)}
                        onFocus={() => onFocus('state')} onBlur={onBlur}
                      >
                        <option value="">—</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    </div>
                  </Field>
                  <Field label="Postal Code" error={errors.postal_code?.message}>
                    <input
                      {...register('postal_code')}
                      placeholder="75201"
                      style={dynInputStyle('postal_code', !!errors.postal_code)}
                      onFocus={() => onFocus('postal_code')} onBlur={onBlur}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── Section 3: Project Details ────────────────────── */}
            <div style={cardStyle}>
              <SectionLabel icon={<Briefcase size={15} />} label="Project Details" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Assigned Owner */}
                <Field label="Assigned Owner" required error={errors.assigned_owner?.message}>
                  <div style={{ position: 'relative' }}>
                    <select
                      {...register('assigned_owner', { required: 'Required' })}
                      style={dynSelectStyle('assigned_owner', !!errors.assigned_owner)}
                      onFocus={() => onFocus('assigned_owner')} onBlur={onBlur}
                    >
                      {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
                </Field>

                {/* Project Type — UI Cards */}
                <Field label="Project Type" required error={errors.project_type?.message}>
                  <Controller
                    name="project_type"
                    control={control}
                    rules={{ required: 'Please select a project type' }}
                    render={({ field }) => (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 4 }}>
                        {PROJECT_TYPES.map(({ value, emoji, label, desc }) => {
                          const active = field.value === value
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                gap: 6, padding: '16px 16px',
                                background: active
                                  ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                                  : '#f8fafc',
                                border: `2px solid ${active ? '#1d3aa4' : '#e2e8f0'}`,
                                borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: active ? '0 0 0 3px rgb(29 58 164 / 0.12)' : 'none',
                                transform: active ? 'scale(1.02)' : 'scale(1)',
                              }}
                            >
                              <span style={{ fontSize: 26, lineHeight: 1 }}>{emoji}</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: active ? '#1d3aa4' : '#334155' }}>
                                {label}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 500, color: active ? '#3b82f6' : '#94a3b8', lineHeight: 1.3 }}>
                                {desc}
                              </span>
                              {active && (
                                <div style={{
                                  position: 'absolute', top: 10, right: 10,
                                  width: 18, height: 18, borderRadius: '50%',
                                  background: '#1d3aa4',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <CheckCircle size={12} color="#fff" />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  />
                </Field>

                {/* Notes */}
                <Field label="Notes" error={errors.notes?.message}>
                  <div style={{ position: 'relative' }}>
                    <FileText size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8', pointerEvents: 'none' }} />
                    <textarea
                      {...register('notes')}
                      rows={4}
                      placeholder="Any additional context about this lead — how they found us, urgency, scope notes, etc."
                      style={{
                        ...dynInputStyle('notes'),
                        paddingLeft: 34, resize: 'vertical', minHeight: 100,
                      }}
                      onFocus={() => onFocus('notes')} onBlur={onBlur}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* ── Submit Button ─────────────────────────────────── */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? {} : { translateY: -2, boxShadow: '0 12px 32px rgb(29 58 164 / 0.5)' }}
              whileTap={submitting ? {} : { scale: 0.98 }}
              style={{
                width: '100%', padding: '16px 24px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1d3aa4 100%)',
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 20px rgb(29 58 164 / 0.4)',
                opacity: submitting ? 0.8 : 1,
                transition: 'opacity 0.2s ease',
                fontFamily: 'inherit',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
                  Submitting Lead…
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Submit Lead
                </>
              )}
            </motion.button>

          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #94a3b8; }
        select option { background: #fff; color: #0f172a; }
        button:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}

/* ─── Card style ──────────────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: '24px 28px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  position: 'relative',
}
