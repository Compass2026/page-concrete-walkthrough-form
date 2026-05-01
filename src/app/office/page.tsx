'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  Lock,
  Unlock,
  Inbox,
  Search,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Layers,
  Camera,
  ChevronRight,
  Sparkles,
  Plus,
  DollarSign,
  CreditCard,
  Receipt,
  ArrowRight,
  X,
  Eye,
  Calendar,
  Building2,
  Ruler,
  Hammer,
  Shield,
  Trash2,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import './office.css'

/* ─── Types ───────────────────────────────────────────────── */
interface Walkthrough {
  id: string
  created_at: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  address: string | null
  street_address: string
  city: string
  state: string
  country: string | null
  postal_code: string | null
  project_type: string
  project_details: Record<string, unknown> | null
  notes: string | null
  job_photos: string[]
}

interface LineItem {
  description: string
  price: number
  quantity: number
}

interface PricingFormValues {
  line_items: LineItem[]
}

/* ─── Helper: relative time ───────────────────────────────── */
function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isNew(dateStr: string): boolean {
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 24 * 60 * 60 * 1000 // less than 24 hours
}

/* ─── Project type color helpers ──────────────────────────── */
function projectTypeColor(type: string) {
  switch (type) {
    case 'Concrete': return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' }
    case 'Fencing':  return { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' }
    case 'Decking':  return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' }
    default:         return { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' }
  }
}

function projectTypeEmoji(type: string) {
  switch (type) {
    case 'Concrete': return '🪨'
    case 'Fencing':  return '🔩'
    case 'Decking':  return '🪵'
    default:         return '📋'
  }
}

/* ─── Format detail key ──────────────────────────────────── */
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                             */
/* ═══════════════════════════════════════════════════════════ */
export default function OfficePage() {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)
  const [walkthroughs, setWalkthroughs] = useState<Walkthrough[]>([])
  const [selected, setSelected] = useState<Walkthrough | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  /* ── Fetch walkthroughs ─────────────────────────────────── */
  useEffect(() => {
    if (!unlocked) return
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('walkthroughs')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Supabase error:', error)
      } else {
        setWalkthroughs((data ?? []) as Walkthrough[])
      }
      setLoading(false)
    }
    fetch()
  }, [unlocked])

  /* ── Filter walkthroughs by search ─────────────────────── */
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return walkthroughs
    const q = searchQuery.toLowerCase()
    return walkthroughs.filter(w =>
      `${w.first_name} ${w.last_name}`.toLowerCase().includes(q) ||
      w.street_address?.toLowerCase().includes(q) ||
      w.city?.toLowerCase().includes(q) ||
      w.project_type?.toLowerCase().includes(q)
    )
  }, [walkthroughs, searchQuery])

  /* ── Lock screen password handler ──────────────────────── */
  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === 'Page2026!') {
      setUnlocked(true)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPassword('')
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /*  LOCK SCREEN                                                */
  /* ═══════════════════════════════════════════════════════════ */
  if (!unlocked) {
    return (
      <div className="lock-backdrop">
        <div className="lock-grid-overlay" />
        <motion.div
          className={`lock-card ${shake ? 'shake' : ''}`}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/page-concrete-logo.png" alt="Page Concrete" className="lock-logo" />

          {/* Lock icon ring */}
          <div className="lock-icon-ring">
            <Lock size={22} strokeWidth={2} />
          </div>

          <h1 className="lock-title">Page Concrete</h1>
          <p className="lock-subtitle">Office Proposal Dashboard</p>

          <form onSubmit={handlePasswordSubmit} className="lock-form">
            <div className="lock-input-wrap">
              <Shield size={16} className="lock-input-icon" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter access code"
                className="lock-input"
                autoFocus
              />
            </div>
            <button type="submit" className="lock-btn">
              <Unlock size={18} />
              <span>Unlock Dashboard</span>
            </button>
          </form>

          <p className="lock-hint">Authorized personnel only</p>
        </motion.div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════ */
  /*  DASHBOARD                                                  */
  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="office-shell">
      {/* ── Top Bar ──────────────────────────────────────── */}
      <header className="office-topbar">
        <div className="topbar-left">
          <div className="topbar-logo-mark">P</div>
          <div>
            <h1 className="topbar-brand">Page Concrete</h1>
            <span className="topbar-sub">Proposal Dashboard</span>
          </div>
        </div>
        <div className="topbar-right">
          <span className="topbar-date">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="topbar-avatar">
            <User size={16} />
          </div>
        </div>
      </header>

      {/* ── 3-Column Layout ──────────────────────────────── */}
      <div className="office-columns">
        {/* ═══════════ LEFT PANEL — INBOX ═══════════ */}
        <aside className="panel panel-left">
          <div className="panel-header">
            <div className="panel-header-title">
              <Inbox size={18} />
              <span>Inbox</span>
            </div>
            <span className="panel-badge">{walkthroughs.length}</span>
          </div>

          {/* Search */}
          <div className="inbox-search-wrap">
            <Search size={15} className="inbox-search-icon" />
            <input
              type="text"
              placeholder="Search walkthroughs…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="inbox-search"
            />
          </div>

          {/* Walkthrough list */}
          <div className="inbox-list">
            {loading ? (
              <div className="inbox-loading">
                <div className="office-spinner" />
                <span>Loading walkthroughs…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="inbox-empty">
                <FileText size={32} strokeWidth={1.5} />
                <span>No walkthroughs found</span>
              </div>
            ) : (
              filtered.map(w => {
                const colors = projectTypeColor(w.project_type)
                const isActive = selected?.id === w.id
                return (
                  <motion.button
                    key={w.id}
                    className={`inbox-card ${isActive ? 'active' : ''}`}
                    onClick={() => setSelected(w)}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <div className="inbox-card-top">
                      <div className="inbox-card-name">
                        <User size={14} />
                        <span>{w.first_name} {w.last_name}</span>
                      </div>
                      {isNew(w.created_at) && (
                        <span className="inbox-badge-new">
                          <Sparkles size={10} />
                          New
                        </span>
                      )}
                    </div>
                    <div className="inbox-card-address">
                      <MapPin size={12} />
                      <span>{w.street_address}, {w.city}</span>
                    </div>
                    <div className="inbox-card-bottom">
                      <span
                        className="inbox-type-tag"
                        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        {projectTypeEmoji(w.project_type)} {w.project_type}
                      </span>
                      <span className="inbox-time">
                        <Clock size={11} />
                        {relativeTime(w.created_at)}
                      </span>
                    </div>
                    <ChevronRight size={16} className="inbox-card-chevron" />
                  </motion.button>
                )
              })
            )}
          </div>
        </aside>

        {/* ═══════════ MIDDLE PANEL — BLUEPRINT ═══════════ */}
        <main className="panel panel-middle">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                className="blueprint-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="blueprint-empty-icon">
                  <Eye size={40} strokeWidth={1.2} />
                </div>
                <h2>Select a Walkthrough</h2>
                <p>Choose a submission from the inbox to view its details, photos, and project specifications.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selected.id}
                className="blueprint-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Blueprint Header */}
                <div className="blueprint-hero">
                  <div className="blueprint-hero-left">
                    <h2 className="blueprint-hero-name">
                      {selected.first_name} {selected.last_name}
                    </h2>
                    <p className="blueprint-hero-address">
                      <MapPin size={14} />
                      {selected.street_address}, {selected.city}, {selected.state} {selected.postal_code}
                    </p>
                  </div>
                  <span
                    className="blueprint-type-badge"
                    style={{
                      background: projectTypeColor(selected.project_type).bg,
                      color: projectTypeColor(selected.project_type).text,
                      border: `1.5px solid ${projectTypeColor(selected.project_type).border}`
                    }}
                  >
                    {projectTypeEmoji(selected.project_type)} {selected.project_type}
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="blueprint-grid">
                  {/* Client Details Card */}
                  <div className="data-card">
                    <div className="data-card-header">
                      <User size={16} />
                      <span>Client Details</span>
                    </div>
                    <div className="data-card-body">
                      <div className="data-row">
                        <Phone size={14} className="data-row-icon" />
                        <div>
                          <span className="data-label">Phone</span>
                          <span className="data-value">{selected.phone}</span>
                        </div>
                      </div>
                      {selected.email && (
                        <div className="data-row">
                          <Mail size={14} className="data-row-icon" />
                          <div>
                            <span className="data-label">Email</span>
                            <span className="data-value">{selected.email}</span>
                          </div>
                        </div>
                      )}
                      <div className="data-row">
                        <MapPin size={14} className="data-row-icon" />
                        <div>
                          <span className="data-label">Full Address</span>
                          <span className="data-value">
                            {selected.street_address}
                            {selected.address && `, ${selected.address}`}
                            <br />
                            {selected.city}, {selected.state} {selected.postal_code}
                            {selected.country && ` · ${selected.country}`}
                          </span>
                        </div>
                      </div>
                      <div className="data-row">
                        <Calendar size={14} className="data-row-icon" />
                        <div>
                          <span className="data-label">Submitted</span>
                          <span className="data-value">
                            {new Date(selected.created_at).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Specs Card */}
                  <div className="data-card">
                    <div className="data-card-header">
                      <Layers size={16} />
                      <span>Project Specs</span>
                    </div>
                    <div className="data-card-body">
                      <div className="data-row">
                        <Building2 size={14} className="data-row-icon" />
                        <div>
                          <span className="data-label">Project Type</span>
                          <span className="data-value">{selected.project_type}</span>
                        </div>
                      </div>
                      {selected.project_details && Object.entries(selected.project_details)
                        .filter(([key]) => key !== 'project_type')
                        .map(([key, value]) => (
                          <div className="data-row" key={key}>
                            <Ruler size={14} className="data-row-icon" />
                            <div>
                              <span className="data-label">{formatKey(key)}</span>
                              <span className="data-value">{String(value)}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Notes Card */}
                  {selected.notes && (
                    <div className="data-card data-card-full">
                      <div className="data-card-header">
                        <FileText size={16} />
                        <span>Notes &amp; Remarks</span>
                      </div>
                      <div className="data-card-body">
                        <p className="data-notes">{selected.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Gallery */}
                {selected.job_photos && selected.job_photos.length > 0 && (
                  <div className="photo-gallery-section">
                    <div className="photo-gallery-header">
                      <Camera size={16} />
                      <span>Job Site Photos</span>
                      <span className="photo-count">{selected.job_photos.length} photos</span>
                    </div>
                    <div className="photo-gallery-grid">
                      {selected.job_photos.map((url, i) => (
                        <motion.button
                          key={i}
                          className="gallery-thumb"
                          onClick={() => setLightboxImg(url)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Site photo ${i + 1}`} loading="lazy" />
                          <div className="gallery-thumb-overlay">
                            <Eye size={18} />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ═══════════ RIGHT PANEL — PRICING ENGINE ═══════════ */}
        <PricingEngine selected={selected} />
      </div>

      {/* ── Lightbox Modal ───────────────────────────────── */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={() => setLightboxImg(null)}>
                <X size={20} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxImg} alt="Full size" className="lightbox-img" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  PRICING ENGINE — isolated component                        */
/* ═══════════════════════════════════════════════════════════ */
interface PricingEngineProps {
  selected: Walkthrough | null
}

interface Toast {
  type: 'success' | 'error'
  proposalId?: string
  message: string
}

function PricingEngine({ selected }: PricingEngineProps) {
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const { register, control, handleSubmit, reset } = useForm<PricingFormValues>({
    defaultValues: { line_items: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  })

  /* Live math via useWatch — re-renders only this component */
  const watchedItems = useWatch({ control, name: 'line_items' })

  const subtotal = (watchedItems ?? []).reduce((sum, item) => {
    const price = parseFloat(String(item?.price ?? 0)) || 0
    const qty   = parseFloat(String(item?.quantity ?? 1)) || 0
    return sum + price * qty
  }, 0)

  const grandTotal = subtotal // no tax for now

  function fmt(n: number) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  /* Dismiss toast after 12 seconds */
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 12000)
    return () => clearTimeout(t)
  }, [toast])

  async function onSubmit(data: PricingFormValues) {
    if (!selected) {
      setToast({ type: 'error', message: 'Please select a walkthrough from the inbox first.' })
      return
    }
    if (data.line_items.length === 0) {
      setToast({ type: 'error', message: 'Add at least one line item before generating a proposal.' })
      return
    }

    setSubmitting(true)
    try {
      const { data: inserted, error } = await supabase
        .from('proposals')
        .insert({
          walkthrough_id: selected.id,
          line_items: data.line_items,
          grand_total: grandTotal,
          status: 'pending',
        })
        .select('id')
        .single()

      if (error) throw error

      reset({ line_items: [] })
      setToast({
        type: 'success',
        proposalId: inserted.id,
        message: `Proposal created for ${selected.first_name} ${selected.last_name}!`,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setToast({ type: 'error', message: `Failed to create proposal: ${message}` })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <aside className="panel panel-right">
      <div className="panel-header">
        <div className="panel-header-title">
          <Receipt size={18} />
          <span>Pricing Engine</span>
        </div>
        {fields.length > 0 && (
          <span className="panel-badge">{fields.length} item{fields.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* ── Toast Notification ─────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`pe-toast pe-toast-${toast.type}`}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pe-toast-icon">
              {toast.type === 'success'
                ? <CheckCircle size={18} />
                : <AlertCircle size={18} />}
            </div>
            <div className="pe-toast-body">
              <p className="pe-toast-msg">{toast.message}</p>
              {toast.proposalId && (
                <a
                  href={`/proposal/${toast.proposalId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pe-toast-link"
                >
                  <ExternalLink size={13} />
                  View Proposal / Send to Client
                </a>
              )}
            </div>
            <button className="pe-toast-close" onClick={() => setToast(null)}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Walkthrough context chip ────────────────── */}
      {selected ? (
        <div className="pe-context-chip">
          <User size={13} />
          <span>{selected.first_name} {selected.last_name} · {selected.street_address}</span>
        </div>
      ) : (
        <div className="pe-context-chip pe-context-chip-empty">
          <Eye size={13} />
          <span>Select a walkthrough from the inbox</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="pricing-engine-form"
      >
        {/* ── Line Items ─────────────────────────────── */}
        <div className="pricing-content">
          <div className="pricing-section">
            <div className="pricing-section-header">
              <Hammer size={15} />
              <span>Line Items</span>
            </div>

            {/* Items list */}
            <div className="pe-items-list">
              <AnimatePresence initial={false}>
                {fields.length === 0 ? (
                  <motion.div
                    key="empty"
                    className="pricing-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DollarSign size={28} strokeWidth={1.2} />
                    <p>No line items yet</p>
                    <span>Add materials, labor, and services to build your estimate.</span>
                  </motion.div>
                ) : (
                  fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      className="pe-item-row"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      layout
                    >
                      {/* Description */}
                      <div className="pe-field pe-field-desc">
                        <label className="pe-label">Description</label>
                        <input
                          {...register(`line_items.${index}.description`)}
                          placeholder="e.g. Concrete pour, Labor..."
                          className="pe-input"
                        />
                      </div>

                      <div className="pe-field-row">
                        {/* Price */}
                        <div className="pe-field pe-field-price">
                          <label className="pe-label">Price ($)</label>
                          <div className="pe-input-icon-wrap">
                            <span className="pe-input-icon">$</span>
                            <input
                              {...register(`line_items.${index}.price`, { valueAsNumber: true })}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pe-input pe-input-has-icon"
                            />
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="pe-field pe-field-qty">
                          <label className="pe-label">Qty</label>
                          <input
                            {...register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                            type="number"
                            step="1"
                            min="1"
                            placeholder="1"
                            className="pe-input"
                          />
                        </div>

                        {/* Line total + remove */}
                        <div className="pe-field pe-field-total">
                          <label className="pe-label">Total</label>
                          <div className="pe-line-total">
                            <span className="pe-line-amount">
                              {fmt(
                                (parseFloat(String(watchedItems?.[index]?.price ?? 0)) || 0) *
                                (parseFloat(String(watchedItems?.[index]?.quantity ?? 1)) || 0)
                              )}
                            </span>
                            <button
                              type="button"
                              className="pe-remove-btn"
                              onClick={() => remove(index)}
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Add button — always visible */}
            <div className="pe-add-wrap">
              <button
                type="button"
                className="pe-add-btn"
                onClick={() => append({ description: '', price: 0, quantity: 1 })}
              >
                <Plus size={15} />
                Add Line Item
              </button>
            </div>
          </div>

          {/* ── Grand Total ─────────────────────────── */}
          <div className="pricing-section">
            <div className="pricing-section-header">
              <CreditCard size={15} />
              <span>Summary</span>
            </div>
            <div className="pricing-total-box">
              <div className="pricing-total-row">
                <span>Subtotal</span>
                <span className="pricing-amount">{fmt(subtotal)}</span>
              </div>
              <div className="pricing-total-divider" />
              <div className="pricing-total-row grand">
                <span>Grand Total</span>
                <motion.span
                  key={grandTotal.toFixed(2)}
                  className="pricing-amount pe-grand-total"
                  initial={{ scale: 1.08, color: '#2563eb' }}
                  animate={{ scale: 1, color: '#0f172a' }}
                  transition={{ duration: 0.35 }}
                >
                  {fmt(grandTotal)}
                </motion.span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Generate Button ─────────────────────── */}
        <div className="pricing-action-wrap">
          <button
            type="submit"
            className="pricing-generate-btn"
            disabled={submitting}
          >
            <div className="pricing-btn-glow" />
            <span className="pricing-btn-content">
              {submitting ? (
                <>
                  <div className="office-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  <span>Creating Proposal…</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>
                    Generate Contract<br />
                    <small>&amp; Payment Link</small>
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </aside>
  )
}
