'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Settings, 
  Search, 
  Bell, 
  User,
  Check,
  DollarSign,
  CreditCard,
  TrendingUp,
  Activity,
  Plus,
  Inbox,
  ClipboardCheck,
  Receipt
} from 'lucide-react'

type JobStage = 'Lead' | 'Walkthrough' | 'Quoted' | 'Scheduled' | 'In Progress' | 'Invoiced'

interface DatabaseJob {
  id: string
  job_title: string
  client_name: string
  location_address: string
  status: JobStage
  amount?: string
}

const STAGES: JobStage[] = ['Lead', 'Walkthrough', 'Quoted', 'Scheduled', 'In Progress', 'Invoiced']

export default function OfficeDashboard() {
  const [jobs, setJobs] = useState<DatabaseJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_title, client_name, location_address, status')
        .order('created_at', { ascending: false })
      
      if (data) {
        setJobs(data as DatabaseJob[])
      }
      setLoading(false)
    }
    
    fetchJobs()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 font-sans overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg mr-3 shadow-sm">
            P
          </div>
          <span className="font-semibold text-lg tracking-wide text-white">Page Concrete</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <a href="#" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <LayoutDashboard size={18} className="mr-3 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium text-sm">Dashboard</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg transition-colors shadow-md shadow-blue-900/20">
            <Briefcase size={18} className="mr-3" />
            <span className="font-medium text-sm">Active Jobs</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <FileText size={18} className="mr-3 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium text-sm">Invoices</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <Settings size={18} className="mr-3 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium text-sm">Settings</span>
          </a>

          <div className="pt-6 pb-2 px-4">
            <p className="text-xs font-semibold text-slate-500 tracking-wider">TOOLS</p>
          </div>
          <a href="/intake" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <Inbox size={18} className="mr-3 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium text-sm">Lead Intake</span>
          </a>
          <a href="/walkthrough-form" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <ClipboardCheck size={18} className="mr-3 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium text-sm">Walkthrough</span>
          </a>
          <a href="/Invoice" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group">
            <Receipt size={18} className="mr-3 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium text-sm">Quick Invoice</span>
          </a>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-4 py-3 text-xs text-slate-500">
            <span>© 2026 Page Concrete</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
          <div className="flex items-center w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search jobs, clients, or invoices..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-5">
            <a href="/intake" className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus size={16} className="mr-2" />
              Create New
            </a>
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm cursor-pointer border-2 border-white ring-2 ring-gray-100 hover:ring-blue-200 transition-all">
              <User size={14} />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Active Jobs</h1>
              <p className="text-sm text-gray-500 mt-1">Track and manage your pipeline across all stages.</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Card 1: Total Pipeline Value */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Pipeline Value</h3>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">$45,000</div>
                  <div className="flex items-center mt-1 text-xs">
                    <span className="text-emerald-600 font-medium flex items-center">
                      <TrendingUp size={12} className="mr-1" /> +12%
                    </span>
                    <span className="text-gray-400 ml-1.5">from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Outstanding A/R */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Outstanding A/R</h3>
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <CreditCard size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">$12,500</div>
                  <div className="flex items-center mt-1 text-xs">
                    <span className="text-amber-600 font-medium flex items-center">
                      <TrendingUp size={12} className="mr-1 rotate-180" /> -2%
                    </span>
                    <span className="text-gray-400 ml-1.5">from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 3: YTD Revenue */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">YTD Revenue</h3>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">$128,000</div>
                  <div className="flex items-center mt-1 text-xs">
                    <span className="text-emerald-600 font-medium flex items-center">
                      <TrendingUp size={12} className="mr-1" /> +24%
                    </span>
                    <span className="text-gray-400 ml-1.5">from last year</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Active Jobs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Briefcase size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="flex items-center mt-1 text-xs">
                    <span className="text-emerald-600 font-medium flex items-center">
                      <Activity size={12} className="mr-1" /> +3
                    </span>
                    <span className="text-gray-400 ml-1.5">new this week</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PIPELINE TABLE CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6 w-1/4">Job Details</th>
                      <th className="py-4 px-6 w-1/6">Amount</th>
                      <th className="py-4 px-6 w-[45%]">Pipeline Progress</th>
                      <th className="py-4 px-6 text-right w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-sm text-gray-500">
                          Loading jobs...
                        </td>
                      </tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <Briefcase size={20} className="text-gray-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">No active jobs found</h3>
                            <p className="text-sm text-gray-500 mt-1">Create a new lead to get started.</p>
                          </div>
                        </td>
                      </tr>
                    ) : jobs.map((job) => {
                      const currentStageIndex = STAGES.indexOf(job.status);
                      
                      return (
                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                          {/* Details Column */}
                          <td className="py-6 px-6 align-top">
                            <div className="font-semibold text-gray-900 text-sm">{job.client_name}</div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                              <span className="truncate max-w-[200px]" title={job.id}>{job.id}</span>
                              <span className="text-gray-400">{job.job_title}</span>
                            </div>
                          </td>
                          
                          {/* Amount Column */}
                          <td className="py-6 px-6 align-top">
                            <div className="font-medium text-gray-700 text-sm bg-gray-100 inline-flex px-2 py-1 rounded-md">{job.amount || 'TBD'}</div>
                          </td>
                          
                          {/* Pipeline Column */}
                          <td className="py-6 px-6">
                            <div className="flex items-center w-full max-w-[500px]">
                              {STAGES.map((stage, index) => {
                                const isCompleted = index < currentStageIndex;
                                const isCurrent = index === currentStageIndex;
                                const isFuture = index > currentStageIndex;
                                
                                return (
                                  <React.Fragment key={stage}>
                                    <div className="relative flex flex-col items-center group/step shrink-0">
                                      {/* Node */}
                                      <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-all duration-300
                                        ${isCompleted ? 'bg-teal-500 text-white shadow-sm' : ''}
                                        ${isCurrent ? 'bg-blue-600 text-white ring-[3px] ring-blue-100 shadow-sm' : ''}
                                        ${isFuture ? 'bg-white border-[1.5px] border-gray-200 text-gray-400' : ''}
                                      `}>
                                        {isCompleted ? <Check size={12} strokeWidth={3} /> : (index + 1)}
                                      </div>
                                      
                                      {/* Label */}
                                      <div className={`
                                        absolute top-8 text-[10px] font-medium text-center w-24 -ml-12 left-1/2 transition-colors
                                        ${isCompleted ? 'text-teal-700' : ''}
                                        ${isCurrent ? 'text-blue-700 font-bold' : ''}
                                        ${isFuture ? 'text-gray-400' : ''}
                                      `}>
                                        {stage}
                                      </div>
                                    </div>
                                    
                                    {/* Connector Line */}
                                    {index < STAGES.length - 1 && (
                                      <div className="flex-1 h-[2px] mx-1.5 transition-all duration-300 bg-gray-200 rounded-full relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${isCompleted ? 'bg-teal-500 w-full' : 'w-0'}`}></div>
                                      </div>
                                    )}
                                  </React.Fragment>
                                )
                              })}
                            </div>
                            <div className="h-5"></div> {/* Spacer to accommodate absolute positioned labels */}
                          </td>
                          
                          {/* Actions Column */}
                          <td className="py-6 px-6 text-right align-top">
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
