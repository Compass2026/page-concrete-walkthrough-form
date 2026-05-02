"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Plus, Trash2, Send, FileText, ArrowLeft, Printer, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function InvoiceContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [requireDeposit, setRequireDeposit] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const fetchJobData = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('first_name, last_name, email, phone, street_address, city, state, postal_code, client_name, location_address')
        .eq('id', jobId)
        .single();
        
      if (!error && data) {
        setClientFirstName(data.first_name || (data.client_name ? data.client_name.split(' ')[0] : ''));
        setClientLastName(data.last_name || (data.client_name && data.client_name.split(' ').length > 1 ? data.client_name.split(' ').slice(1).join(' ') : ''));
        setStreetAddress(data.street_address || data.location_address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setPostalCode(data.postal_code || '');
        setClientEmail(data.email || '');
        setClientPhone(data.phone || '');
      }
    };
    fetchJobData();
  }, [jobId]);

  useEffect(() => {
    const searchClients = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsDropdownOpen(false);
        return;
      }
      
      setIsSearching(true);
      const { data, error } = await supabase
        .from('walkthroughs')
        .select('id, first_name, last_name, email, phone, street_address, city, state, postal_code')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(5);
        
      if (!error && data) {
        setSearchResults(data);
        setIsDropdownOpen(true);
      }
      setIsSearching(false);
    };

    const timer = setTimeout(() => {
      searchClients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectClient = (client: any) => {
    setClientFirstName(client.first_name || '');
    setClientLastName(client.last_name || '');

    setStreetAddress(client.street_address || '');
    setCity(client.city || '');
    setState(client.state || '');
    setPostalCode(client.postal_code || '');

    setClientEmail(client.email || '');
    setClientPhone(client.phone || '');
    setSearchQuery('');
    setIsDropdownOpen(false);
  };
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const grandTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const depositAmount = requireDeposit ? grandTotal * 0.5 : 0;
  const balanceDue = requireDeposit ? grandTotal * 0.5 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const stateZip = [state, postalCode].filter(Boolean).join(' ');
  const addressParts = [streetAddress, city, stateZip].filter(Boolean);
  const combinedAddress = addressParts.join(', ');

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      const { error } = await supabase
        .from('invoices')
        .insert([
          {
            first_name: clientFirstName,
            last_name: clientLastName,
            address: combinedAddress,
            email: clientEmail,
            phone: clientPhone,
            line_items: lineItems,
            total_amount: grandTotal,
            deposit_amount: requireDeposit ? depositAmount : 0,
            balance_due: requireDeposit ? balanceDue : 0
          }
        ]);
        
      if (error) throw error;
      
      // Fire and Forget Webhook Trigger
      try {
        fetch('https://services.leadconnectorhq.com/hooks/PLTocizoauUvHMW47HiN/webhook-trigger/7d9ec7db-485d-4c2a-9be6-e723f801053f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: clientFirstName,
            last_name: clientLastName,
            address: combinedAddress,
            street_address: streetAddress,
            city: city,
            state: state,
            postal_code: postalCode,
            email: clientEmail,
            phone: clientPhone,
            total_amount: grandTotal,
            deposit_amount: requireDeposit ? depositAmount : 0,
            balance_due: requireDeposit ? balanceDue : 0,
            line_items: lineItems,
          }),
        }).catch(err => console.error('Webhook error:', err));
      } catch (err) {
        console.error('Webhook synchronous error:', err);
      }
      
      setSubmitMessage({ type: 'success', text: 'Invoice Saved!' });
      setClientFirstName('');
      setClientLastName('');
      setStreetAddress('');
      setCity('');
      setState('');
      setPostalCode('');
      setClientEmail('');
      setClientPhone('');
      setLineItems([{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
      setRequireDeposit(false);
      setSearchQuery('');
      setIsDropdownOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      setSubmitMessage({ type: 'error', text: error.message || 'Failed to save invoice.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:py-0 print:bg-white text-slate-900 font-sans">
      <style>{`
        /* Screen: hide print-only nodes */
        .print-only { display: none; }

        @media print {
          @page { margin: 0.65in 0.75in; }

          /* Reveal print-only nodes */
          .print-only { display: block; }

          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          /* Hide all screen chrome */
          .print\\:hidden { display: none !important; }

          /* Root wrappers */
          .inv-root { padding: 0 !important; background: white !important; min-height: unset !important; }
          .inv-outer { max-width: none !important; padding: 0 !important; margin: 0 !important; }
          .inv-card  { box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; }
          .inv-body  { padding: 0 !important; }

          /* ── Header: logo LEFT, company RIGHT ── */
          .inv-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            background: white !important;
            color: #0f172a !important;
            padding: 0 0 20pt 0 !important;
            margin-bottom: 24pt !important;
            border-bottom: 1.5pt solid #0f172a !important;
          }
          .inv-header-left h1 {
            font-size: 28pt !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
            color: #0f172a !important;
            margin: 0 0 4pt 0 !important;
          }
          .inv-header-left p { color: #475569 !important; font-size: 10pt !important; margin: 0 !important; }
          .inv-header-right {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-end !important;
            gap: 8pt !important;
          }
          .inv-header-right img  { display: block !important; width: 140pt !important; height: auto !important; }
          .inv-header-right .inv-address {
            text-align: right !important;
            font-size: 9pt !important;
            color: #475569 !important;
            line-height: 1.55 !important;
            display: block !important;
          }

          /* ── Billed To ── */
          .inv-billed-to-heading {
            font-size: 8pt !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            color: #475569 !important;
            border-bottom: 1pt solid #0f172a !important;
            padding-bottom: 5pt !important;
            margin-bottom: 10pt !important;
          }
          .inv-client-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 16pt !important;
            margin-bottom: 24pt !important;
          }
          .inv-client-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; display: block; margin-bottom: 3pt; }
          .inv-client-value { font-size: 11pt; font-weight: 600; color: #0f172a; }

          /* ── Services Table ── */
          .inv-services-heading {
            font-size: 8pt !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            color: #475569 !important;
            border-bottom: 1pt solid #0f172a !important;
            padding-bottom: 5pt !important;
            margin-bottom: 0 !important;
          }
          .inv-print-table { width: 100% !important; border-collapse: collapse !important; margin-top: 0 !important; }
          .inv-print-table thead tr {
            background: #f1f5f9 !important;
          }
          .inv-print-table thead th {
            font-size: 7.5pt !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
            color: #475569 !important;
            padding: 6pt 8pt !important;
            text-align: left !important;
            border-bottom: 1pt solid #0f172a !important;
          }
          .inv-print-table thead th.right { text-align: right !important; }
          .inv-print-table tbody tr { border-bottom: 0.5pt solid #e2e8f0 !important; }
          .inv-print-table tbody tr:last-child { border-bottom: 1pt solid #0f172a !important; }
          .inv-print-table tbody td {
            font-size: 10pt !important;
            color: #0f172a !important;
            padding: 7pt 8pt !important;
            vertical-align: middle !important;
          }
          .inv-print-table tbody td.right { text-align: right !important; }

          /* ── Totals ── */
          .inv-totals {
            display: flex !important;
            justify-content: flex-end !important;
            margin-top: 14pt !important;
          }
          .inv-totals-inner { width: 44% !important; }
          .inv-totals-row {
            display: flex !important;
            justify-content: space-between !important;
            font-size: 10pt !important;
            color: #475569 !important;
            padding: 3pt 0 !important;
          }
          .inv-totals-grand {
            display: flex !important;
            justify-content: space-between !important;
            font-size: 13pt !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            padding: 8pt 0 0 0 !important;
            margin-top: 6pt !important;
            border-top: 2pt solid #0f172a !important;
          }

          /* ── Print footer ── */
          .inv-print-footer {
            display: block !important;
            margin-top: 32pt !important;
            text-align: center !important;
            font-size: 9pt !important;
            color: #94a3b8 !important;
            border-top: 0.5pt solid #e2e8f0 !important;
            padding-top: 12pt !important;
          }

          /* prevent awkward page breaks */
          .inv-card { break-inside: avoid !important; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 print:px-0 print:max-w-none inv-outer">
        
        {/* Navigation - Hidden in print */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Command Center
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex items-center text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Preview
          </button>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none inv-card">
          
          {/* Header — screen */}
          <div className="bg-slate-900 p-8 text-white flex justify-between items-start print:hidden">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8" />
                Invoice
              </h1>
              <p className="text-slate-300 font-medium">Page Concrete</p>
            </div>
            <div className="flex flex-col items-end">
               <div className="bg-white p-3 rounded-xl mb-4 shadow-sm">
                 <Image
                   src="/pageconcretenewlogo.png"
                   alt="Page Concrete Logo"
                   width={160}
                   height={80}
                   className="object-contain"
                   priority
                 />
               </div>
            </div>
          </div>

          {/* Header — print only: logo left, address right */}
          <div className="print-only inv-header">
            <div className="inv-header-left">
              <h1>Invoice</h1>
              <p>Page Concrete &amp; Outdoor Services</p>
            </div>
            <div className="inv-header-right">
              <Image
                src="/pageconcretenewlogo.png"
                alt="Page Concrete Logo"
                width={140}
                height={70}
                className="object-contain"
                priority
              />
              <span className="inv-address">
                123 Business Avenue, Suite 100<br />
                Cityville, ST 12345<br />
                (555) 123-4567
              </span>
            </div>
          </div>

          <div className="p-8 print:p-0 inv-body">
            {/* Client Details Section */}
            <div className="mb-10 print:mb-0">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100 inv-billed-to-heading">Billed To</h2>
              
              {/* Search Existing Client */}
              <div className="mb-6 relative print:hidden z-10">
                <label className="block text-sm font-medium text-slate-600 mb-1">Search Existing Client (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setIsDropdownOpen(true) }}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all"
                  />
                </div>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && searchResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                      {searchResults.map((client, index) => (
                        <li 
                          key={client.id || index}
                          onClick={() => handleSelectClient(client)}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <div className="font-medium text-slate-800">
                            {client.first_name} {client.last_name}
                          </div>
                          <div className="text-sm text-slate-500 flex justify-between mt-1">
                            <span>{client.email || 'No email'}</span>
                            <span>{client.phone || 'No phone'}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Screen inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-0 print:hidden mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">First Name</label>
                  <input
                    type="text"
                    value={clientFirstName}
                    onChange={(e) => setClientFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={clientLastName}
                    onChange={(e) => setClientLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-0 print:hidden mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-6 relative z-0 print:hidden mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Dallas"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1">State</label>
                    <div className="relative">
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all appearance-none pr-10 cursor-pointer"
                      >
                        <option value="">—</option>
                        {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="75201"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Print-only client block */}
              <div className="print-only inv-client-grid">
                <div>
                  <span className="inv-client-label">Client Name</span>
                  <span className="inv-client-value">{(clientFirstName || clientLastName) ? `${clientFirstName} ${clientLastName}`.trim() : '—'}</span>
                  {combinedAddress && (
                    <span className="block mt-1 text-[10pt] text-slate-600">{combinedAddress}</span>
                  )}
                </div>
                <div>
                  <span className="inv-client-label">Email</span>
                  <span className="inv-client-value">{clientEmail || '—'}</span>
                </div>
                <div>
                  <span className="inv-client-label">Phone</span>
                  <span className="inv-client-value">{clientPhone || '—'}</span>
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="print:hidden">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 print:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-800 print:text-xl print:font-bold print:uppercase print:tracking-wider">Services Rendered</h2>
                <button 
                  onClick={addLineItem}
                  className="flex items-center text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors print:hidden"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>

              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-slate-500 px-2 print:grid print:bg-slate-100 print:text-slate-700 print:py-2 print:uppercase print:text-xs">
                <div className="col-span-6 md:col-span-7 print:col-span-7 pl-2">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-1 md:col-span-1 print:col-span-2 text-right pr-2">Total</div>
                <div className="col-span-1 print:hidden"></div>
              </div>

              {/* Line Items List */}
              <div className="space-y-3 print:space-y-0">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="group flex flex-col md:grid md:grid-cols-12 gap-4 items-center bg-white border border-slate-200 rounded-xl p-4 md:p-2 md:border-transparent md:hover:bg-slate-50 transition-colors print:grid print:p-2 print:border-b print:border-slate-200 print:rounded-none">
                    
                    <div className="w-full md:col-span-7 print:col-span-7">
                      <label className="md:hidden text-xs text-slate-500 mb-1 block print:hidden">Description</label>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Service description..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all print:p-0 print:border-none print:bg-transparent print:text-slate-800"
                      />
                    </div>
                    
                    <div className="w-full grid grid-cols-2 gap-4 md:contents print:contents">
                      <div className="w-full md:col-span-2 text-right">
                        <label className="md:hidden text-xs text-slate-500 mb-1 block print:hidden">Qty</label>
                        <input 
                          type="number" 
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-right bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all print:p-0 print:border-none print:bg-transparent print:text-slate-800"
                        />
                      </div>
                      
                      <div className="w-full md:col-span-2 text-right">
                        <label className="md:hidden text-xs text-slate-500 mb-1 block print:hidden">Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 print:hidden">$</span>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 text-right bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all print:p-0 print:border-none print:bg-transparent print:pl-0 print:text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-center md:col-span-1 md:justify-end text-right font-medium text-slate-700 print:col-span-2 print:justify-end print:block print:text-slate-800">
                      <span className="md:hidden text-sm text-slate-500 print:hidden">Total:</span>
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                    
                    <div className="hidden md:flex col-span-1 justify-center print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Mobile delete button */}
                    <button 
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="w-full md:hidden flex items-center justify-center py-2 mt-2 text-sm text-red-500 bg-red-50 rounded-lg print:hidden disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Item
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Print-only services table — perfect column alignment */}
            <div className="print-only">
              <h2 className="inv-services-heading">Services Rendered</h2>
              <table className="inv-print-table">
                <thead>
                  <tr>
                    <th style={{width:'55%'}}>Description</th>
                    <th className="right" style={{width:'12%'}}>Qty</th>
                    <th className="right" style={{width:'18%'}}>Unit Price</th>
                    <th className="right" style={{width:'15%'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description || '—'}</td>
                      <td className="right">{item.quantity}</td>
                      <td className="right">{formatCurrency(item.unitPrice)}</td>
                      <td className="right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print-only totals */}
            <div className="print-only">
              <div className="inv-totals">
                <div className="inv-totals-inner">
                  <div className="inv-totals-row"><span>Subtotal</span><span>{formatCurrency(grandTotal)}</span></div>
                  <div className="inv-totals-row"><span>Tax (0%)</span><span>$0.00</span></div>
                  <div className="inv-totals-grand"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
                  {requireDeposit && (
                    <>
                      <div className="inv-totals-row" style={{marginTop:'8pt', paddingTop:'6pt', borderTop:'1pt solid #e2e8f0'}}>
                        <span style={{fontWeight:700, color:'#0f172a'}}>Deposit Due (50%)</span>
                        <span style={{fontWeight:700, color:'#0f172a'}}>{formatCurrency(depositAmount)}</span>
                      </div>
                      <div className="inv-totals-row">
                        <span>Remaining Balance</span>
                        <span>{formatCurrency(balanceDue)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="print-only inv-print-footer">
              Thank you for your business. Please remit payment within 30 days.
            </div>

            {/* Totals Section — screen only */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col items-end print:hidden">
              {/* Deposit Toggle */}
              <div className="w-full md:w-1/3 mb-4">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={requireDeposit}
                      onChange={(e) => setRequireDeposit(e.target.checked)}
                      className="sr-only peer"
                      id="deposit-toggle"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-checked:bg-slate-800 rounded-full transition-colors duration-200"></div>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    Require 50% Upfront Deposit
                  </span>
                </label>
              </div>

              <div className="w-full md:w-1/3 space-y-3">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xl font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                {requireDeposit && (
                  <div className="pt-3 border-t border-dashed border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-base font-bold text-slate-900">
                      <span>Deposit Due (50%)</span>
                      <span className="text-slate-800">{formatCurrency(depositAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Remaining Balance</span>
                      <span>{formatCurrency(balanceDue)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Screen footer spacer (print footer handled above) */}

            {/* Action Buttons - Hidden in Print */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-end print:hidden">
              {submitMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium ${submitMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {submitMessage.text}
                </div>
              )}
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-slate-900/20 transition-all hover:shadow-slate-900/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:shadow-none disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isSubmitting ? 'Saving...' : 'Generate & Send Invoice'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-medium">Loading invoice generator...</p>
        </div>
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
}
