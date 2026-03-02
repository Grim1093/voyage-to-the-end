"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
// ARCHITECT NOTE: Traveling exactly 5 levels up to reach src/services/api
import { fetchEventDetails, updateEventDetails } from '../../../../../services/api';

export default function EditEventDeployment() {
    const params = useParams();
    const currentEventSlug = params.eventSlug;
    const context = `[Event Edit Console - ${currentEventSlug}]`;
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        eventDate: '',
        location: '',
        description: '',
        isPublic: true
    });

    const [status, setStatus] = useState('loading'); // loading, idle, submitting, success, error
    const [message, setMessage] = useState('');
    const [newSlug, setNewSlug] = useState(''); // Used for the success screen routing

    // Gatekeeper & Initial Data Fetch
    useEffect(() => {
        const validateGatekeeper = () => {
            const sessionString = sessionStorage.getItem('adminSession');
            if (!sessionString) {
                router.push('/admin/login');
                return false;
            }
            try {
                const sessionData = JSON.parse(sessionString);
                if (Date.now() > sessionData.expiresAt) {
                    sessionStorage.removeItem('adminSession');
                    router.push('/admin/login');
                    return false;
                }
                return true;
            } catch (error) {
                router.push('/admin/login');
                return false;
            }
        };

        const loadEventData = async () => {
            try {
                const data = await fetchEventDetails(currentEventSlug);
                setFormData({
                    name: data.title || '',
                    slug: data.slug || '',
                    eventDate: data.date || '',
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
        // Force URL-safe formatting if the admin decides to change the slug
        const safeSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, slug: safeSlug });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`${context} Step 1: Committing tenant update...`, formData);
        
        if (!formData.name || !formData.slug) {
            setStatus('error');
            setMessage('Event Name and URL Slug are strictly required.');
            return;
        }

        setStatus('submitting');
        try {
            const result = await updateEventDetails(currentEventSlug, formData);
            console.log(`${context} Step 2: Tenant updated successfully.`);
            setNewSlug(result.data.slug); // Save the (potentially new) slug for the success button
            setStatus('success');
            setMessage(`Tenant "${formData.name}" has been successfully updated.`);
        } catch (error) {
            console.error(`${context} Failure Point EV-Update: Update failed.`, error);
            setStatus('error');
            setMessage(error.message || 'Failed to update the event. If you changed the slug, it might already be taken.');
        }
    };

    if (status === 'loading') {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black p-6 flex flex-col items-center justify-center relative">
                <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-slate-500 font-mono text-sm tracking-widest uppercase">Accessing Ledger...</span>
            </main>
        );
    }

    if (status === 'success') {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-800/20 rounded-full filter blur-[120px] pointer-events-none"></div>
                
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-10 max-w-lg text-center shadow-2xl z-10">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Tenant Updated</h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {message} The changes are now live on the global network.
                    </p>
                    <div className="flex flex-col gap-4">
                        {/* We use newSlug just in case the Admin changed the URL! */}
                        <Link href={`/${newSlug}`} target="_blank" className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-md">
                            View Live Event Hub
                        </Link>
                        <Link href="/admin" className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-all">
                            Return to Command Center
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black p-6 md:p-10 relative overflow-hidden flex justify-center items-start pt-20">
            
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-800/10 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div className="max-w-2xl w-full z-10 relative">
                
                <div className="mb-8">
                    <Link href="/admin" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Master Control Plane
                    </Link>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-slate-700/50">
                    <div className="p-8 border-b border-slate-800/60 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-700/50">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Edit Tenant Configuration</h1>
                            <p className="text-slate-400 text-sm font-mono mt-1">Target: /{currentEventSlug}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {status === 'error' && (
                            <div className="p-4 bg-red-900/30 border-l-4 border-red-500 text-red-300 rounded-r-md backdrop-blur-sm text-sm">
                                {message}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Event Title *</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">URL Slug *</label>
                                <div className="flex bg-slate-950/50 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <span className="flex items-center px-4 bg-slate-800 text-slate-400 text-sm border-r border-slate-700 hidden sm:flex">
                                        platform.com/
                                    </span>
                                    <input 
                                        type="text" 
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleSlugChange}
                                        required
                                        className="w-full bg-transparent text-white px-4 py-3 focus:outline-none font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-amber-500/80 mt-2">Warning: Changing the slug will break existing links to this event.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Event Date</label>
                                    <input 
                                        type="text" 
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                                    <input 
                                        type="text" 
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                />
                            </div>

                            <div className="pt-2 border-t border-slate-800">
                                <label className="flex items-center cursor-pointer group mt-4">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleChange}
                                            className="sr-only" 
                                        />
                                        <div className={`block w-12 h-6 rounded-full transition-colors ${formData.isPublic ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isPublic ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                    <div className="ml-4">
                                        <span className="block text-sm font-medium text-slate-200">Public Visibility</span>
                                        <span className="block text-xs text-slate-500">{formData.isPublic ? 'Event will appear on the Global Platform Hub.' : 'Event requires a direct link to access (Private).'}</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
                            <Link 
                                href="/admin"
                                className="px-6 py-3 rounded-lg font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </Link>
                            <button 
                                type="submit" 
                                disabled={status === 'submitting'}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 flex items-center gap-2"
                            >
                                {status === 'submitting' ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Tenant'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}