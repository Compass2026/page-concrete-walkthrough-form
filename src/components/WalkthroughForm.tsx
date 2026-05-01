'use client'
import { useForm, Controller } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PhotoUpload from './PhotoUpload'

/* ── Types ──────────────────────────────────────────────────── */
type ProjectType = 'Concrete' | 'Deck' | 'Fence' | 'Commercial' | ''

interface FormValues {
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
  project_type: ProjectType
  // Concrete
  concrete_type: string
  concrete_total_sq_ft: string
  concrete_psi: string
  number_of_steps: string
  step_width: string
  step_height: string
  step_tread_depth: string
  platform_size_sq_ft: string
  // Deck
  deck_size_sq_ft: string
  deck_height: string
  deck_stairs_needed: string
  deck_railings_needed: string
  // Fence
  fence_length_linear_ft: string
  fence_type: string
  fence_height: string
  fence_gate_needed: string
  // Logistics
  demo_required: string
  difficult_to_access: string
  haul_off_away: string
  notes: string
  // Photos (stored as public URLs after auto-upload)
  job_photos: string[]
}

const REQUIRED = 'Required'

/* ── Field wrapper component ──────────────────────────────── */
function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label className="field-label">{label}</label>
      {children}
      {error && <span className="field-error">⚠ {error}</span>}
    </div>
  )
}

/* ── Section header helper ────────────────────────────────── */
function SectionHeader({
  icon,
  color,
  title,
  subtitle,
}: {
  icon: string
  color: string
  title: string
  subtitle: string
}) {
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

/* ── Progress calculator ──────────────────────────────────── */
function calcProgress(values: Partial<FormValues>): number {
  const always = [
    values.first_name, values.last_name, values.phone,
    values.street_address, values.city, values.state,
    values.project_type,
  ]
  const alwaysTotal = always.length
  const alwaysFilled = always.filter(Boolean).length

  // section fills
  let sectionFilled = 0
  let sectionTotal = 0

  if (values.project_type === 'Concrete') {
    sectionTotal = 3
    if (values.concrete_type) sectionFilled++
    if (values.concrete_total_sq_ft) sectionFilled++
    if (values.concrete_psi) sectionFilled++
  } else if (values.project_type === 'Deck') {
    sectionTotal = 2
    if (values.deck_size_sq_ft) sectionFilled++
    if (values.deck_height) sectionFilled++
  } else if (values.project_type === 'Fence') {
    sectionTotal = 3
    if (values.fence_length_linear_ft) sectionFilled++
    if (values.fence_type) sectionFilled++
    if (values.fence_height) sectionFilled++
  }

  // logistics
  const logistics = [values.demo_required, values.difficult_to_access, values.haul_off_away]
  const logisticsTotal = logistics.length
  const logisticsFilled = logistics.filter(Boolean).length

  // photos optional bonus
  const photoBonus = (values.job_photos?.length ?? 0) > 0 ? 1 : 0
  const total = alwaysTotal + sectionTotal + logisticsTotal + 1
  const filled = alwaysFilled + sectionFilled + logisticsFilled + photoBonus
  return Math.min(100, Math.round((filled / total) * 100))
}

/* ═══════════════════════════════════════════════════════════ */
/*  Main Form Component                                        */
/* ═══════════════════════════════════════════════════════════ */
export default function WalkthroughForm() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { project_type: '', country: 'United States', job_photos: [] },
  })

  const watchedValues = watch()
  const projectType = watchedValues.project_type

  // Recalculate progress whenever form values change
  useEffect(() => {
    setProgress(calcProgress(watchedValues))
  }, [watchedValues])


  /* ── Submit handler ─────────────────────────────────────── */
  const onSubmit = async (data: FormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      // Photos are already uploaded — just grab the URL array from RHF state
      const job_photos = data.job_photos ?? []

      const payload: Record<string, unknown> = {
        first_name:          data.first_name,
        last_name:           data.last_name,
        phone:               data.phone,
        email:               data.email              || null,
        address:             data.address            || null,
        street_address:      data.street_address,
        city:                data.city,
        state:               data.state,
        country:             data.country            || 'United States',
        postal_code:         data.postal_code        || null,
        project_type:        data.project_type,
        demo_required:       data.demo_required      || null,
        difficult_to_access: data.difficult_to_access || null,
        haul_off_away:       data.haul_off_away      || null,
        notes:               data.notes              || null,
        job_photos,
      }

      if (data.project_type === 'Concrete') {
        Object.assign(payload, {
          concrete_type:        data.concrete_type       || null,
          concrete_total_sq_ft: data.concrete_total_sq_ft  ? Number(data.concrete_total_sq_ft)  : null,
          concrete_psi:         data.concrete_psi         ? Number(data.concrete_psi)            : null,
          number_of_steps:      data.number_of_steps      ? Number(data.number_of_steps)         : null,
          step_width:           data.step_width            ? Number(data.step_width)              : null,
          step_height:          data.step_height           ? Number(data.step_height)             : null,
          step_tread_depth:     data.step_tread_depth      ? Number(data.step_tread_depth)        : null,
          platform_size_sq_ft:  data.platform_size_sq_ft   ? Number(data.platform_size_sq_ft)    : null,
        })
      }

      if (data.project_type === 'Deck') {
        Object.assign(payload, {
          deck_size_sq_ft:     data.deck_size_sq_ft     ? Number(data.deck_size_sq_ft) : null,
          deck_height:         data.deck_height          || null,
          deck_stairs_needed:  data.deck_stairs_needed   || null,
          deck_railings_needed:data.deck_railings_needed || null,
        })
      }

      if (data.project_type === 'Fence') {
        Object.assign(payload, {
          fence_length_linear_ft: data.fence_length_linear_ft ? Number(data.fence_length_linear_ft) : null,
          fence_type:             data.fence_type              || null,
          fence_height:           data.fence_height            ? Number(data.fence_height)           : null,
          fence_gate_needed:      data.fence_gate_needed       || null,
        })
      }

      const { error: dbError } = await supabase.from('walkthroughs').insert([payload])
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

  /* ── Success Screen ─────────────────────────────────────── */
  if (success) {
    return (
      <div className="app-shell">
        <div className="success-screen">
          <div className="success-icon-ring">✅</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#166534' }}>
              Walkthrough Saved!
            </h2>
            <p style={{ margin: 0, color: '#15803d', fontSize: 15, lineHeight: 1.5 }}>
              The job site data has been submitted successfully and saved to the system.
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="btn-submit"
            style={{ maxWidth: 300 }}
          >
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
            <SectionHeader
              icon="👤"
              color="blue"
              title="Contact Information"
              subtitle="Client details for this walkthrough"
            />
            <div className="section-body">
              <div className="grid-2">
                <Field label="First Name *" error={errors.first_name?.message}>
                  <input
                    className={`field-input${errors.first_name ? ' error' : ''}`}
                    placeholder="Jane"
                    autoComplete="given-name"
                    {...register('first_name', { required: REQUIRED })}
                  />
                </Field>
                <Field label="Last Name *" error={errors.last_name?.message}>
                  <input
                    className={`field-input${errors.last_name ? ' error' : ''}`}
                    placeholder="Smith"
                    autoComplete="family-name"
                    {...register('last_name', { required: REQUIRED })}
                  />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="Phone *" error={errors.phone?.message}>
                  <input
                    className={`field-input${errors.phone ? ' error' : ''}`}
                    placeholder="(555) 000-0000"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    {...register('phone', { required: REQUIRED })}
                  />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <input
                    className="field-input"
                    placeholder="jane@example.com"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    {...register('email')}
                  />
                </Field>
              </div>
              <Field label="Address Line 1 (Apt, Suite…)" error={errors.address?.message}>
                <input
                  className="field-input"
                  placeholder="Apt 4B, Suite 100, etc."
                  autoComplete="address-line2"
                  {...register('address')}
                />
              </Field>
              <Field label="Street Address *" error={errors.street_address?.message}>
                <input
                  className={`field-input${errors.street_address ? ' error' : ''}`}
                  placeholder="123 Main St"
                  autoComplete="street-address"
                  {...register('street_address', { required: REQUIRED })}
                />
              </Field>
              <div className="grid-2">
                <Field label="City *" error={errors.city?.message}>
                  <input
                    className={`field-input${errors.city ? ' error' : ''}`}
                    placeholder="Dallas"
                    autoComplete="address-level2"
                    {...register('city', { required: REQUIRED })}
                  />
                </Field>
                <Field label="State *" error={errors.state?.message}>
                  <input
                    className={`field-input${errors.state ? ' error' : ''}`}
                    placeholder="TX"
                    autoComplete="address-level1"
                    {...register('state', { required: REQUIRED })}
                  />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="Country" error={errors.country?.message}>
                  <input
                    className="field-input"
                    placeholder="United States"
                    autoComplete="country-name"
                    {...register('country')}
                  />
                </Field>
                <Field label="Postal Code" error={errors.postal_code?.message}>
                  <input
                    className="field-input"
                    placeholder="75201"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    {...register('postal_code')}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* ── 2. Project Type ───────────────────────── */}
          <section className="form-card">
            <SectionHeader
              icon="🏗️"
              color="amber"
              title="Project Type"
              subtitle="Tap to select the type of work being quoted"
            />
            <div className="section-body">
              <Controller
                name="project_type"
                control={control}
                rules={{ required: 'Please select a project type' }}
                render={({ field }) => (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {([
                      { type: 'Concrete',   emoji: '🪨', label: 'Concrete'   },
                      { type: 'Deck',       emoji: '🪵', label: 'Deck'       },
                      { type: 'Fence',      emoji: '🔩', label: 'Fence'      },
                      { type: 'Commercial', emoji: '🏢', label: 'Commercial' },
                    ] as const).map(({ type, emoji, label }) => {
                      const active = field.value === type
                      return (
                        <label
                          key={type}
                          style={{ position: 'relative', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                        >
                          <input
                            type="radio"
                            value={type}
                            checked={active}
                            onChange={() => field.onChange(type)}
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 7,
                            padding: '18px 10px',
                            background: active
                              ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                              : 'var(--bg-input)',
                            border: active ? '2px solid #1d3aa4' : '2px solid var(--border)',
                            borderRadius: 14,
                            textAlign: 'center',
                            minHeight: 90,
                            userSelect: 'none',
                            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: active ? '0 0 0 3px rgb(29 58 164 / 0.15)' : 'none',
                            transform: active ? 'scale(1.02)' : 'scale(1)',
                          }}>
                            <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>
                            <span style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: active ? '#1d3aa4' : 'var(--text-secondary)',
                            }}>{label}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              />
              {errors.project_type && (
                <span className="field-error" style={{ marginTop: 8 }}>
                  ⚠ {errors.project_type.message}
                </span>
              )}
            </div>
          </section>

          {/* ── 3. Concrete Details (conditional) ────── */}
          {projectType === 'Concrete' && (
            <section className="form-card conditional-section">
              <SectionHeader
                icon="🪨"
                color="slate"
                title="Concrete Details"
                subtitle="Specifications for the concrete work"
              />
              <div className="section-body">
                <div className="grid-2">
                  <Field label="Concrete Type">
                    <select className="field-select" {...register('concrete_type')}>
                      <option value="">Select type…</option>
                      <option>Broom Finish</option>
                      <option>Stamped</option>
                      <option>Exposed Aggregate</option>
                      <option>Smooth/Trowel</option>
                      <option>Colored</option>
                    </select>
                  </Field>
                  <Field label="Total Sq Ft">
                    <input
                      className="field-input"
                      type="number"
                      min="0"
                      placeholder="e.g. 400"
                      inputMode="numeric"
                      {...register('concrete_total_sq_ft')}
                    />
                  </Field>
                </div>
                <Field label="Concrete PSI">
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    placeholder="e.g. 3000"
                    inputMode="numeric"
                    {...register('concrete_psi')}
                  />
                </Field>

                {/* Steps sub-section */}
                <div className="sub-section-divider">
                  <p className="sub-section-label">Steps (if applicable)</p>
                  <div className="grid-3">
                    <Field label="# of Steps">
                      <input className="field-input" type="number" min="0" placeholder="0" inputMode="numeric" {...register('number_of_steps')} />
                    </Field>
                    <Field label="Width (in)">
                      <input className="field-input" type="number" min="0" placeholder="48" inputMode="numeric" {...register('step_width')} />
                    </Field>
                    <Field label="Height (in)">
                      <input className="field-input" type="number" min="0" placeholder="7" inputMode="numeric" {...register('step_height')} />
                    </Field>
                  </div>
                  <div className="grid-2" style={{ marginTop: 12 }}>
                    <Field label="Tread Depth (in)">
                      <input className="field-input" type="number" min="0" placeholder="11" inputMode="numeric" {...register('step_tread_depth')} />
                    </Field>
                    <Field label="Platform Size (sq ft)">
                      <input className="field-input" type="number" min="0" placeholder="16" inputMode="numeric" {...register('platform_size_sq_ft')} />
                    </Field>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── 4. Deck Details (conditional) ────────── */}
          {projectType === 'Deck' && (
            <section className="form-card conditional-section">
              <SectionHeader
                icon="🪵"
                color="green"
                title="Deck Details"
                subtitle="Specifications for the deck build"
              />
              <div className="section-body">
                <Field label="Deck Size (sq ft)">
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    placeholder="e.g. 300"
                    inputMode="numeric"
                    {...register('deck_size_sq_ft')}
                  />
                </Field>
                <Field label="Deck Height">
                  <select className="field-select" {...register('deck_height')}>
                    <option value="">Select height…</option>
                    <option>Ground Level (0-2ft)</option>
                    <option>Elevated (2-6ft)</option>
                    <option>Second Story (6ft+)</option>
                  </select>
                </Field>
                <div className="grid-2">
                  <Field label="Stairs Needed?">
                    <select className="field-select" {...register('deck_stairs_needed')}>
                      <option value="">Select…</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </Field>
                  <Field label="Railings Needed?">
                    <select className="field-select" {...register('deck_railings_needed')}>
                      <option value="">Select…</option>
                      <option>Yes - Wood</option>
                      <option>Yes - Vinyl</option>
                      <option>Yes - Composite</option>
                      <option>Yes - Metal/Aluminum</option>
                      <option>No</option>
                    </select>
                  </Field>
                </div>
              </div>
            </section>
          )}

          {/* ── 5. Fence Details (conditional) ───────── */}
          {projectType === 'Fence' && (
            <section className="form-card conditional-section">
              <SectionHeader
                icon="🔩"
                color="rose"
                title="Fence Details"
                subtitle="Specifications for the fence installation"
              />
              <div className="section-body">
                <div className="grid-2">
                  <Field label="Length (linear ft)">
                    <input className="field-input" type="number" min="0" placeholder="e.g. 150" inputMode="numeric" {...register('fence_length_linear_ft')} />
                  </Field>
                  <Field label="Fence Height (ft)">
                    <input className="field-input" type="number" min="0" placeholder="e.g. 6" inputMode="numeric" {...register('fence_height')} />
                  </Field>
                </div>
                <Field label="Fence Type">
                  <input
                    className="field-input"
                    placeholder="e.g. Wood Privacy, Chain Link, Vinyl…"
                    {...register('fence_type')}
                  />
                </Field>
                <Field label="Gate Needed?">
                  <select className="field-select" {...register('fence_gate_needed')}>
                    <option value="">Select…</option>
                    <option>Single Gate</option>
                    <option>Double Gate</option>
                    <option>Driveway Gate</option>
                    <option>None</option>
                  </select>
                </Field>
              </div>
            </section>
          )}

          {/* ── 6. Logistics ──────────────────────────── */}
          <section className="form-card">
            <SectionHeader
              icon="📋"
              color="violet"
              title="Logistics"
              subtitle="Site access and demolition requirements"
            />
            <div className="section-body">
              <div className="grid-3">
                <Field label="Demo Required?">
                  <select className="field-select" {...register('demo_required')}>
                    <option value="">Select…</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Difficult Access?">
                  <select className="field-select" {...register('difficult_to_access')}>
                    <option value="">Select…</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
                <Field label="Haul Off/Away?">
                  <select className="field-select" {...register('haul_off_away')}>
                    <option value="">Select…</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </Field>
              </div>
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

          {/* ── 7. Job Site Photos ────────────────────── */}
          <section className="form-card">
            <SectionHeader
              icon="📸"
              color="cyan"
              title="Job Site Photos"
              subtitle="Tap the button to open your camera and capture site photos"
            />
            <div className="section-body" style={{ paddingBottom: 18 }}>
              <Controller
                name="job_photos"
                control={control}
                render={({ field }) => (
                  <PhotoUpload
                    urls={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </section>

          {/* ── Error Banner ──────────────────────────── */}
          {submitError && (
            <div className="error-banner">
              <span style={{ fontSize: 18, flexShrink: 0 }}>❌</span>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#991b1b', fontSize: 14 }}>
                  Submission Failed
                </p>
                <p style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{submitError}</p>
              </div>
            </div>
          )}

        </div>{/* end .form-body */}

        {/* ── Sticky Submit Bar (outside scroll, inside form) */}
        <div className="sticky-submit-bar">
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" />
                Saving Walkthrough…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Submit Walkthrough
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
