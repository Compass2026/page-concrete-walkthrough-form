'use client';

import React, { useState, useEffect } from 'react';
import {
  Home, MessageSquare, Wrench, UserCircle, MapPin,
  HardHat, Camera, ClipboardList, Package, ArrowLeft,
  FileText, PhoneCall, CheckCircle2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface DatabaseJob {
  id: number;
  first_name: string | null;
  last_name: string | null;
  client_name: string | null;
  street_address: string | null;
  city: string | null;
  location_address: string | null;
  title: string | null;
  status: string | null;
}

export default function CrewDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState<{ id: number, client: string, address: string } | null>(null);
  const [jobs, setJobs] = useState<DatabaseJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {

      const { data, error } = await supabase
        .from('jobs')
        .select('id, first_name, last_name, client_name, street_address, city, location_address, title, status')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setJobs(data as DatabaseJob[]);
      }
      setLoadingJobs(false);
    };

    fetchJobs();
  }, []);

  const renderJobsView = () => {
    if (selectedJob) {
      return (
        <div className="p-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <button
            onClick={() => setSelectedJob(null)}
            className="flex items-center text-slate-500 mb-6 font-medium text-lg h-14"
          >
            <ArrowLeft className="w-6 h-6 mr-2" /> Back to Schedule
          </button>

          <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedJob.client}</h2>
            <div className="flex items-center text-slate-500 text-xl">
              <MapPin className="w-6 h-6 mr-2 text-blue-600 flex-shrink-0" />
              {selectedJob.address}
            </div>
          </div>

          {/* Slide to clock in */}
          <div className="bg-slate-200 rounded-full h-20 relative flex items-center justify-center mb-10 shadow-inner overflow-hidden">
            <div className="absolute left-2 top-2 bottom-2 w-16 bg-white rounded-full flex items-center justify-center shadow-md z-10 border border-slate-100">
              <HardHat className="w-8 h-8 text-emerald-500" strokeWidth={2.5} />
            </div>
            <span className="text-slate-400 font-bold tracking-widest text-lg ml-12 z-0 uppercase">Slide to Clock In</span>
          </div>

          <h3 className="font-bold text-slate-800 text-2xl mb-4">Job Actions</h3>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white border-2 border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4 active:bg-blue-50 transition-colors h-48">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <Camera className="w-10 h-10" />
              </div>
              <span className="font-bold text-slate-800 text-xl text-center leading-tight">Snap<br />Photo</span>
            </button>
            <button className="bg-white border-2 border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4 active:bg-emerald-50 transition-colors h-48">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                <ClipboardList className="w-10 h-10" />
              </div>
              <span className="font-bold text-slate-800 text-xl text-center leading-tight">Job<br />Notes</span>
            </button>
            <button className="bg-white border-2 border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4 active:bg-amber-50 transition-colors h-48">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
                <Package className="w-10 h-10" />
              </div>
              <span className="font-bold text-slate-800 text-xl text-center leading-tight">Log<br />Materials</span>
            </button>
            {/* Empty 4th slot to make the 2x2 grid look intentional */}
            <button className="bg-slate-100 border-2 border-slate-200 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 h-48 opacity-50 active:bg-slate-200 transition-colors">
              <div className="w-20 h-20 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="font-bold text-slate-500 text-xl text-center leading-tight">Complete<br />Job</span>
            </button>
          </div>
        </div>
      );
    }

    if (loadingJobs) {
      return (
        <div className="p-4 flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <div className="p-4 animate-in fade-in duration-300">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 px-1">Today's Schedule</h2>
        {jobs.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <p className="text-slate-400 text-lg font-medium">No jobs scheduled</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, index) => {
              const displayName = [job.first_name, job.last_name].filter(Boolean).join(' ') || job.client_name || 'Unknown Client';
              const displayAddress = [job.street_address, job.city].filter(Boolean).join(', ') || job.location_address || 'No address on file';

              const jobForSelected = { id: job.id, client: displayName, address: displayAddress };

              return (
                <div key={job.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-3xl text-slate-900 mb-2">{displayName}</h3>
                      {job.title && (
                        <p className="text-slate-500 text-base mb-1">{job.title}</p>
                      )}
                      <div className="flex items-center text-slate-500 text-xl">
                        <MapPin className="w-6 h-6 mr-2 flex-shrink-0 text-blue-500" />
                        <span className="truncate">{displayAddress}</span>
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-extrabold uppercase tracking-widest mb-6">
                      Up Next
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedJob(jobForSelected)}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-2xl py-6 rounded-2xl flex justify-center items-center shadow-lg shadow-blue-200/50 transition-colors"
                  >
                    Open Job
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderToolsView = () => (
    <div className="p-4 animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-slate-800 mb-8 px-1">Field Tools</h2>
      <div className="grid grid-cols-1 gap-5">
        <Link href="/walkthrough-form" className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-200 flex items-center justify-between active:bg-slate-50 transition-colors min-h-[120px]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
              <FileText className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-slate-900 mb-1">Walkthrough Form</h3>
              <p className="text-slate-500 text-lg">New estimate walkthrough</p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8 text-slate-300 flex-shrink-0" />
        </Link>

        <Link href="/intake" className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-200 flex items-center justify-between active:bg-slate-50 transition-colors min-h-[120px]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-slate-900 mb-1">New Lead Intake</h3>
              <p className="text-slate-500 text-lg">Submit a new customer lead</p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8 text-slate-300 flex-shrink-0" />
        </Link>
      </div>
    </div>
  );

  const renderInboxView = () => (
    <div className="p-8 h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
      <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center mb-8">
        <MessageSquare className="w-16 h-16 text-slate-400" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-3">No New Messages</h2>
      <p className="text-slate-500 text-xl max-w-xs">You're all caught up on communications with the office.</p>
    </div>
  );

  return (
    <div className="bg-black min-h-screen sm:py-8 sm:px-4">
      {/* Wrapper to simulate a mobile phone boundary on desktop */}
      <div className="max-w-md mx-auto min-h-screen sm:min-h-[850px] relative bg-slate-50 sm:rounded-[3rem] shadow-2xl overflow-hidden font-sans flex flex-col">

        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center shadow-md z-10 relative">
          <div>
            <h1 className="font-bold text-xl tracking-wider uppercase text-slate-300 mb-0.5 text-[0.65rem]">Page Concrete</h1>
            <h2 className="font-extrabold text-2xl text-white">FIELD OPS</h2>
          </div>
          <button className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center active:bg-slate-700 transition-colors">
            <UserCircle className="w-9 h-9 text-slate-300" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-[120px]">
          {activeTab === 'jobs' && renderJobsView()}
          {activeTab === 'inbox' && renderInboxView()}
          {activeTab === 'tools' && renderToolsView()}
        </div>

        {/* Bottom Tab Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-3 px-2 flex justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20 h-[100px]">
          <button
            onClick={() => { setActiveTab('jobs'); setSelectedJob(null); }}
            className={`flex flex-col items-center justify-center w-full ${activeTab === 'jobs' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-2xl mb-1 ${activeTab === 'jobs' ? 'bg-blue-50' : ''}`}>
              <Home className={`w-8 h-8 ${activeTab === 'jobs' ? 'fill-blue-100' : ''}`} strokeWidth={activeTab === 'jobs' ? 2.5 : 2} />
            </div>
            <span className={`text-sm ${activeTab === 'jobs' ? 'font-bold' : 'font-medium'}`}>My Jobs</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex flex-col items-center justify-center w-full ${activeTab === 'inbox' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-2xl mb-1 ${activeTab === 'inbox' ? 'bg-blue-50' : ''}`}>
              <MessageSquare className={`w-8 h-8 ${activeTab === 'inbox' ? 'fill-blue-100' : ''}`} strokeWidth={activeTab === 'inbox' ? 2.5 : 2} />
            </div>
            <span className={`text-sm ${activeTab === 'inbox' ? 'font-bold' : 'font-medium'}`}>Inbox</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex flex-col items-center justify-center w-full ${activeTab === 'tools' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-2xl mb-1 ${activeTab === 'tools' ? 'bg-blue-50' : ''}`}>
              <Wrench className={`w-8 h-8 ${activeTab === 'tools' ? 'fill-blue-100' : ''}`} strokeWidth={activeTab === 'tools' ? 2.5 : 2} />
            </div>
            <span className={`text-sm ${activeTab === 'tools' ? 'font-bold' : 'font-medium'}`}>Tools</span>
          </button>
        </div>
      </div>
    </div>
  );
}
