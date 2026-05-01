'use client'

import { useState } from 'react'
import type { ProposalData, WalkthroughData, LineItem, AnnotatedPhoto } from './page'

/* ── Helpers ─────────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

interface Props {
  proposal: ProposalData
  walkthrough: WalkthroughData
}

export default function ProposalClient({ proposal, walkthrough }: Props) {
  const [signatureName, setSignatureName] = useState('')
  const [signed, setSigned] = useState(false)

  const subtotal = proposal.line_items.reduce(
    (sum: number, item: LineItem) => sum + item.price * item.quantity,
    0
  )
  const deposit = proposal.grand_total * 0.5

  const formattedDate = new Date(proposal.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const validUntil = new Date(proposal.created_at)
  validUntil.setDate(validUntil.getDate() + 10)
  const validUntilStr = validUntil.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const customerName = `${walkthrough.first_name} ${walkthrough.last_name}`
  const address = `${walkthrough.street_address}, ${walkthrough.city}, ${walkthrough.state}${walkthrough.postal_code ? ' ' + walkthrough.postal_code : ''}`

  const canSign = signatureName.trim().length >= 3

  /* ── Styles ────────────────────────────────────────────────── */
  const s = {
    page: {
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      color: '#1e293b',
    } as React.CSSProperties,

    maxW: {
      maxWidth: 760,
      margin: '0 auto',
      padding: '0 24px',
    } as React.CSSProperties,

    sectionCard: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '36px 40px',
      marginBottom: 24,
    } as React.CSSProperties,

    sectionLabel: {
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      color: '#1d4ed8',
      marginBottom: 8,
    } as React.CSSProperties,

    sectionTitle: {
      fontSize: 22,
      fontWeight: 800,
      color: '#0f172a',
      letterSpacing: '-0.02em',
      marginBottom: 20,
    } as React.CSSProperties,

    divider: {
      height: 1,
      background: '#e2e8f0',
      margin: '24px 0',
    } as React.CSSProperties,
  }

  return (
    <>

      <div style={s.page}>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* HEADER                                                  */}
        {/* ═══════════════════════════════════════════════════════ */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
        }}>
          <div style={{ ...s.maxW, padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: '#1d4ed8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>P</span>
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Page Concrete &amp; Outdoor Services
                </div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                  Licensed · Insured · Professional
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Project Proposal
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>
                #{proposal.id.slice(0, 8).toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{formattedDate}</div>
            </div>
          </div>
        </header>

        {/* ── Page body ── */}
        <main style={{ ...s.maxW, paddingTop: 32, paddingBottom: 80 }}>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* INTRO LETTER                                            */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div style={s.sectionCard}>
            <div style={s.sectionLabel}>Personal Introduction</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              Dear {customerName},
            </p>
            <div style={s.divider} />
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.85, margin: '0 0 16px' }}>
              Thank you for inviting Page Concrete &amp; Outdoor Services to evaluate your project
              at <strong style={{ color: '#1e293b' }}>{address}</strong>. We genuinely appreciate
              the opportunity and understand that choosing the right contractor is one of the most
              important decisions you will make for your property.
            </p>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.85, margin: '0 0 16px' }}>
              Following our site visit and thorough assessment of your{' '}
              <strong style={{ color: '#1e293b' }}>{walkthrough.project_type}</strong> project,
              we have prepared this detailed proposal outlining our full scope of work, investment
              breakdown, and the specific steps required to bring your vision to life — on time and
              on budget.
            </p>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.85, margin: 0 }}>
              We stand behind every project with our commitment to quality craftsmanship, premium
              materials, and clear communication from start to finish. Please review the following
              sections carefully, and do not hesitate to reach out with any questions.
            </p>
            <div style={s.divider} />
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Prepared For</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{customerName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{address}</div>
                {walkthrough.phone && <div style={{ fontSize: 12, color: '#64748b' }}>{walkthrough.phone}</div>}
                {walkthrough.email && <div style={{ fontSize: 12, color: '#64748b' }}>{walkthrough.email}</div>}
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Prepared By</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Page Concrete &amp; Outdoor Services</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Issued: {formattedDate}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Valid Until: {validUntilStr}</div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SITE VISIT & ANNOTATED PHOTOS                            */}
          {/* ═══════════════════════════════════════════════════════ */}
          {(() => {
            // Prefer new annotated_photos; fall back to legacy job_photos
            const hasAnnotated = (walkthrough.annotated_photos ?? []).length > 0
            const hasLegacy    = (walkthrough.job_photos ?? []).length > 0
            if (!hasAnnotated && !hasLegacy) return null

            return (
              <div style={s.sectionCard}>
                <div style={s.sectionLabel}>Documentation</div>
                <div style={s.sectionTitle}>Site Visit &amp; Walkthrough Photos</div>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: '0 0 32px' }}>
                  The following annotated images were captured during our on-site assessment.
                  Each photo is accompanied by the technician’s field notes, documenting the
                  specific conditions that informed the scope and pricing in this proposal.
                </p>

                {hasAnnotated ? (
                  /* ── New annotated photo blocks ────────────────────────── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    {(walkthrough.annotated_photos as AnnotatedPhoto[]).map((photo, i) => (
                      <div
                        key={`${photo.url}-${i}`}
                        style={{
                          /* Thick slate-blue blockquote-style left border */
                          borderLeft: '5px solid #1d4ed8',
                          paddingLeft: 28,
                          paddingTop: 4,
                          paddingBottom: 4,
                        }}
                      >
                        {/* Photo index label */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 14,
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#1d4ed8',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 900,
                            letterSpacing: '-0.01em',
                            flexShrink: 0,
                          }}>
                            {i + 1}
                          </span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#1d4ed8',
                          }}>
                            Field Documentation · Photo {i + 1}
                          </span>
                        </div>

                        {/* Large near-full-width annotated image */}
                        <div style={{
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)',
                          marginBottom: 20,
                          background: '#f8fafc',
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={`Annotated site photo ${i + 1}`}
                            loading="lazy"
                            style={{
                              width: '100%',
                              height: 'auto',
                              display: 'block',
                              maxHeight: 520,
                              objectFit: 'cover',
                            }}
                          />
                        </div>

                        {/* Annotation notes block */}
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: '20px 24px',
                        }}>
                          <div style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#1d4ed8',
                            marginBottom: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Technician Field Notes
                          </div>
                          <p style={{
                            margin: 0,
                            fontSize: 15,
                            color: '#1e293b',
                            lineHeight: 1.8,
                            fontWeight: 400,
                            letterSpacing: '-0.005em',
                            whiteSpace: 'pre-wrap',
                          }}>
                            {photo.annotation_notes}
                          </p>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── Legacy plain-URL photo grid (backwards compatibility) ── */
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 16,
                  }}>
                    {(walkthrough.job_photos as string[]).map((url, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'relative',
                          aspectRatio: '4/3',
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Site photo ${i + 1}`}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                          padding: '16px 10px 8px',
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em' }}>
                            PHOTO {i + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* SCOPE OF WORK & INVESTMENT                              */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div style={s.sectionCard}>
            <div style={s.sectionLabel}>Investment Summary</div>
            <div style={s.sectionTitle}>Scope of Work &amp; Pricing</div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 60px 110px',
              gap: 12,
              padding: '10px 16px',
              background: '#f1f5f9',
              borderRadius: '8px 8px 0 0',
              border: '1px solid #e2e8f0',
              borderBottom: 'none',
            }}>
              {['Description', 'Unit Price', 'Qty', 'Total'].map((h, i) => (
                <div key={h} style={{
                  fontSize: 10, fontWeight: 800, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  textAlign: i > 1 ? 'right' : 'left',
                }}>{h}</div>
              ))}
            </div>

            {/* Item rows */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
              {proposal.line_items.map((item: LineItem, i: number) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 60px 110px',
                  gap: 12,
                  padding: '16px',
                  background: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                  borderBottom: i < proposal.line_items.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'center',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>
                    {item.description || '—'}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(item.price)}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', textAlign: 'right' }}>
                    {item.quantity}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals block */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 280 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: '#64748b' }}>
                    <span>Subtotal</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmt(subtotal)}</span>
                  </div>
                  <div style={{ height: 1, background: '#e2e8f0', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>Grand Total</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(proposal.grand_total)}
                    </span>
                  </div>
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 8,
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>50% Deposit Due at Signing</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#1d4ed8', fontVariantNumeric: 'tabular-nums' }}>{fmt(deposit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* TERMS & NEXT STEPS                                      */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div style={s.sectionCard}>
            <div style={s.sectionLabel}>Agreement</div>
            <div style={s.sectionTitle}>Terms &amp; Next Steps</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                {
                  num: '01',
                  title: 'Proposal Validity',
                  body: `This proposal is valid for 10 days from the date of issue (${formattedDate}) and expires on ${validUntilStr}. Pricing is subject to change after expiration.`,
                },
                {
                  num: '02',
                  title: 'Scheduling Deposit',
                  body: `A 50% deposit of ${fmt(deposit)} is required to reserve your project on our schedule. No work will begin until the deposit is received.`,
                },
                {
                  num: '03',
                  title: 'Project Timeline',
                  body: 'Upon deposit receipt, you will receive a confirmed start date within 48 hours. Our team will coordinate all material deliveries and site preparation.',
                },
                {
                  num: '04',
                  title: 'Final Payment',
                  body: `The remaining balance of ${fmt(deposit)} is due upon project completion and your satisfaction walkthrough. We accept all major payment methods.`,
                },
              ].map(({ num, title, body }) => (
                <div key={num} style={{
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  background: '#fafafa',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#dbeafe', lineHeight: 1, marginBottom: 8 }}>{num}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{body}</div>
                </div>
              ))}
            </div>

            {/* Trust signals */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '16px 20px',
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {['✓ Licensed & Insured', '✓ Satisfaction Guaranteed', '✓ Premium Materials', '✓ Clean Worksite Guaranteed'].map(item => (
                <span key={item} style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>{item}</span>
              ))}
            </div>

            {walkthrough.notes && (
              <>
                <div style={s.divider} />
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Project Notes
                </div>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {walkthrough.notes}
                </p>
              </>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* DIGITAL ACCEPTANCE                                       */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e3a8a',
            borderRadius: 16,
            padding: '40px',
            marginBottom: 0,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 8 }}>
              Digital Acceptance
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Approve &amp; Reserve Your Project
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 520 }}>
              By typing your full legal name below and clicking the button, you acknowledge that you have
              read and agree to the scope of work and terms outlined in this proposal. This constitutes
              your digital signature and authorization to proceed.
            </p>

            {signed ? (
              <div style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 12,
                padding: '24px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#86efac', marginBottom: 4 }}>
                  Proposal Approved!
                </div>
                <div style={{ fontSize: 13, color: '#6ee7b7' }}>
                  Signed by: {signatureName} · Your deposit invoice will be sent shortly.
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Type Full Name to Sign
                  </label>
                  <input
                    type="text"
                    placeholder={customerName}
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      background: 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${canSign ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: 10,
                      color: '#ffffff',
                      fontSize: 16,
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box',
                    }}
                  />
                  {canSign && (
                    <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 6, fontStyle: 'italic' }}>
                      ✓ Signature accepted — "{signatureName}"
                    </div>
                  )}
                </div>

                <button
                  disabled={!canSign}
                  onClick={() => { if (canSign) setSigned(true) }}
                  style={{
                    width: '100%',
                    padding: '22px 28px',
                    background: canSign
                      ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
                      : 'rgba(255,255,255,0.07)',
                    color: canSign ? '#ffffff' : '#475569',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    cursor: canSign ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    boxShadow: canSign
                      ? '0 8px 40px rgba(29,78,216,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset'
                      : 'none',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {canSign && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
                      pointerEvents: 'none',
                    }} />
                  )}
                  <div>Approve &amp; Pay 50% Deposit</div>
                  <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.75, marginTop: 4 }}>
                    {fmt(deposit)} · Secure Payment
                  </div>
                </button>

                <p style={{ fontSize: 11, color: '#475569', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
                  🔒 Secured &amp; encrypted. Your signature and payment information are protected.
                  <br />By approving, you agree to the terms outlined in this proposal.
                </p>
              </>
            )}
          </div>

        </main>

        {/* ── Footer ── */}
        <footer style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Page Concrete &amp; Outdoor Services · Proposal #{proposal.id.slice(0, 8).toUpperCase()} · Valid through {validUntilStr}
          </div>
        </footer>

      </div>
    </>
  )
}
