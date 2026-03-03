"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchEventDetails, updateEventDetails, deleteEvent } from '../../../../../services/api';

export default function EditEventDeployment() {
    const params = useParams();
    const currentEventSlug = params.eventSlug;
    const context = `[Event Edit Console - ${currentEventSlug}]`;
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        isPublic: true
    });

    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('');
    const [newSlug, setNewSlug] = useState('');
    
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        const validateGatekeeper = () => {
            const sessionString = sessionStorage.getItem('adminSession');
            if (!sessionString) {
                router.push('/admin/login');
                return false;
            }
            return true;
        };

        const loadEventData = async () => {
            try {
                const data = await fetchEventDetails(currentEventSlug);
                
                // ARCHITECT NOTE: Timezone formatting for the native input
                // We must strip the 'Z' from the ISO string to prevent the browser 
                // from attempting to shift the time when populating the input field
                const formatForInput = (isoString) => {
                    if (!isoString) return '';
                    const date = new Date(isoString);
                    // Manually construct the local YYYY-MM-DDThh:mm format to bypass timezone shifts
                    const tzOffset = date.getTimezoneOffset() * 60000;
                    return (new Date(date - tzOffset)).toISOString().slice(0, 16);
                };

                setFormData({
                    name: data.title || '',
                    slug: data.slug || '',
                    startDate: formatForInput(data.start_date),
                    endDate: formatForInput(data.end_date),
                    location: data.location || '',
                    description: data.desc || '',
                    isPublic: data.is_public !== undefined ? data.is_public : true
                });
                setStatus('idle');
            } catch (error) {
                console.error(`${context} Failed to fetch event details.`, error);
                setStatus('error');
                setMessage('Could not load event data. It may have been deleted.');
            }
        };

        if (validateGatekeeper()) {
            loadEventData();
        }
    }, [currentEventSlug, router, context]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSlugChange = (e) => {
        const safeSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, slug: safeSlug });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.slug) {
            setStatus('error');
            setMessage('Event Name and URL Slug are strictly required.');
            return;
        }

        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) >= new Date(formData.endDate)) {
                setStatus('error');
                setMessage('The Start Time must be earlier than the End Time.');
                return;
            }
        }

        setStatus('submitting');
        try {
            // ARCHITECT NOTE: The Outgoing Timezone Lock
            // Re-wrapping the local browser time into an immutable UTC ISO string
            const payload = {
                ...formData,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
            };

            const result = await updateEventDetails(currentEventSlug, payload);
            setNewSlug(result.data.slug);
            setStatus('success');
            setMessage(`Tenant "${formData.name}" has been successfully updated.`);
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to update the event.');
        }
    };

    const handlePurge = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }

        setStatus('submitting');
        try {
            await deleteEvent(currentEventSlug);
            router.push('/admin'); 
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to purge the environment.');
            setIsConfirmingDelete(false);
        }
    };

    if (status === 'loading') {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 text-zinc-500">
                <svg className="animate-spin h-6 w-6 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </main>
        );
    }

    if (status === 'success') {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-zinc-200 relative">
                <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[40px] p-12 max-w-lg text-center shadow-2xl z-10">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-3xl font-medium text-white mb-4">Node Updated</h1>
                    <p className="text-zinc-500 mb-10 leading-relaxed text-sm tracking-wide">
                        {message} The environment changes have been committed to the global network.
                    </p>
                    <div className="flex flex-col gap-4">
                        <Link href={`/${newSlug}`} target="_blank" className="w-full py-4 px-6 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:bg-zinc-200">
                            View Live Hub
                        </Link>
                        <Link href="/admin" className="w-full py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-zinc-300 rounded-full font-bold text-xs uppercase tracking-widest transition-all">
                            Control Plane
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center text-zinc-200 relative selection:bg-indigo-500/30 overflow-hidden">
            <header className="w-full max-w-7xl flex items-center justify-between px-6 py-5 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-all">
                        <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-xs font-bold text-white tracking-[0.2em] uppercase">Edit Configuration</h1>
                        <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Target: /{currentEventSlug}</p>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl w-full z-10 relative px-6 pb-16 pt-8">
                <div className="bg-white/[0.01] backdrop-blur-xl rounded-[40px] border border-white/[0.05] overflow-hidden shadow-2xl">
                    <form onSubmit={handleSubmit} className="p-10 space-y-10">
                        {status === 'error' && (
                            <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400/80 text-xs font-medium rounded-2xl tracking-wide">
                                {message}
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Event Title</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm placeholder-zinc-700 shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">URL Slug</label>
                                <div className="flex bg-white/[0.02] border border-white/[0.05] rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
                                    <span className="flex items-center pl-6 pr-2 text-zinc-600 text-[10px] font-mono uppercase tracking-tight">
                                        node/
                                    </span>
                                    <input 
                                        type="text" 
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleSlugChange}
                                        required
                                        className="w-full bg-transparent text-white px-0 py-4 focus:outline-none font-mono text-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-amber-500/60 ml-4 italic">Changing this will break established network paths.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm shadow-inner [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm shadow-inner [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Location</label>
                                <input 
                                    type="text" 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-[32px] px-6 py-5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm resize-none shadow-inner"
                                />
                            </div>

                            <div className="pt-6 border-t border-white/[0.03]">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleChange}
                                            className="sr-only" 
                                        />
                                        <div className={`w-11 h-6 rounded-full transition-all duration-300 ${formData.isPublic ? 'bg-indigo-500/40' : 'bg-white/[0.05]'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${formData.isPublic ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <div className="ml-4">
                                        <span className="block text-xs font-semibold text-zinc-200 uppercase tracking-wider">Public Visibility</span>
                                        <span className="block text-[10px] text-zinc-500 tracking-wide">{formData.isPublic ? 'Broadcasting on Global Hub' : 'Restricted to link access'}</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/[0.03] flex flex-col sm:flex-row justify-between items-center gap-4">
                            
                            <button 
                                type="button"
                                onClick={handlePurge}
                                className={`px-6 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                                    isConfirmingDelete 
                                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse' 
                                    : 'bg-rose-500/5 border border-rose-500/20 text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-400'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                {isConfirmingDelete ? 'Confirm Purge' : 'Delete Node'}
                            </button>

                            <div className="flex items-center gap-6">
                                <Link 
                                    href="/admin"
                                    className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                                >
                                    Discard Changes
                                </Link>
                                <button 
                                    type="submit" 
                                    disabled={status === 'submitting'}
                                    className="px-8 py-4 bg-white hover:bg-zinc-200 text-black rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {status === 'submitting' ? 'Updating Node...' : 'Commit Updates'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}