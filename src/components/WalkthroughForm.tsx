'use client'
import { useForm, Controller } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import PhotoUpload from './PhotoUpload'
import type { AnnotatedPhoto } from './PhotoAnnotator'

/* ── Constant choice arrays ────────────────────────────────── */
const PROJECT_TYPES = [
  { value: 'Concrete',  emoji: '🪨', label: 'Concrete' },
  { value: 'Fencing',   emoji: '🔩', label: 'Fencing'  },
  { value: 'Decking',   emoji: '🪵', label: 'Decking'  },
  { value: 'Other',     emoji: '📋', label: 'Other'    },
] as const

const THICKNESS_OPTIONS = ['4"', '6"', 'Other'] as const
const PSI_OPTIONS        = ['3500', '4000', '5000', 'Unsure'] as const

const DEMO_OPTIONS = [
  { value: 'None',               icon: '✅', title: 'None',               desc: 'No demolition needed' },
  { value: 'Dirt Excavation',    icon: '⛏️', title: 'Dirt Excavation',    desc: 'Soil / grading removal' },
  { value: 'Concrete Tear-out/Haul Away', icon: '🚛', title: 'Tear-out & Haul Away', desc: 'Remove existing concrete' },
] as const

/* ── Types ──────────────────────────────────────────────────── */
type ProjectType = 'Concrete' | 'Fencing' | 'Decking' | 'Other' | ''

interface FormValues {
  // Contact
  first_name: string
  last_name: string
  phone: string
  email: string
  address: string
  street_address: string
  city: string
  state: string
  country: string
  postal_code: string
  // Project
  project_type: ProjectType
  // Concrete-specific
  concrete_sqft: number
  concrete_thickness: string
  concrete_psi: string
  concrete_demo: string
  // Fencing-specific
  fence_linear_feet: number
  fence_height_material: string
  gate_details: string
  // All types
  optional_addons: string
  notes: string
  annotated_photos: AnnotatedPhoto[]
}

const REQUIRED = 'Required'

/* ── Framer motion variants ────────────────────────────────── */
const sectionVariants: Variants = {
  hidden:  { opacity: 0, height: 0, y: -12, scale: 0.98 },
  visible: { opacity: 1, height: 'auto', y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, height: 0, y: -8, scale: 0.98, transition: { duration: 0.25, ease: 'easeInOut' } },
}

/* ── Field wrapper component ──────────────────────────────── */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label className="field-label">{label}</label>
      {children}
      {error && <span className="field-error">⚠ {error}</span>}
    </div>
  )
}

/* ── Section header helper ────────────────────────────────── */
function SectionHeader({ icon, color, title, subtitle }: { icon: string; color: string; title: string; subtitle: string }) {
  return (
    <div className="section-header">
      <span className={`section-header-icon ${color}`}>{icon}</span>
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

/* ── Pill button component ────────────────────────────────── */
function PillButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`pill-btn${active ? ' active' : ''}`} onClick={onClick}>
      {label}
    </button>
  )
}

/* ── Grid card button component ───────────────────────────── */
function GridCard({ icon, title, desc, active, onClick }: { icon: string; title: string; desc: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`grid-card-btn${active ? ' active' : ''}`} onClick={onClick}>
      <span className="card-icon">{icon}</span>
      <span className="card-content">
        <span className="card-title">{title}</span>
        <span className="card-desc">{desc}</span>
      </span>
    </button>
  )
}

/* ── Slider + number input ────────────────────────────────── */
function SliderNumberInput({
  value, onChange, min = 0, max = 2000, step = 10, unit = 'sq ft',
}: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div className="slider-container">
      <div className="slider-row">
        <input
          type="number"
          className="slider-input-number"
          value={value || ''}
          min={min}
          max={max}
          inputMode="numeric"
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <input
          type="range"
          className="slider-range"
          min={min}
          max={max}
          step={step}
          value={value || 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <span className="slider-value-label">
        {value ? `${value.toLocaleString()} ${unit}` : `Slide or type ${unit}`}
      </span>
    </div>
  )
}

/* ── Progress calculator ──────────────────────────────────── */
function calcProgress(values: Partial<FormValues>): number {
  const always = [values.first_name, values.last_name, values.phone, values.street_address, values.city, values.state, values.project_type]
  const alwaysTotal = always.length
  const alwaysFilled = always.filter(Boolean).length

  let sectionFilled = 0
  let sectionTotal = 0

  if (values.project_type === 'Concrete') {
    sectionTotal = 3
    if (values.concrete_sqft) sectionFilled++
    if (values.concrete_thickness) sectionFilled++
    if (values.concrete_psi) sectionFilled++
  } else if (values.project_type === 'Fencing') {
    sectionTotal = 2
    if (values.fence_linear_feet) sectionFilled++
    if (values.fence_height_material) sectionFilled++
  } else if (values.project_type === 'Decking' || values.project_type === 'Other') {
    sectionTotal = 1
    if (values.notes) sectionFilled++
  }

  const photoBonus = (values.annotated_photos?.length ?? 0) > 0 ? 1 : 0
  const total = alwaysTotal + sectionTotal + 1
  const filled = alwaysFilled + sectionFilled + photoBonus
  return Math.min(100, Math.round((filled / total) * 100))
}

/* ═══════════════════════════════════════════════════════════ */
/*  Main Form Component                                        */
/* ═══════════════════════════════════════════════════════════ */
export default function WalkthroughForm() {
  const searchParams = useSearchParams()
  const recordId = searchParams.get('id')

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [initialLoading, setInitialLoading] = useState(!!recordId)

  const {
    register, handleSubmit, watch, control, reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      project_type: '', country: 'United States', annotated_photos: [],
      concrete_sqft: 0, fence_linear_feet: 0,
      concrete_thickness: '', concrete_psi: '', concrete_demo: '',
      fence_height_material: '', gate_details: '',
      optional_addons: '', notes: '',
    },
  })

  const watchedValues = watch()
  const projectType = watchedValues.project_type

  /* ── Pre-fill form when coming from Tech Inbox ──────────── */
  useEffect(() => {
    if (!recordId) return
    ;(async () => {
      const { data, error } = await supabase
        .from('walkthroughs')
        .select(
          'first_name, last_name, phone, email, address, street_address, city, state, country, postal_code, project_type'
        )
        .eq('id', recordId)
        .single()

      if (!error && data) {
        reset({
          first_name:           data.first_name        ?? '',
          last_name:            data.last_name         ?? '',
          phone:                data.phone             ?? '',
          email:                data.email             ?? '',
          address:              data.address           ?? '',
          street_address:       data.street_address    ?? '',
          city:                 data.city              ?? '',
          state:                data.state             ?? '',
          country:              data.country           || 'United States',
          postal_code:          data.postal_code       ?? '',
          project_type:         (data.project_type as FormValues['project_type']) ?? '',
          // Keep spec fields at defaults — tech will fill them in
          concrete_sqft: 0, fence_linear_feet: 0,
          concrete_thickness: '', concrete_psi: '', concrete_demo: '',
          fence_height_material: '', gate_details: '',
          optional_addons: '', notes: '',
          annotated_photos: [],
        })
      }
      setInitialLoading(false)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId])

  useEffect(() => {
    setProgress(calcProgress(watchedValues))
  }, [watchedValues])

  /* ── Build project_details JSON ──────────────────────────── */
  function buildProjectDetails(data: FormValues): Record<string, unknown> {
    const details: Record<string, unknown> = { project_type: data.project_type }

    if (data.project_type === 'Concrete') {
      if (data.concrete_sqft)      details.concrete_sqft = data.concrete_sqft
      if (data.concrete_thickness) details.concrete_thickness = data.concrete_thickness
      if (data.concrete_psi)       details.concrete_psi = data.concrete_psi
      if (data.concrete_demo)      details.concrete_demo = data.concrete_demo
    }

    if (data.project_type === 'Fencing') {
      if (data.fence_linear_feet)    details.fence_linear_feet = data.fence_linear_feet
      if (data.fence_height_material) details.fence_height_material = data.fence_height_material
      if (data.gate_details)         details.gate_details = data.gate_details
    }

    if (data.optional_addons) details.optional_addons = data.optional_addons

    return details
  }

  /* ── Submit handler ─────────────────────────────────────── */
  const onSubmit = async (data: FormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const annotated_photos = (data.annotated_photos ?? []).map((p) => ({
        url: p.url,
        annotation_notes: p.annotation_notes,
      }))
      const original_photos = (data.annotated_photos ?? [])
        .map((p) => p.original_url)
        .filter((u): u is string => Boolean(u))
      const project_details = buildProjectDetails(data)

      const payload: Record<string, unknown> = {
        first_name:       data.first_name,
        last_name:        data.last_name,
        phone:            data.phone,
        email:            data.email            || null,
        address:          data.address          || null,
        street_address:   data.street_address,
        city:             data.city,
        state:            data.state,
        country:          data.country          || 'United States',
        postal_code:      data.postal_code      || null,
        project_type:     data.project_type,
        project_details,
        notes:            data.notes            || null,
        annotated_photos,
        original_photos,
        status:           'completed',
      }

      let dbError
      if (recordId) {
        // UPDATE the existing pending row
        ;({ error: dbError } = await supabase
          .from('walkthroughs')
          .update(payload)
          .eq('id', recordId))
      } else {
        // INSERT a brand-new record
        ;({ error: dbError } = await supabase
          .from('walkthroughs')
          .insert([payload]))
      }
      if (dbError) throw new Error(dbError.message)

      setSuccess(true)
      reset()
      setProgress(0)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Loading Screen (initial pre-fill fetch) ─────────────── */
  if (initialLoading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>Loading job details…</p>
        </div>
      </div>
    )
  }

  /* ── Success Screen ─────────────────────────────────────── */
  if (success) {
    return (
      <div className="app-shell">
        <div className="success-screen">
          <div className="success-icon-ring">✅</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#166534' }}>
              {recordId ? 'Walkthrough Completed!' : 'Walkthrough Saved!'}
            </h2>
            <p style={{ margin: 0, color: '#15803d', fontSize: 15, lineHeight: 1.5 }}>
              {recordId
                ? 'The job has been marked as completed and all data saved to the system.'
                : 'The job site data has been submitted successfully and saved to the system.'}
            </p>
          </div>
          <button onClick={() => setSuccess(false)} className="btn-submit" style={{ maxWidth: 300 }}>
            <span>+ New Walkthrough</span>
          </button>
        </div>
      </div>
    )
  }

  /* ── Main Form ──────────────────────────────────────────── */
  return (
    <div className="app-shell">

      {/* ── Sticky Header ───────────────────────────────── */}
      <AppHeader progress={progress} />

      {/* ── Scrollable Form Body ────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
      <div className="form-body">

          {/* ── 1. Contact Information ────────────────── */}
          <section className="form-card">
            <SectionHeader icon="👤" color="blue" title="Contact Information" subtitle="Client details for this walkthrough" />
            <div className="section-body">
              <div className="grid-2">
                <Field label="First Name *" error={errors.first_name?.message}>
                  <input className={`field-input${errors.first_name ? ' error' : ''}`} placeholder="Jane" autoComplete="given-name" {...register('first_name', { required: REQUIRED })} />
                </Field>
                <Field label="Last Name *" error={errors.last_name?.message}>
                  <input className={`field-input${errors.last_name ? ' error' : ''}`} placeholder="Smith" autoComplete="family-name" {...register('last_name', { required: REQUIRED })} />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="Phone *" error={errors.phone?.message}>
                  <input className={`field-input${errors.phone ? ' error' : ''}`} placeholder="(555) 000-0000" type="tel" autoComplete="tel" inputMode="tel" {...register('phone', { required: REQUIRED })} />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <input className="field-input" placeholder="jane@example.com" type="email" autoComplete="email" inputMode="email" {...register('email')} />
                </Field>
              </div>
              <Field label="Address Line 2 (Apt, Suite…)">
                <input className="field-input" placeholder="Apt 4B, Suite 100, etc." autoComplete="address-line2" {...register('address')} />
              </Field>
              <Field label="Street Address *" error={errors.street_address?.message}>
                <input className={`field-input${errors.street_address ? ' error' : ''}`} placeholder="123 Main St" autoComplete="street-address" {...register('street_address', { required: REQUIRED })} />
              </Field>
              <div className="grid-2">
                <Field label="City *" error={errors.city?.message}>
                  <input className={`field-input${errors.city ? ' error' : ''}`} placeholder="Dallas" autoComplete="address-level2" {...register('city', { required: REQUIRED })} />
                </Field>
                <Field label="State *" error={errors.state?.message}>
                  <input className={`field-input${errors.state ? ' error' : ''}`} placeholder="TX" autoComplete="address-level1" {...register('state', { required: REQUIRED })} />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="Country">
                  <input className="field-input" placeholder="United States" autoComplete="country-name" {...register('country')} />
                </Field>
                <Field label="Postal Code">
                  <input className="field-input" placeholder="75201" autoComplete="postal-code" inputMode="numeric" {...register('postal_code')} />
                </Field>
              </div>
            </div>
          </section>

          {/* ── 2. Project Type (pill-style cards) ──────── */}
          <section className="form-card">
            <SectionHeader icon="🏗️" color="amber" title="Project Type" subtitle="Tap to select the type of work being quoted" />
            <div className="section-body">
              <Controller
                name="project_type"
                control={control}
                rules={{ required: 'Please select a project type' }}
                render={({ field }) => (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {PROJECT_TYPES.map(({ value, emoji, label }) => {
                      const active = field.value === value
                      return (
                        <label key={value} style={{ position: 'relative', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                          <input type="radio" value={value} checked={active} onChange={() => field.onChange(value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                          <span style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
                            padding: '18px 10px',
                            background: active ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'var(--bg-input)',
                            border: active ? '2px solid #1d3aa4' : '2px solid var(--border)',
                            borderRadius: 14, textAlign: 'center', minHeight: 90, userSelect: 'none',
                            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: active ? '0 0 0 3px rgb(29 58 164 / 0.15)' : 'none',
                            transform: active ? 'scale(1.02)' : 'scale(1)',
                          }}>
                            <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: active ? '#1d3aa4' : 'var(--text-secondary)' }}>{label}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              />
              {errors.project_type && (
                <span className="field-error" style={{ marginTop: 8 }}>⚠ {errors.project_type.message}</span>
              )}
            </div>
          </section>

          {/* ── 3. CONDITIONAL SECTIONS ────────────────── */}
          <AnimatePresence mode="wait">

            {/* ── Concrete Details ──────────────────────── */}
            {projectType === 'Concrete' && (
              <motion.section key="concrete" className="form-card" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" style={{ overflow: 'hidden' }}>
                <SectionHeader icon="🪨" color="slate" title="Concrete Details" subtitle="Specifications for the concrete work" />
                <div className="section-body">

                  {/* Square Footage — Slider + Number */}
                  <Field label="Total Square Feet">
                    <Controller
                      name="concrete_sqft"
                      control={control}
                      render={({ field }) => (
                        <SliderNumberInput value={field.value} onChange={field.onChange} min={0} max={5000} step={25} unit="sq ft" />
                      )}
                    />
                  </Field>

                  {/* Thickness — Pill Buttons */}
                  <Field label="Thickness">
                    <Controller
                      name="concrete_thickness"
                      control={control}
                      render={({ field }) => (
                        <div className="pill-group">
                          {THICKNESS_OPTIONS.map((opt) => (
                            <PillButton key={opt} label={opt} active={field.value === opt} onClick={() => field.onChange(opt)} />
                          ))}
                        </div>
                      )}
                    />
                  </Field>

                  {/* PSI — Pill Buttons */}
                  <Field label="Concrete PSI">
                    <Controller
                      name="concrete_psi"
                      control={control}
                      render={({ field }) => (
                        <div className="pill-group">
                          {PSI_OPTIONS.map((opt) => (
                            <PillButton key={opt} label={opt} active={field.value === opt} onClick={() => field.onChange(opt)} />
                          ))}
                        </div>
                      )}
                    />
                  </Field>

                  {/* Demo Type — Grid Cards */}
                  <Field label="Demolition Type">
                    <Controller
                      name="concrete_demo"
                      control={control}
                      render={({ field }) => (
                        <div className="grid-card-group">
                          {DEMO_OPTIONS.map((opt) => (
                            <GridCard
                              key={opt.value}
                              icon={opt.icon}
                              title={opt.title}
                              desc={opt.desc}
                              active={field.value === opt.value}
                              onClick={() => field.onChange(opt.value)}
                            />
                          ))}
                        </div>
                      )}
                    />
                  </Field>
                </div>
              </motion.section>
            )}

            {/* ── Fencing Details ───────────────────────── */}
            {projectType === 'Fencing' && (
              <motion.section key="fencing" className="form-card" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" style={{ overflow: 'hidden' }}>
                <SectionHeader icon="🔩" color="rose" title="Fencing Details" subtitle="Specifications for the fence installation" />
                <div className="section-body">

                  {/* Linear Feet — Slider + Number */}
                  <Field label="Total Linear Feet">
                    <Controller
                      name="fence_linear_feet"
                      control={control}
                      render={({ field }) => (
                        <SliderNumberInput value={field.value} onChange={field.onChange} min={0} max={1000} step={5} unit="linear ft" />
                      )}
                    />
                  </Field>

                  {/* Height & Material */}
                  <Field label="Height & Material">
                    <input className="field-input" placeholder="e.g. 6ft Cedar Privacy, 4ft Chain Link…" {...register('fence_height_material')} />
                  </Field>

                  {/* Gate Details */}
                  <Field label="Gate Details">
                    <input className="field-input" placeholder="e.g. Single walk gate, Double drive gate…" {...register('gate_details')} />
                  </Field>
                </div>
              </motion.section>
            )}

            {/* ── Decking Details ───────────────────────── */}
            {projectType === 'Decking' && (
              <motion.section key="decking" className="form-card" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" style={{ overflow: 'hidden' }}>
                <SectionHeader icon="🪵" color="green" title="Decking Details" subtitle="Describe the deck build requirements" />
                <div className="section-body">
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Please include all deck specifications, dimensions, materials, and any special requirements in the <strong>Notes</strong> section below.
                  </p>
                </div>
              </motion.section>
            )}

            {/* ── Other Details ─────────────────────────── */}
            {projectType === 'Other' && (
              <motion.section key="other" className="form-card" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" style={{ overflow: 'hidden' }}>
                <SectionHeader icon="📋" color="violet" title="Other Project" subtitle="Describe the project requirements" />
                <div className="section-body">
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Please provide all project details, specifications, and requirements in the <strong>Notes</strong> and <strong>Add-Ons</strong> sections below.
                  </p>
                </div>
              </motion.section>
            )}

          </AnimatePresence>

          {/* ── 4. Add-Ons & Notes (All Types) ─────────── */}
          <section className="form-card">
            <SectionHeader icon="💡" color="emerald" title="Add-Ons & Notes" subtitle="Upsell opportunities and additional context" />
            <div className="section-body">
              <Field label="Optional Add-Ons / Upsells">
                <textarea
                  className="field-textarea"
                  placeholder="e.g. Sealing, staining, decorative borders, lighting, post caps…"
                  rows={3}
                  {...register('optional_addons')}
                />
              </Field>
              <Field label="Notes">
                <textarea
                  className="field-textarea"
                  placeholder="Any additional notes about the job site, client requests, or special requirements…"
                  rows={4}
                  {...register('notes')}
                />
              </Field>
            </div>
          </section>

          {/* ── 5. Job Site Photos + Annotation ──────── */}
          <section className="form-card">
            <SectionHeader icon="📸" color="cyan" title="Job Site Photos" subtitle="Capture photos · Blue marker annotation step follows automatically" />
            <div className="section-body" style={{ paddingBottom: 18 }}>
              <Controller
                name="annotated_photos"
                control={control}
                render={({ field }) => (
                  <PhotoUpload photos={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </div>
          </section>

          {/* ── Error Banner ──────────────────────────── */}
          {submitError && (
            <div className="error-banner">
              <span style={{ fontSize: 18, flexShrink: 0 }}>❌</span>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#991b1b', fontSize: 14 }}>Submission Failed</p>
                <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{submitError}</p>
              </div>
            </div>
          )}

        </div>{/* end .form-body */}

        {/* ── Sticky Submit Bar ─────────────────────────── */}
        <div className="sticky-submit-bar">
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" />
                {recordId ? 'Completing Job…' : 'Saving Walkthrough…'}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {recordId ? 'Complete Job' : 'Submit Walkthrough'}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}

/* ─── App Header Component ──────────────────────────────────── */
function AppHeader({ progress }: { progress: number }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Logo */}
        <div className="header-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pageconcretenewlogo.png"
            alt="Page Concrete logo"
            className="w-auto h-24 mx-auto object-contain mb-6"
          />
        </div>

        {/* Date badge */}
        <span className="header-badge">
          {new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </header>
  )
}
