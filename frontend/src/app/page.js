"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchPublicEvents } from '../services/api';

export default function GlobalPlatformHub() {
    const context = '[Global Platform Hub]';

    // State Management for Dynamic Events
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(`${context} Step 1: Global Platform Directory mounted. Fetching dynamic events...`);
        
        const loadEvents = async () => {
            try {
                const fetchedEvents = await fetchPublicEvents();
                setEvents(fetchedEvents);
                setError(null);
            } catch (err) {
                console.error(`${context} Failed to load events:`, err);
                setError('Unable to connect to the global ledger. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    return (
        // ARCHITECT NOTE: Removed overflow-x-hidden from main
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-black flex flex-col items-center justify-center p-6 sm:p-10 text-white relative">
            
            {/* ARCHITECT NOTE: Safely contained the glow effects to prevent double scrollbars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[128px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-6xl w-full z-10 flex flex-col items-center py-8">
                
                {/* Platform Hero Section */}
                <div className="text-center mb-14 space-y-4">
                    <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-bold tracking-widest uppercase shadow-sm">
                        Nexus MICE Architecture
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-500 drop-shadow-lg pb-2">
                        Event Registration Platform
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
                        Secure, multi-tenant ledger management for enterprise conferences, incentives, and global exhibitions.
                    </p>
                </div>

                {/* Public Event Directory */}
                <div className="w-full mb-12 min-h-[300px] flex flex-col">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
                        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-3">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Upcoming Public Events
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex-grow flex flex-col items-center justify-center">
                            <svg className="animate-spin h-10 w-10 text-blue-500/50 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-slate-500 text-sm font-mono tracking-widest uppercase">Syncing Ledger...</span>
                        </div>
                    ) : error ? (
                        <div className="flex-grow flex items-center justify-center p-6 bg-red-900/10 border border-red-900/50 rounded-2xl text-red-400 text-center">
                            {error}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="flex-grow flex items-center justify-center p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 text-center italic">
                            No public events are currently scheduled.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <div key={event.slug} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_10px_30px_-15px_rgba(59,130,246,0.3)]">
                                    <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">{event.date || 'TBA'}</div>
                                    <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                                    <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">{event.desc || 'No description provided.'}</p>
                                    <Link 
                                        href={`/${event.slug}`} 
                                        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 rounded-lg font-semibold text-sm text-center transition-all flex justify-center items-center gap-2 group"
                                    >
                                        Enter Event Hub
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Platform Administration Section */}
                <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mx-auto">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-700 shadow-inner">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-200">Platform Administration</h3>
                            <p className="text-xs text-slate-500">Access the secure master ledger vault. Authorized personnel only.</p>
                        </div>
                    </div>
                    <Link 
                        href="/admin/login" 
                        className="py-2.5 px-5 bg-transparent hover:bg-slate-800 border border-slate-600 rounded-lg text-sm font-semibold text-slate-300 transition-colors whitespace-nowrap shadow-sm w-full sm:w-auto text-center"
                    >
                        System Override
                    </Link>
                </div>

            </div>
        </main>
    );
}