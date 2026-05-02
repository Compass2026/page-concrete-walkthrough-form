'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText, Camera, Clock, Plus } from 'lucide-react';

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
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{job.job_title}</h1>
              <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                {job.status}
              </span>
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
          
          {/* Optional actions placeholder in header */}
          <div className="shrink-0 flex gap-3">
            <button className="flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-xl font-medium transition-all shadow-sm text-sm">
              Edit Job
            </button>
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
