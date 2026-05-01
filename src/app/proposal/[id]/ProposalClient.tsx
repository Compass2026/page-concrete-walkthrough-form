'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  FileText,
  Camera,
  ChevronDown,
  Shield,
  Star,
  Layers,
} from 'lucide-react'
import type { ProposalData, WalkthroughData, LineItem } from './page'

/* ── Helpers ────────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function projectTypeEmoji(type: string) {
  switch (type) {
    case 'Concrete': return '🪨'
    case 'Fencing':  return '🔩'
    case 'Decking':  return '🪵'
    default:         return '📋'
  }
}

function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/* ── Props ──────────────────────────────────────────────────── */
interface Props {
  proposal: ProposalData
  walkthrough: WalkthroughData
}

/* ── Component ──────────────────────────────────────────────── */
export default function ProposalClient({ proposal, walkthrough }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const subtotal = proposal.line_items.reduce(
    (sum: number, item: LineItem) => sum + item.price * item.quantity,
    0
  )
  const deposit = proposal.grand_total * 0.5

  const formattedDate = new Date(proposal.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      {/* ── Lightbox ────────────────────────────────────── */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Full size photo"
            style={{
              maxWidth: '100%', maxHeight: '90vh',
              borderRadius: '12px', objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* ── Main wrapper ────────────────────────────────── */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        paddingBottom: '120px', // space for sticky CTA
      }}>

        {/* ── Hero Header ───────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1d3aa4 60%, #1e40af 100%)',
          padding: '32px 20px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Blueprint grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.07,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />

          {/* Logo / brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 800, color: 'white',
            }}>P</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
                Page Concrete & Outdoor Services
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.04em' }}>
                PROJECT PROPOSAL
              </div>
            </div>
          </div>

          {/* Project type badge */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
              marginBottom: '12px',
            }}>
              {projectTypeEmoji(walkthrough.project_type)} {walkthrough.project_type} Project
            </div>

            <h1 style={{
              margin: '0 0 6px',
              fontSize: 'clamp(24px, 7vw, 32px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}>
              {walkthrough.first_name} {walkthrough.last_name}
            </h1>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontWeight: 500,
            }}>
              <MapPin size={13} />
              {walkthrough.street_address}, {walkthrough.city}, {walkthrough.state} {walkthrough.postal_code}
            </div>
          </div>

          {/* Status pill */}
          <div style={{
            position: 'absolute', top: 32, right: 20, zIndex: 2,
            display: 'flex', alignItems: 'center', gap: '6px',
            background: proposal.status === 'approved'
              ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)',
            border: `1px solid ${proposal.status === 'approved' ? 'rgba(34,197,94,0.4)' : 'rgba(251,191,36,0.4)'}`,
            borderRadius: '999px',
            padding: '5px 12px',
            fontSize: '11px', fontWeight: 800,
            color: proposal.status === 'approved' ? '#86efac' : '#fde68a',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: proposal.status === 'approved' ? '#22c55e' : '#f59e0b',
            }} />
            {proposal.status}
          </div>
        </div>

        {/* ── Content Area ──────────────────────────────── */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px' }}>

          {/* ── Proposal Meta ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '20px',
              marginTop: '-20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Proposal Date</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                <Calendar size={13} style={{ color: '#60a5fa' }} />
                {formattedDate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Proposal #</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', fontFamily: 'monospace' }}>
                {proposal.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
            {walkthrough.phone && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Phone</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                  <Phone size={13} style={{ color: '#60a5fa' }} />
                  {walkthrough.phone}
                </div>
              </div>
            )}
            {walkthrough.email && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Email</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                  <Mail size={13} style={{ color: '#60a5fa' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{walkthrough.email}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Job Photos ──────────────────────────────── */}
          {walkthrough.job_photos && walkthrough.job_photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: '20px' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '12px',
              }}>
                <Camera size={15} style={{ color: '#60a5fa' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
                  Job Site Photos
                </span>
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
                  color: '#64748b', background: 'rgba(255,255,255,0.05)',
                  padding: '2px 10px', borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {walkthrough.job_photos.length} photos
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '8px',
              }}>
                {walkthrough.job_photos.map((url, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setLightbox(url)}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      position: 'relative',
                      aspectRatio: '4/3',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      background: 'none',
                      padding: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Site photo ${i + 1}`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Project Details (collapsible) ────────────── */}
          {walkthrough.project_details && Object.keys(walkthrough.project_details).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: '20px' }}
            >
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: detailsOpen ? '12px 12px 0 0' : '12px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  color: '#e2e8f0', fontSize: '13px', fontWeight: 700,
                  textAlign: 'left',
                }}
              >
                <Layers size={14} style={{ color: '#60a5fa' }} />
                Project Specifications
                <ChevronDown
                  size={14}
                  style={{
                    marginLeft: 'auto',
                    color: '#64748b',
                    transform: detailsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
              {detailsOpen && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  padding: '4px 0',
                }}>
                  {Object.entries(walkthrough.project_details)
                    .filter(([key]) => key !== 'project_type')
                    .map(([key, value]) => (
                      <div
                        key={key}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                          padding: '10px 18px',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          gap: '12px',
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                          {formatKey(key)}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', textAlign: 'right' }}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Line Items ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: '20px' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
            }}>
              <FileText size={15} style={{ color: '#60a5fa' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Scope of Work</span>
            </div>

            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 70px 80px',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px 10px 0 0',
              border: '1px solid rgba(255,255,255,0.06)',
              borderBottom: 'none',
            }}>
              {['Description', 'Unit $', 'Qty', 'Total'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: h === 'Total' ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            {/* Item rows */}
            <div style={{
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0 0 12px 12px',
              overflow: 'hidden',
            }}>
              {proposal.line_items.map((item: LineItem, i: number) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 70px 70px 80px',
                    gap: '8px',
                    padding: '14px 16px',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                    borderBottom: i < proposal.line_items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 }}>
                    {item.description || '—'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(item.price)}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', textAlign: 'center' }}>
                    ×{item.quantity}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{
              marginTop: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '16px 20px',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: '13px', fontWeight: 500, color: '#94a3b8',
              }}>
                <span>Subtotal</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
              }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Grand Total</span>
                <motion.span
                  key={proposal.grand_total.toFixed(2)}
                  initial={{ scale: 1.05, color: '#93c5fd' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {fmt(proposal.grand_total)}
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* ── Trust Signals ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px',
            }}
          >
            {[
              { icon: Shield, label: 'Licensed &\nInsured' },
              { icon: Star, label: 'Satisfaction\nGuaranteed' },
              { icon: CheckCircle, label: 'Quality\nMaterials' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '14px 10px',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                }}
              >
                <Icon size={18} style={{ color: '#60a5fa' }} />
                <span style={{
                  fontSize: '10px', fontWeight: 700, color: '#94a3b8',
                  textAlign: 'center', lineHeight: 1.4, whiteSpace: 'pre-line',
                }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* ── Notes ───────────────────────────────────── */}
          {walkthrough.notes && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '16px 18px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                Project Notes
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {walkthrough.notes}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Sticky CTA Bar ──────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '16px 20px 28px',
        background: 'linear-gradient(to top, #0f172a 60%, rgba(15,23,42,0))',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Deposit amount banner */}
        <div style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#64748b',
        }}>
          50% Deposit Due Today ·{' '}
          <span style={{ color: '#93c5fd', fontWeight: 800 }}>{fmt(deposit)}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { /* Stripe / payment integration goes here */ }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '480px',
            margin: '0 auto',
            padding: '20px 28px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1d3aa4 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '18px',
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: `
              0 8px 32px rgba(29,78,216,0.5),
              0 0 0 1px rgba(255,255,255,0.1) inset,
              0 1px 0 rgba(255,255,255,0.2) inset
            `,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />
          <CheckCircle size={22} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div>Approve &amp; Pay 50% Deposit</div>
            <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.75, marginTop: '1px' }}>
              {fmt(deposit)} · Secure Payment
            </div>
          </div>
        </motion.button>
      </div>
    </>
  )
}
