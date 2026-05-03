'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText, Camera, Clock, Plus, Check } from 'lucide-react';

const PIPELINE_STAGES = ['Lead', 'Walkthrough', 'Quoted', 'Scheduled', 'In Progress', 'Invoiced', 'Closed'];

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [job, setJob] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Fetch the specific job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError || !jobData) {
        setError(true);
        setLoading(false);
        return;
      }
      setJob(jobData);

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('job_id', id)
        .order('created_at', { ascending: false });

      if (!notesError && notesData) {
        setNotes(notesData);
      }

      setLoading(false);
    }
    
    fetchData();
  }, [id]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    const noteContent = newNote;
    const tempId = `temp-${Date.now()}`;
    const optimisticNote = {
      id: tempId,
      job_id: id,
      content: noteContent,
      created_at: new Date().toISOString(),
      author: 'Current User' // Placeholder for UI
    };

    setNotes(prev => [optimisticNote, ...prev]);
    setNewNote('');

    const { data, error: insertError } = await supabase
      .from('notes')
      .insert({ job_id: id, content: noteContent })
      .select()
      .single();

    if (!insertError && data) {
      setNotes(prev => prev.map(n => n.id === tempId ? data : n));
    } else {
      console.error("Failed to save note:", insertError);
      setNotes(prev => prev.filter(n => n.id !== tempId));
      setNewNote(noteContent);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    const oldStatus = job.status;
    
    // Optimistic UI update
    setJob((prev: any) => ({ ...prev, status: newStatus }));

    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error("Failed to update status:", error);
      // Revert on error
      setJob((prev: any) => ({ ...prev, status: oldStatus }));
      alert("Failed to update job status. Please try again.");
    }
  };

  const formatTimestamp = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
    const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
    return `${formattedDate} at ${formattedTime}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-sans">
        <div className="text-gray-500 font-medium">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-500 mb-6">We couldn't find the job you're looking for. It may have been deleted or the URL is incorrect.</p>
          <Link 
            href="/office" 
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = PIPELINE_STAGES.indexOf(job.status || 'Lead');

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back Link */}
        <div>
          <Link 
            href="/office" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Premium Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{job.job_title}</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 gap-3 sm:gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Client:</span> 
                {job.first_name ? `${job.first_name} ${job.last_name || ''}`.trim() : job.client_name}
              </div>
              <div className="hidden sm:block w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Location:</span> 
                {job.street_address ? [job.street_address, job.city, job.state].filter(Boolean).join(', ') : job.location_address}
              </div>
            </div>
          </div>
          
          {/* Pipeline Stepper */}
          <div className="w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0 -mx-2 px-2 xl:mx-0 xl:px-0">
            <div className="flex items-center min-w-max pt-2">
              {PIPELINE_STAGES.map((stage, index) => {
                const stageIndex = index;
                const isCompleted = stageIndex < currentStageIndex;
                const isCurrent = stageIndex === currentStageIndex;
                const isUpcoming = stageIndex > currentStageIndex;

                return (
                  <React.Fragment key={stage}>
                    {/* Node */}
                    <button 
                      onClick={() => handleStatusUpdate(stage)}
                      className={`relative flex flex-col items-center gap-2 group focus:outline-none shrink-0 ${isCurrent ? 'z-10' : ''}`}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm
                        ${isCompleted ? 'bg-green-500 text-white border-2 border-green-500 hover:bg-green-600' : ''}
                        ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-50 scale-110' : ''}
                        ${isUpcoming ? 'bg-white text-gray-400 border-2 border-gray-200 hover:border-gray-300 hover:text-gray-600' : ''}
                      `}>
                        {isCompleted ? (
                          <Check size={16} strokeWidth={3} />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`
                        text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors mt-1
                        ${isCompleted ? 'text-green-600' : ''}
                        ${isCurrent ? 'text-blue-700' : ''}
                        ${isUpcoming ? 'text-gray-400 group-hover:text-gray-600' : ''}
                      `}>
                        {stage}
                      </span>
                    </button>
                    
                    {/* Connecting Line */}
                    {index < PIPELINE_STAGES.length - 1 && (
                      <div className={`h-[2px] w-8 sm:w-10 md:w-12 mx-1 transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3-Column Grid Layout (The Spokes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Financials */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex flex-col min-h-[320px] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <FileText size={24} />
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Financials</h2>
              <p className="text-gray-500 mt-2 leading-relaxed">Manage quotes, invoices, and track payments for this project.</p>
            </div>
            <div className="mt-auto grid grid-cols-2 gap-3">
              <Link href={`/proposal/new?jobId=${id}`} className="w-full py-3 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center shadow-sm text-sm">
                <Plus size={16} className="mr-1.5 shrink-0" />
                Create Proposal
              </Link>
              <Link href={`/Invoice?jobId=${id}`} className="w-full py-3 px-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold transition-colors flex items-center justify-center shadow-sm text-sm group-hover:border-gray-300">
                <Plus size={16} className="mr-1.5 shrink-0" />
                Create Invoice
              </Link>
            </div>
          </div>

          {/* Card 2: Field Data & Photos */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex flex-col min-h-[320px] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <Camera size={24} />
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Field Data & Photos</h2>
              <p className="text-gray-500 mt-2 leading-relaxed">Review site conditions, photos, and completed walkthroughs.</p>
            </div>
            <div className="mt-auto">
              <Link href={`/walkthrough-form?jobId=${id}`} className="w-full py-3.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl font-semibold transition-colors flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100">
                View Walkthrough
              </Link>
            </div>
          </div>

          {/* Card 3: Time & Materials */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex flex-col min-h-[320px] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <Clock size={24} />
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Time & Materials</h2>
              <p className="text-gray-500 mt-2 leading-relaxed">Track team hours, resource usage, and material costs.</p>
            </div>
            <div className="mt-auto">
              <Link href="#" className="w-full py-3.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl font-semibold transition-colors flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100">
                View Time Logs
              </Link>
            </div>
          </div>

        </div>

        {/* Internal Notes & Activity */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Internal Notes & Activity</h2>
          
          {/* Input Area */}
          <div className="mb-10">
            <textarea 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none min-h-[120px]"
              placeholder="Type a new note or log activity..."
            ></textarea>
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleSaveNote}
                disabled={!newNote.trim()}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="relative">
            {notes.length > 0 && (
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-200"></div>
            )}
            
            <div className="space-y-8">
              {notes.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No notes or activity yet. Be the first to add one!
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="relative flex gap-6">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">
                        {note.author ? note.author.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    
                    {/* Note Content */}
                    <div className="flex-grow pt-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                        <span className="font-semibold text-gray-900">{note.author || 'User'}</span>
                        <span className="text-sm text-gray-500">{formatTimestamp(note.created_at)}</span>
                      </div>
                      <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 text-gray-700 border border-gray-100 mt-2 whitespace-pre-wrap">
                        {note.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
