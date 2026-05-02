import { Suspense } from "react";
import ProposalClient from "../[id]/ProposalClient";

const emptyProposal = {
  id: "",
  created_at: new Date().toISOString(),
  grand_total: 0,
  line_items: [],
};

const emptyWalkthrough = {
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

export default function NewProposalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <ProposalClient proposal={emptyProposal as any} walkthrough={emptyWalkthrough as any} />
    </Suspense>
  );
}
