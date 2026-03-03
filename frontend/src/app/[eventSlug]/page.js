"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchEventDetails } from '../../services/api';

// ARCHITECT NOTE: Dynamically importing the EncryptedText component to prevent hydration mismatches
const EncryptedText = dynamic(
    () => import('@/components/ui/encrypted-text').then((mod) => mod.EncryptedText),
    { ssr: false }
);

export default function EventHub() {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[Event Hub - ${eventSlug}]`;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const data = await fetchEventDetails(eventSlug);
                setEvent(data);
                setError(null);
            } catch (err) {
                console.error(`${context} Failed to load event details:`, err);
                setError('Event node not found in the global ledger.');
            } finally {
                setLoading(false);
            }
        };

        if (eventSlug) loadEvent();
    }, [eventSlug, context]);

    // ARCHITECT NOTE: Date formatting utility to handle the new start and end timestamps
    const formatEventTime = (start, end) => {
        if (!start && !end) return null;
        
        const opts = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
        
        if (start && end) {
            return `${new Date(start).toLocaleDateString('en-US', opts)} - ${new Date(end).toLocaleDateString('en-US', opts)}`;
        }
        if (start) return new Date(start).toLocaleDateString('en-US', opts);
        if (end) return `Until ${new Date(end).toLocaleDateString('en-US', opts)}`;
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 text-zinc-500">
                <svg className="animate-spin h-6 w-6 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </main>
        );
    }

    if (error || !event) {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 max-w-sm text-center backdrop-blur-xl">
                    <h1 className="text-lg font-medium text-zinc-200 mb-2">Access Denied</h1>
                    <p className="text-zinc-500 text-xs mb-6">{error}</p>
                    <Link href="/" className="inline-flex py-2 px-4 bg-white text-black rounded-full text-xs font-bold transition-all hover:bg-zinc-200">
                        Return to Ledger
                    </Link>
                </div>
            </main>
        );
    }

    const formattedDate = formatEventTime(event.start_date, event.end_date);

    // ARCHITECT NOTE: The Auto-Expiry Lock Screen
    if (event.is_expired) {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/[0.02] rounded-full filter blur-[150px] pointer-events-none"></div>
                
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[40px] p-12 max-w-md text-center backdrop-blur-2xl z-10 shadow-2xl">
                    <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/[0.08]">
                        <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h1 className="text-2xl font-medium text-white mb-2 tracking-tight">Event Concluded</h1>
                    <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                        The timeline for <span className="text-zinc-300 font-medium">{event.title}</span> has officially elapsed. The registration portal and guest hub are now securely locked.
                    </p>
                    <Link href="/" className="inline-flex w-full justify-center py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-zinc-300 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all">
                        Return to Global Directory
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center text-zinc-200 relative selection:bg-indigo-500/30 overflow-hidden">

            <div className="absolute inset-0 pointer-events-none z-0 flex justify-center">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full filter blur-[150px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full filter blur-[120px]" style={{ animationDelay: '2s' }}></div>
            </div>

            <header className="w-full max-w-6xl flex items-center justify-between px-6 py-5 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px] tracking-tighter">
                        NX
                    </div>
                    <span className="font-semibold text-zinc-100 tracking-[0.2em] text-xs uppercase">Nexus</span>
                </div>
                
                <Link href="/" className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase text-zinc-400 hover:text-white transition-colors bg-white/[0.02] border border-white/[0.05] px-4 py-2 rounded-full backdrop-blur-md">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Global Directory
                </Link>
            </header>

            <div className="max-w-4xl w-full z-10 flex flex-col items-center pb-12 pt-16 px-4">

                <div className="text-center mb-16 space-y-4">
                    {/* ARCHITECT NOTE: Theme re-calibration to match the monochromatic desaturated aesthetic */}
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-[10px] font-bold tracking-[0.15em] uppercase shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/[0.4] animate-pulse"></span>
                        Active Tenant Portal
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-tight min-h-[1.2em]">
                        <EncryptedText
                            text={event.title}
                            encryptedClassName="text-zinc-600 font-mono tracking-normal"
                            revealedClassName="text-white"
                            revealDelayMs={50} 
                        />
                    </h1>
                    <p className="text-sm text-zinc-500 max-w-lg mx-auto font-normal leading-relaxed tracking-wide">
                        {event.desc || `Accessing dynamic data for the ${event.title} node.`}
                    </p>
                    
                    {/* ARCHITECT NOTE: The Repaired Chronology Display */}
                    {(formattedDate || event.location) && (
                        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-zinc-400 mt-6 font-medium uppercase tracking-widest">
                            {formattedDate && (
                                <span className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] rounded-full border border-white/[0.05] shadow-inner">
                                    <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {formattedDate}
                                </span>
                            )}
                            {event.location && (
                                <span className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] rounded-full border border-white/[0.05] shadow-inner">
                                    <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {event.location}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Free-Floating Navigation Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    <div className="bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-8 flex flex-col items-center text-center transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
                        <div className="w-12 h-12 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/[0.08]">
                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        </div>
                        <h2 className="text-xl font-medium text-zinc-100 mb-3 tracking-tight">Register</h2>
                        <p className="text-zinc-500 text-xs mb-8 flex-grow leading-relaxed">Secure your clearance for this event. Submit your identity document for ledger verification.</p>
                        <Link href={`/${eventSlug}/register`} className="w-full py-2.5 px-4 bg-white text-black rounded-full font-bold text-[11px] uppercase tracking-wider transition-all hover:bg-zinc-200">
                            Start Registration
                        </Link>
                    </div>

                    <div className="bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-8 flex flex-col items-center text-center transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
                        <div className="w-12 h-12 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/[0.08]">
                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <h2 className="text-xl font-medium text-zinc-100 mb-3 tracking-tight">Portal</h2>
                        <p className="text-zinc-500 text-xs mb-8 flex-grow leading-relaxed">Already committed to the ledger? View your live verification state and event dashboard.</p>
                        <Link href={`/${eventSlug}/portal`} className="w-full py-2.5 px-4 bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.05] rounded-full font-bold text-[11px] uppercase tracking-wider transition-all text-zinc-200 hover:text-white">
                            Enter Portal
                        </Link>
                    </div>
                </div>

                

            </div>
        </main>
    );
}