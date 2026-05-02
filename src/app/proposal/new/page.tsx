import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import ProposalClient from "../[id]/ProposalClient";

export const dynamic = 'force-dynamic';

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>
}) {
  const { jobId } = await searchParams;

  let walkthroughData = {
    first_name: "",
    last_name: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    project_type: "",
    phone: "",
    email: "",
    notes: "",
    job_photos: [],
    annotated_photos: [],
  };

  if (jobId) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

    const { data: job } = await supabase
      .from('jobs')
      .select('first_name, last_name, street_address, city, state, postal_code, client_name, location_address')
      .eq('id', jobId)
      .single();

    if (job) {
      let firstName = job.first_name || '';
      let lastName = job.last_name || '';
      
      // Fallback to client_name if first_name/last_name are empty
      if (!firstName && !lastName && job.client_name) {
        const nameParts = job.client_name.trim().split(' ');
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          firstName = nameParts[0];
        }
      }

      let streetAddress = job.street_address || '';
      if (!streetAddress && job.location_address) {
        streetAddress = job.location_address;
      }

      walkthroughData = {
        ...walkthroughData,
        first_name: firstName,
        last_name: lastName,
        street_address: streetAddress,
        city: job.city || '',
        state: job.state || '',
        postal_code: job.postal_code || '',
      };
    }
  }

  const proposalData = {
    id: "new",
    created_at: new Date().toISOString(),
    grand_total: 0,
    line_items: [],
  };

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <ProposalClient proposal={proposalData as any} walkthrough={walkthroughData as any} />
    </Suspense>
  );
}
