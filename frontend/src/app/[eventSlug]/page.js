"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// ARCHITECT NOTE: Importing our dynamic fetcher
import { fetchEventDetails } from '../../services/api';

export default function EventHub() {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[Event Hub - ${eventSlug}]`;

    // State Management for Dynamic Event Data
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(`${context} Step 1: Event Hub mounted. Fetching details from ledger...`);
        
        const loadEvent = async () => {
            try {
                const data = await fetchEventDetails(eventSlug);
                setEvent(data);
                setError(null);
            } catch (err) {
                console.error(`${context} Failed to load event details:`, err);
                setError('We could not locate this event. It may be private, concluded, or the URL might be incorrect.');
            } finally {
                setLoading(false);
            }
        };

        if (eventSlug) loadEvent();
    }, [eventSlug, context]);

    // Render Loading State
    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
                <svg className="animate-spin h-10 w-10 text-blue-500/50 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-300 text-sm font-mono tracking-widest uppercase">Connecting to Event Node...</span>
            </main>
        );
    }

    // Render Error State
    if (error || !event) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 max-w-lg text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Event Unavailable</h1>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <Link href="/" className="inline-flex py-3 px-6 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors shadow-lg">
                        Return to Global Directory
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-950 flex flex-col items-center justify-center p-6 text-white overflow-x-hidden relative">

            {/* Ambient Background Glow Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-5xl w-full z-10 flex flex-col items-center py-8">

                {/* Navigation Breadcrumb */}
                <div className="mb-10 w-full flex justify-center">
                    <Link href="/" className="inline-flex items-center text-xs font-medium text-blue-300 hover:text-white transition-colors bg-blue-900/30 px-4 py-2 rounded-full border border-blue-700/50 backdrop-blur-md">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Global Directory
                    </Link>
                </div>

                {/* Event Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium tracking-wide">
                        Official Event Portal
                    </div>
                    {/* ARCHITECT NOTE: Dynamically injecting the database title */}
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 drop-shadow-lg pb-2">
                        {event.title}
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100/70 max-w-2xl mx-auto font-light">
                        {event.desc || `Welcome to the dedicated hub for ${event.title}. Please select an option below to proceed.`}
                    </p>
                    {/* Displaying extra metadata if available */}
                    {(event.date || event.location) && (
                        <div className="flex items-center justify-center gap-4 text-sm text-blue-200/50 mt-4 font-mono">
                            {event.date && <span>📅 {event.date}</span>}
                            {event.location && <span>📍 {event.location}</span>}
                        </div>
                    )}
                </div>

                {/* Navigation Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">

                    {/* Register Card */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:bg-white/15">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-400/30">
                            <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">New Attendees</h2>
                        <p className="text-blue-100/60 mb-8 flex-grow">Secure your spot at this event. Register your details and identity document for verification.</p>
                        <Link href={`/${eventSlug}/register`} className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-900/50">
                            Register Now
                        </Link>
                    </div>

                    {/* Guest Portal Card */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] hover:bg-white/15">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-400/30">
                            <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Guest Portal</h2>
                        <p className="text-blue-100/60 mb-8 flex-grow">Already registered? Track your verification status and view your event dashboard.</p>
                        <Link href={`/${eventSlug}/portal`} className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors shadow-lg shadow-purple-900/50">
                            Access Portal
                        </Link>
                    </div>

                </div>

                {/* Event Admin Link */}
                <div className="mt-16 text-center">
                    <Link href={`/${eventSlug}/admin/login`} className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        Event Admin Override
                    </Link>
                </div>

            </div>
        </main>
    );
}