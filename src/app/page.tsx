import Link from 'next/link'
import Image from 'next/image'

const tools = [
  {
    href: '/intake',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.17 9.5a19.79 19.79 0 01-3.07-8.68A2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
        <path d="M15 2h7M18.5 2v7" />
      </svg>
    ),
    label: 'New Lead Intake',
    description: 'Log a new customer call and push to GoHighLevel.',
    accent: '#1E40AF',
    bg: 'rgba(30, 64, 175, 0.07)',
    badge: 'CRM',
  },
  {
    href: '/office',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M6 8h.01M10 8h8M6 11h.01M10 11h8" />
      </svg>
    ),
    label: 'Office Dashboard',
    description: 'Build proposals, annotate photos, and generate contracts.',
    accent: '#0F4C81',
    bg: 'rgba(15, 76, 129, 0.07)',
    badge: 'Office',
  },
  {
    href: '/walkthrough-form',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    label: 'Field Walkthrough',
    description: 'Submit job site photos and specs from the field.',
    accent: '#1D4ED8',
    bg: 'rgba(29, 78, 216, 0.07)',
    badge: 'Field',
  },
  {
    href: '/Invoice',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    label: 'Quick Invoice',
    description: 'Generate on-the-spot invoices, send digital payment links, and print paper receipts.',
    accent: '#0D9488',
    bg: 'rgba(13, 148, 136, 0.07)',
    badge: 'BILLING',
  },
]

export default function HubPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hub-root {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .hub-header {
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          padding: 0 2rem;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .hub-logo-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .hub-brand {
          font-size: 1rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .hub-brand span {
          display: block;
          font-size: 0.7rem;
          font-weight: 500;
          color: #64748B;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .hub-header-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #EFF6FF;
          color: #1E40AF;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          border: 1px solid #BFDBFE;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .hub-header-badge::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3B82F6;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* ── Hero ── */
        .hub-hero {
          padding: 4rem 2rem 3rem;
          text-align: center;
          max-width: 680px;
          margin: 0 auto;
        }
        .hub-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          color: #1E40AF;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 1rem;
          border-radius: 999px;
          border: 1px solid #BFDBFE;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .hub-hero h1 {
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        .hub-hero h1 em {
          font-style: normal;
          background: linear-gradient(135deg, #1D4ED8, #3B82F6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hub-hero p {
          font-size: 1.05rem;
          color: #475569;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto;
        }

        /* ── Grid ── */
        .hub-grid-section {
          flex: 1;
          padding: 0 2rem 4rem;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }
        .hub-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        /* ── Card ── */
        .tool-card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 2rem;
          text-decoration: none;
          color: inherit;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.22s ease,
                      border-color 0.18s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
        }
        .tool-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 60%, rgba(30, 64, 175, 0.03) 100%);
          pointer-events: none;
          transition: opacity 0.3s ease;
          opacity: 0;
        }
        .tool-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12), 0 4px 8px rgba(15, 23, 42, 0.06);
          border-color: #BFDBFE;
        }
        .tool-card:hover::before {
          opacity: 1;
        }
        .card-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .tool-card:hover .card-icon-wrap {
          transform: scale(1.08);
        }
        .card-icon-wrap svg {
          width: 26px;
          height: 26px;
        }
        .card-badge {
          display: inline-flex;
          align-items: center;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          margin-bottom: 0.6rem;
          width: fit-content;
        }
        .card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .card-desc {
          font-size: 0.88rem;
          color: #64748B;
          line-height: 1.65;
          flex: 1;
        }
        .card-cta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          transition: gap 0.18s ease;
        }
        .tool-card:hover .card-cta {
          gap: 0.65rem;
        }
        .card-cta svg {
          width: 16px;
          height: 16px;
          transition: transform 0.18s ease;
        }
        .tool-card:hover .card-cta svg {
          transform: translateX(3px);
        }

        /* ── Divider ── */
        .hub-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0 2rem 2rem;
          max-width: 1100px;
          margin-left: auto;
          margin-right: auto;
        }
        .hub-divider-line {
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }
        .hub-divider-text {
          font-size: 0.72rem;
          font-weight: 600;
          color: #94A3B8;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── Footer ── */
        .hub-footer {
          border-top: 1px solid #E2E8F0;
          padding: 1.25rem 2rem;
          text-align: center;
          background: #fff;
        }
        .hub-footer p {
          font-size: 0.78rem;
          color: #94A3B8;
          font-weight: 500;
        }
        .hub-footer strong {
          color: #475569;
          font-weight: 600;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hub-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 580px) {
          .hub-header {
            padding: 0 1.25rem;
          }
          .hub-header-badge span {
            display: none;
          }
          .hub-hero {
            padding: 2.5rem 1.25rem 2rem;
          }
          .hub-grid-section {
            padding: 0 1.25rem 3rem;
          }
          .hub-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .tool-card {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="hub-root">
        {/* Header */}
        <header className="hub-header">
          <div className="hub-logo-row">
            <Image
              src="/page-concrete-logo.png"
              alt="Page Concrete & Outdoor Services"
              width={52}
              height={52}
              style={{ objectFit: 'contain', borderRadius: 8 }}
              priority
            />
            <div className="hub-brand">
              Page Concrete
              <span>Operating System</span>
            </div>
          </div>
          <div className="hub-header-badge">
            <span>Internal Tools</span>
          </div>
        </header>

        {/* Hero */}
        <section className="hub-hero">
          <div className="hub-eyebrow">
            ⚡ Command Center
          </div>
          <h1>
            Page Concrete<br />
            <em>Operating System</em>
          </h1>
          <p>
            Your single hub for every internal tool — from logging leads and writing proposals to capturing job sites from the field.
          </p>
        </section>

        {/* Divider */}
        <div className="hub-divider" style={{ marginBottom: '1.5rem' }}>
          <div className="hub-divider-line" />
          <span className="hub-divider-text">Select a Tool</span>
          <div className="hub-divider-line" />
        </div>

        {/* Tool Grid */}
        <main className="hub-grid-section">
          <div className="hub-grid">
            {/* Card 1 – New Lead Intake */}
            <Link
              href="/intake"
              className="tool-card"
              id="tool-card-intake"
              aria-label="New Lead Intake"
            >
              <div
                className="card-icon-wrap"
                style={{ background: 'rgba(30, 64, 175, 0.08)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.17 9.5a19.79 19.79 0 01-3.07-8.68A2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                  <line x1="18" y1="2" x2="22" y2="2" />
                  <line x1="20" y1="0" x2="20" y2="4" />
                </svg>
              </div>
              <span
                className="card-badge"
                style={{ background: '#EFF6FF', color: '#1E40AF' }}
              >
                CRM
              </span>
              <div className="card-title">New Lead Intake</div>
              <div className="card-desc">
                Log a new customer call and push the contact directly to GoHighLevel.
              </div>
              <div className="card-cta" style={{ color: '#1E40AF' }}>
                Open Tool
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </Link>

            {/* Card 2 – Office Dashboard */}
            <Link
              href="/office"
              className="tool-card"
              id="tool-card-office"
              aria-label="Office Dashboard"
            >
              <div
                className="card-icon-wrap"
                style={{ background: 'rgba(15, 76, 129, 0.08)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#0F4C81" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                  <line x1="6" y1="8" x2="6.01" y2="8" />
                  <line x1="10" y1="8" x2="18" y2="8" />
                  <line x1="6" y1="12" x2="6.01" y2="12" />
                  <line x1="10" y1="12" x2="18" y2="12" />
                </svg>
              </div>
              <span
                className="card-badge"
                style={{ background: '#F0F7FF', color: '#0F4C81' }}
              >
                Office
              </span>
              <div className="card-title">Office Dashboard</div>
              <div className="card-desc">
                Build proposals, annotate job site photos, and generate client contracts.
              </div>
              <div className="card-cta" style={{ color: '#0F4C81' }}>
                Open Tool
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </Link>

            {/* Card 3 – Field Walkthrough */}
            <Link
              href="/walkthrough-form"
              className="tool-card"
              id="tool-card-walkthrough"
              aria-label="Field Walkthrough"
            >
              <div
                className="card-icon-wrap"
                style={{ background: 'rgba(29, 78, 216, 0.08)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <span
                className="card-badge"
                style={{ background: '#EEF2FF', color: '#1D4ED8' }}
              >
                Field
              </span>
              <div className="card-title">Field Walkthrough</div>
              <div className="card-desc">
                Submit job site photos and project specs directly from the field.
              </div>
              <div className="card-cta" style={{ color: '#1D4ED8' }}>
                Open Tool
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </Link>

            {/* Card 4 – Field Tech Inbox */}
            <Link
              href="/field"
              className="tool-card"
              id="tool-card-field-inbox"
              aria-label="Field Tech Inbox"
            >
              <div
                className="card-icon-wrap"
                style={{ background: 'rgba(22, 163, 74, 0.08)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span
                className="card-badge"
                style={{ background: '#F0FDF4', color: '#16A34A' }}
              >
                Inbox
              </span>
              <div className="card-title">Tech Inbox</div>
              <div className="card-desc">
                View all pending walkthroughs assigned to the crew and jump straight into the job.
              </div>
              <div className="card-cta" style={{ color: '#16A34A' }}>
                Open Inbox
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </Link>

            {/* Card 5 – Quick Invoice */}
            <Link
              href="/Invoice"
              className="tool-card"
              id="tool-card-invoice"
              aria-label="Quick Invoice"
            >
              <div
                className="card-icon-wrap"
                style={{ background: 'rgba(13, 148, 136, 0.08)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <span
                className="card-badge"
                style={{ background: '#F0FDFA', color: '#0D9488' }}
              >
                BILLING
              </span>
              <div className="card-title">Quick Invoice</div>
              <div className="card-desc">
                Generate on-the-spot invoices, send digital payment links, and print paper receipts.
              </div>
              <div className="card-cta" style={{ color: '#0D9488' }}>
                Open Tool
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="hub-footer">
          <p>
            <strong>Page Concrete &amp; Outdoor Services</strong> &nbsp;·&nbsp; Internal Use Only &nbsp;·&nbsp; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </>
  )
}
