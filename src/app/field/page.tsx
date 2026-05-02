'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

/* ── Types ──────────────────────────────────────────────── */
interface Walkthrough {
  id: string
  first_name: string | null
  last_name: string | null
  address: string | null
  project_type: string | null
  assigned_owner: string | null
  created_at: string | null
}

/* ── Project-type accent map ────────────────────────────── */
const TYPE_ACCENT: Record<string, { bg: string; color: string; label: string }> = {
  concrete:   { bg: '#EFF6FF', color: '#1D4ED8', label: 'Concrete' },
  fencing:    { bg: '#F0FDF4', color: '#16A34A', label: 'Fencing' },
  decking:    { bg: '#FFF7ED', color: '#C2410C', label: 'Decking' },
  commercial: { bg: '#F5F3FF', color: '#7C3AED', label: 'Commercial' },
  other:      { bg: '#F8FAFC', color: '#475569', label: 'Other' },
}
function getTypeAccent(raw: string | null) {
  const key = (raw ?? '').toLowerCase().trim()
  return TYPE_ACCENT[key] ?? TYPE_ACCENT['other']
}

/* ── Helpers ────────────────────────────────────────────── */
function initials(first: string | null, last: string | null) {
  return `${(first ?? '?')[0]}${(last ?? '?')[0]}`.toUpperCase()
}
function fullName(first: string | null, last: string | null) {
  return [first, last].filter(Boolean).join(' ') || 'Unknown'
}
function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/* ── Page ───────────────────────────────────────────────── */
export default function FieldInboxPage() {
  const router = useRouter()
  const [walkthroughs, setWalkthroughs] = useState<Walkthrough[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [techFilter, setTechFilter] = useState('All Jobs')

  const TECH_OPTIONS = ['All Jobs', 'Ann Marie Page', 'Derek Page', 'Drew Valles', 'Unassigned']

  const filteredWalkthroughs = walkthroughs.filter(wt => {
    if (techFilter === 'All Jobs') return true
    if (techFilter === 'Unassigned') return !wt.assigned_owner || wt.assigned_owner.trim() === ''
    return (wt.assigned_owner ?? '').trim().toLowerCase() === techFilter.toLowerCase()
  })

  async function fetchPending(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('walkthroughs')
      .select('id, first_name, last_name, address, project_type, assigned_owner, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (err) {
      setError('Could not load walkthroughs. Please try again.')
    } else {
      setWalkthroughs(data ?? [])
    }

    if (isRefresh) setRefreshing(false)
    else setLoading(false)
  }

  useEffect(() => { fetchPending() }, [])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Root ── */
        .fi-root {
          min-height: 100vh;
          background: #F0F4FA;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .fi-header {
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          padding: 0 1.25rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .fi-logo-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .fi-brand {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .fi-brand span {
          display: block;
          font-size: 0.65rem;
          font-weight: 500;
          color: #64748B;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .fi-refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #EFF6FF;
          color: #1D4ED8;
          border: 1px solid #BFDBFE;
          border-radius: 10px;
          padding: 0.45rem 0.85rem;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .fi-refresh-btn:active { transform: scale(0.96); }
        .fi-refresh-btn svg {
          width: 14px;
          height: 14px;
          transition: transform 0.5s ease;
        }
        .fi-refresh-btn.spinning svg { animation: spin 0.6s linear; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Hero ── */
        .fi-hero {
          padding: 2rem 1.25rem 1.25rem;
        }
        .fi-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          color: #1E40AF;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          border: 1px solid #BFDBFE;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .fi-eyebrow::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #3B82F6;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        .fi-hero h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 0.4rem;
        }
        .fi-hero-sub {
          font-size: 0.88rem;
          color: #64748B;
          line-height: 1.55;
        }
        .fi-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #1D4ED8;
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          border-radius: 999px;
          padding: 0.1rem 0.55rem;
          margin-left: 0.4rem;
          vertical-align: middle;
        }

        /* ── Tech filter bar ── */
        .fi-filter-bar {
          padding: 0 1.25rem 1rem;
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .fi-filter-bar::-webkit-scrollbar { display: none; }
        .fi-filter-pill {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid #E2E8F0;
          background: #fff;
          color: #475569;
          transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .fi-filter-pill:active { transform: scale(0.95); }
        .fi-filter-pill.active {
          background: #1D4ED8;
          color: #fff;
          border-color: #1D4ED8;
          box-shadow: 0 2px 8px rgba(29,78,216,0.25);
        }
        @media (min-width: 600px) {
          .fi-filter-bar { padding: 0 2rem 1.25rem; }
        }
        @media (min-width: 900px) {
          .fi-filter-bar { max-width: 900px; margin: 0 auto; width: 100%; }
        }

        /* ── Content area ── */
        .fi-content {
          flex: 1;
          padding: 0 1.25rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Card list ── */
        .fi-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        /* ── Card ── */
        .fi-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.1rem 1.15rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.2s ease,
                      border-color 0.15s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          will-change: transform;
        }
        .fi-card:active {
          transform: scale(0.98);
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        @media (hover: hover) {
          .fi-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(15,23,42,0.1), 0 4px 8px rgba(15,23,42,0.05);
            border-color: #BFDBFE;
          }
        }

        /* accent left bar */
        .fi-card-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 18px 0 0 18px;
        }

        /* avatar */
        .fi-avatar {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        /* card body */
        .fi-card-body {
          flex: 1;
          min-width: 0;
        }
        .fi-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .fi-card-name {
          font-size: 1rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fi-card-time {
          font-size: 0.7rem;
          font-weight: 500;
          color: #94A3B8;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .fi-card-addr {
          font-size: 0.82rem;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 0.4rem;
        }
        .fi-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .fi-type-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.18rem 0.55rem;
          border-radius: 999px;
        }
        .fi-owner-tag {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748B;
        }
        .fi-owner-tag svg {
          width: 12px;
          height: 12px;
          color: #94A3B8;
          flex-shrink: 0;
        }

        /* chevron */
        .fi-chevron {
          flex-shrink: 0;
          color: #CBD5E1;
          transition: transform 0.18s ease, color 0.18s ease;
        }
        .fi-card:hover .fi-chevron,
        .fi-card:active .fi-chevron {
          color: #1D4ED8;
          transform: translateX(3px);
        }
        .fi-chevron svg { width: 18px; height: 18px; }

        /* ── Loading skeleton ── */
        .fi-skeletons {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .fi-skeleton {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.1rem 1.15rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .sk-circle {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #E2E8F0;
          flex-shrink: 0;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
        .sk-line {
          height: 12px;
          border-radius: 6px;
          background: #E2E8F0;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        /* ── Empty state ── */
        .fi-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.5rem;
          gap: 1rem;
        }
        .fi-empty-icon {
          width: 72px;
          height: 72px;
          border-radius: 24px;
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          border: 1px solid #BFDBFE;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .fi-empty-icon svg { width: 36px; height: 36px; color: #1D4ED8; }
        .fi-empty h2 {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
        }
        .fi-empty p {
          font-size: 0.88rem;
          color: #64748B;
          max-width: 240px;
          line-height: 1.6;
        }

        /* ── Error state ── */
        .fi-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 14px;
          padding: 1rem 1.15rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1rem;
        }
        .fi-error svg { width: 20px; height: 20px; color: #DC2626; flex-shrink: 0; }
        .fi-error p { font-size: 0.85rem; color: #B91C1C; font-weight: 500; }

        /* ── Footer ── */
        .fi-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid #E2E8F0;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 40;
        }
        .fi-footer p {
          font-size: 0.72rem;
          color: #94A3B8;
          font-weight: 500;
        }
        .fi-footer strong { color: #475569; font-weight: 600; }
        .fi-new-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #1D4ED8;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0.55rem 1rem;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          -webkit-tap-highlight-color: transparent;
          text-decoration: none;
        }
        .fi-new-btn:active { transform: scale(0.96); }
        .fi-new-btn svg { width: 14px; height: 14px; }

        /* ── Responsive tweaks for tablet (iPad) ── */
        @media (min-width: 600px) {
          .fi-hero { padding: 2.5rem 2rem 1.5rem; }
          .fi-hero h1 { font-size: 2.25rem; }
          .fi-content { padding: 0 2rem 5rem; }
          .fi-header { padding: 0 2rem; }
          .fi-footer { padding: 0.75rem 2rem; }
          .fi-card { padding: 1.25rem 1.4rem; }
          .fi-avatar { width: 52px; height: 52px; }
          .fi-list { gap: 1rem; }
          .fi-card-name { font-size: 1.05rem; }
        }
        @media (min-width: 900px) {
          .fi-list { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .fi-hero { max-width: 900px; margin: 0 auto; width: 100%; padding-left: 2rem; }
          .fi-content { max-width: 900px; margin: 0 auto; width: 100%; }
        }
      `}</style>

      <div className="fi-root">
        {/* ── Header ── */}
        <header className="fi-header">
          <div className="fi-logo-row">
            <Image
              src="/page-concrete-logo.png"
              alt="Page Concrete & Outdoor Services"
              width={44}
              height={44}
              style={{ objectFit: 'contain', borderRadius: 8 }}
              priority
            />
            <div className="fi-brand">
              Page Concrete
              <span>Field Crew</span>
            </div>
          </div>

          <a
            href="/"
            className="fi-refresh-btn"
            aria-label="Back to Command Center"
          >
            ← Hub
          </a>
          <button
            className={`fi-refresh-btn${refreshing ? ' spinning' : ''}`}
            onClick={() => fetchPending(true)}
            disabled={refreshing}
            aria-label="Refresh pending walkthroughs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </header>

        {/* ── Hero ── */}
        <section className="fi-hero">
          <div className="fi-eyebrow">Tech Inbox</div>
          <h1>
            Pending Walkthroughs
            {!loading && filteredWalkthroughs.length > 0 && (
              <span className="fi-count-badge">{filteredWalkthroughs.length}</span>
            )}
          </h1>
          <p className="fi-hero-sub">
            Tap a job to open its walkthrough form.
          </p>
        </section>

        {/* ── Tech filter pills ── */}
        <div className="fi-filter-bar" role="group" aria-label="Filter by assigned tech">
          {TECH_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`fi-filter-pill${techFilter === opt ? ' active' : ''}`}
              onClick={() => setTechFilter(opt)}
              aria-pressed={techFilter === opt}
              id={`filter-${opt.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <main className="fi-content">
          {/* Error */}
          {error && (
            <div className="fi-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="fi-skeletons" aria-label="Loading walkthroughs">
              {[1, 2, 3].map(n => (
                <div className="fi-skeleton" key={n}>
                  <div className="sk-circle" />
                  <div className="sk-lines">
                    <div className="sk-line" style={{ width: '60%' }} />
                    <div className="sk-line" style={{ width: '80%' }} />
                    <div className="sk-line" style={{ width: '45%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Card list */}
          {!loading && !error && filteredWalkthroughs.length > 0 && (
            <div className="fi-list" role="list">
              {filteredWalkthroughs.map(wt => {
                const accent = getTypeAccent(wt.project_type)
                const name = fullName(wt.first_name, wt.last_name)
                const init = initials(wt.first_name, wt.last_name)
                const ago = timeAgo(wt.created_at)

                return (
                  <div
                    key={wt.id}
                    className="fi-card"
                    role="listitem"
                    id={`walkthrough-card-${wt.id}`}
                    onClick={() => router.push(`/walkthrough-form?id=${wt.id}`)}
                    aria-label={`Open walkthrough for ${name}`}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && router.push(`/walkthrough-form?id=${wt.id}`)}
                  >
                    {/* accent bar */}
                    <div className="fi-card-bar" style={{ background: accent.color }} />

                    {/* avatar */}
                    <div
                      className="fi-avatar"
                      style={{ background: accent.bg, color: accent.color }}
                      aria-hidden
                    >
                      {init}
                    </div>

                    {/* body */}
                    <div className="fi-card-body">
                      <div className="fi-card-top">
                        <div className="fi-card-name">{name}</div>
                        {ago && <div className="fi-card-time">{ago}</div>}
                      </div>
                      <div className="fi-card-addr">
                        {wt.address ?? <em style={{ color: '#94A3B8' }}>No address on file</em>}
                      </div>
                      <div className="fi-card-meta">
                        <span
                          className="fi-type-badge"
                          style={{ background: accent.bg, color: accent.color }}
                        >
                          {accent.label}
                        </span>
                        {wt.assigned_owner && (
                          <span className="fi-owner-tag">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {wt.assigned_owner}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* chevron */}
                    <div className="fi-chevron" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredWalkthroughs.length === 0 && (
            <div className="fi-empty" role="status" aria-label="No pending walkthroughs">
              <div className="fi-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>All caught up!</h2>
              <p>No pending jobs right now. Check back later or pull a new walkthrough.</p>
            </div>
          )}
        </main>

        {/* ── Fixed footer ── */}
        <footer className="fi-footer">
          <p>
            <strong>Page Concrete</strong> &nbsp;·&nbsp; Field Crew
          </p>
          <a
            href="/walkthrough-form"
            className="fi-new-btn"
            id="btn-new-walkthrough"
            aria-label="Start a new walkthrough"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Walkthrough
          </a>
        </footer>
      </div>
    </>
  )
}
