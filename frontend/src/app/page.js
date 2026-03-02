"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
// ARCHITECT NOTE: Importing dynamic from next/dynamic to prevent hydration mismatches
import dynamic from 'next/dynamic';
import { fetchPublicEvents } from '../services/api';

// ARCHITECT NOTE: Dynamically importing the named EncryptedText component and disabling SSR
const EncryptedText = dynamic(
    () => import('@/components/ui/encrypted-text').then((mod) => mod.EncryptedText),
    { ssr: false }
);

export default function GlobalPlatformHub() {
    const context = '[Global Platform Hub]';

    // State Management
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        console.log(`${context} Step 1: Global Platform Directory mounted. Fetching dynamic events...`);
        
        const loadEvents = async () => {
            try {
                const fetchedEvents = await fetchPublicEvents();
                setEvents(fetchedEvents);
                setError(null);
            } catch (err) {
                console.error(`${context} Failed to load events:`, err);
                setError('Unable to connect to the global ledger. Please verify your network connection.');
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    // Instantly filter events based on the search query
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (event.desc && event.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
        event.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center text-zinc-200 relative selection:bg-indigo-500/30 overflow-hidden">
            
            {/* Highly desaturated, elegant ambient glows */}
            <div className="absolute inset-0 pointer-events-none z-0 flex justify-center">
                <div className="absolute top-[-30%] w-[1000px] h-[800px] bg-white/[0.02] rounded-full filter blur-[100px]"></div>
                <div className="absolute top-[-20%] w-[600px] h-[500px] bg-indigo-500/[0.03] rounded-full filter blur-[120px]"></div>
            </div>

            {/* Seamless Top Navigation Bar */}
            <header className="w-full max-w-6xl flex items-center justify-between px-6 py-5 z-20">
                
                {/* Far Left: Brand Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px] tracking-tighter">
                        NX
                    </div>
                    <span className="font-semibold text-zinc-100 tracking-[0.2em] text-xs uppercase hidden sm:block">
                        Nexus
                    </span>
                </div>

                {/* Middle: Frosted Search Bar */}
                <div className="flex-1 max-w-md mx-6 relative group">
                    <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search active tenants..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] focus:border-indigo-500/30 focus:bg-white/[0.04] text-zinc-200 placeholder-zinc-600 text-sm rounded-full py-2.5 pl-11 pr-4 outline-none transition-all duration-300 backdrop-blur-md shadow-inner"
                    />
                </div>

                {/* Far Right: Admin Portal Pill */}
                <Link 
                    href="/admin/login" 
                    className="flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-zinc-400 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] px-4 py-2.5 rounded-full backdrop-blur-md"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="hidden sm:block">Vault Access</span>
                </Link>
            </header>

            {/* Main Content Pane */}
            <div className="max-w-5xl w-full z-10 flex flex-col items-center pb-8 pt-10 sm:pt-16 px-4 flex-grow">
                
                {/* Minimalist Hero Section */}
                <div className="text-center mb-20 space-y-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-tight min-h-[1.2em]">
                        {/* ARCHITECT NOTE: Safely rendered on the client side only */}
                        <EncryptedText
                            text="Global Event Ledger"
                            encryptedClassName="text-zinc-600 font-mono tracking-normal"
                            revealedClassName="text-white"
                            revealDelayMs={50} 
                        />
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-500 max-w-lg mx-auto font-normal leading-relaxed tracking-wide">
                        Secure, multi-tenant state management for enterprise conferences, global exhibitions, and exclusive summits.
                    </p>
                </div>

                {/* Free-Floating Public Event Directory */}
                <div className="w-full mb-8 flex flex-col">
                    
                    {/* Unboxed Minimalist Header */}
                    <div className="mb-6 px-2">
                        <h2 className="text-xs font-semibold text-zinc-500 tracking-[0.2em] uppercase">
                            Tenant Directory
                        </h2>
                    </div>

                    <div className="w-full flex-grow flex flex-col min-h-[300px]">
                        {loading ? (
                            <div className="flex-grow flex flex-col items-center justify-center">
                                <svg className="animate-spin h-6 w-6 text-zinc-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : error ? (
                            <div className="flex-grow flex items-center justify-center">
                                <div className="px-6 py-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-400/80 text-xs font-medium tracking-wide">
                                    {error}
                                </div>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="flex-grow flex items-center justify-center">
                                <div className="text-zinc-600 text-xs font-medium tracking-wide">
                                    No public tenants are currently actively routing.
                                </div>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="flex-grow flex flex-col items-center justify-center space-y-2">
                                <span className="text-zinc-500 text-sm">No results found for "{searchQuery}"</span>
                                <button onClick={() => setSearchQuery('')} className="text-indigo-400 hover:text-indigo-300 text-xs tracking-wide transition-colors">Clear search</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredEvents.map((event) => (
                                    // Floating Luma-style Card
                                    <div key={event.slug} className="bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 flex flex-col transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
                                        <div className="text-zinc-500 text-[10px] font-medium tracking-[0.15em] mb-2">{event.date || 'TBA'}</div>
                                        <h3 className="text-lg font-medium text-zinc-200 mb-2 leading-snug group-hover:text-white transition-colors">{event.title}</h3>
                                        <p className="text-zinc-500 text-xs mb-6 flex-grow leading-relaxed line-clamp-2">{event.desc || 'No description provided.'}</p>
                                        <Link 
                                            href={`/${event.slug}`} 
                                            className="w-full py-2.5 px-4 bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.05] rounded-full font-medium text-xs text-center transition-all duration-300 flex justify-center items-center text-zinc-300 hover:text-white"
                                        >
                                            Access Portal
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}