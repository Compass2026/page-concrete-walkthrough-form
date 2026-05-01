import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProposalClient from './ProposalClient'

/* ── Types ──────────────────────────────────────────────────── */
export interface LineItem {
  description: string
  price: number
  quantity: number
}

export interface AnnotatedPhoto {
  url: string
  annotation_notes: string
}

export interface ProposalData {
  id: string
  created_at: string
  walkthrough_id: string
  line_items: LineItem[]
  grand_total: number
  status: string
}

export interface WalkthroughData {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  street_address: string
  city: string
  state: string
  postal_code: string | null
  project_type: string
  project_details: Record<string, unknown> | null
  notes: string | null
  /** Legacy plain-URL photos (pre-annotation feature) */
  job_photos: string[] | null
  /** New annotated photo objects with markup + notes */
  annotated_photos: AnnotatedPhoto[] | null
}

/* ── Data Fetching (Server Component) ───────────────────────── */
export const dynamic = 'force-dynamic'

async function getProposalData(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
  )

  // Fetch the proposal
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (proposalError || !proposal) return null

  // Fetch the linked walkthrough
  const { data: walkthrough, error: walkthroughError } = await supabase
    .from('walkthroughs')
    .select('*')
    .eq('id', proposal.walkthrough_id)
    .single()

  if (walkthroughError || !walkthrough) return null

  return {
    proposal: proposal as ProposalData,
    walkthrough: walkthrough as WalkthroughData,
  }
}

/* ── Page Component ─────────────────────────────────────────── */
export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getProposalData(id)

  if (!data) {
    notFound()
  }

  return <ProposalClient proposal={data.proposal} walkthrough={data.walkthrough} />
}

/* ── Metadata ───────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getProposalData(id)
  const name = data
    ? `${data.walkthrough.first_name} ${data.walkthrough.last_name}`
    : 'Customer'

  return {
    title: `Page Concrete Proposal — ${name}`,
    description:
      'Your personalized project proposal from Page Concrete & Outdoor Services. Review your line items and approve your deposit to get started.',
  }
}
