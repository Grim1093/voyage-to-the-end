"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { fetchPublicEvents } from '../services/api';
import { InteractiveAura } from '@/components/ui/interactive-aura';

const EncryptedText = dynamic(
    () => import('@/components/ui/encrypted-text').then((mod) => mod.EncryptedText),
    { ssr: false }
);

// ARCHITECTURE: Global Ambient Aurora Background
const AmbientAurora = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px]"
        />
        <motion.div
            animate={{ x: [0, -100, 50, 0], y: [0, 100, -50, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-violet-500/10 blur-[120px]"
        />
        <motion.div
            animate={{ x: [0, 50, -100, 0], y: [0, -100, 50, 0], scale: [1, 1.2, 0.8, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-fuchsia-500/10 blur-[120px]"
        />
    </div>
);

export default function GlobalPlatformHub() {
    const context = '[Global Platform Hub]';

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const fetchedEvents = await fetchPublicEvents();
                setEvents(fetchedEvents);
                setError(null);
            } catch (err) {
                console.error(`${context} Failed to load events:`, err);
                setError('Unable to connect to the global ledger.');
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, []);

    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const featuredNodes = filteredEvents.slice(0, 5);
    const ledgerNodes = filteredEvents.slice(5);

    const formatLedgerDate = (dateString) => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Mapped Aura and Dynamic Holographic Beam Colors
    const nodeConfigs = [
        { pos: '-top-32 -right-32', bg: 'bg-indigo-500/15', duration: '7s', holo: 'via-indigo-400/20', shadow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' },
        { pos: '-bottom-32 -left-32', bg: 'bg-violet-500/10', duration: '5s', holo: 'via-violet-400/20', shadow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]' },
        { pos: '-top-32 -left-32', bg: 'bg-fuchsia-500/10', duration: '8s', holo: 'via-fuchsia-400/20', shadow: 'hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]' },
        { pos: '-bottom-32 -right-32', bg: 'bg-blue-500/10', duration: '6s', holo: 'via-blue-400/20', shadow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
        { pos: 'top-0 right-1/4', bg: 'bg-indigo-500/10', duration: '9s', holo: 'via-indigo-400/20', shadow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' }
    ];

    const ledgerColors = [
        { border: 'hover:border-l-indigo-500', sweep: 'from-indigo-500/[0.03]', text: 'group-hover:text-indigo-400' },
        { border: 'hover:border-l-violet-500', sweep: 'from-violet-500/[0.03]', text: 'group-hover:text-violet-400' },
        { border: 'hover:border-l-fuchsia-500', sweep: 'from-fuchsia-500/[0.03]', text: 'group-hover:text-fuchsia-400' },
        { border: 'hover:border-l-blue-500', sweep: 'from-blue-500/[0.03]', text: 'group-hover:text-blue-400' },
        { border: 'hover:border-l-emerald-500', sweep: 'from-emerald-500/[0.03]', text: 'group-hover:text-emerald-400' },
        { border: 'hover:border-l-cyan-500', sweep: 'from-cyan-500/[0.03]', text: 'group-hover:text-cyan-400' },
    ];

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <main className="min-h-screen flex flex-col items-center text-zinc-200 relative selection:bg-indigo-500/30 overflow-hidden bg-[#09090b]">
            
            <AmbientAurora />
            <InteractiveAura />

            <header className="w-full max-w-7xl flex items-center justify-between px-6 py-6 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px] tracking-tighter">
                        NX
                    </div>
                    <span className="font-semibold text-zinc-100 tracking-[0.2em] text-xs uppercase hidden sm:block">
                        Nexus
                    </span>
                </div>

                <div className="flex-1 max-w-md mx-6 relative group">
                    <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search active tenants..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] focus:border-indigo-500/30 focus:bg-white/[0.04] text-zinc-200 placeholder-zinc-600 text-sm rounded-full py-3 pl-12 pr-6 outline-none transition-all duration-300 backdrop-blur-md"
                    />
                </div>

                <Link 
                    href="/admin/login" 
                    className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] px-5 py-3 rounded-full backdrop-blur-md"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="hidden sm:block">Vault Access</span>
                </Link>
            </header>

            <div className="max-w-7xl w-full z-10 flex flex-col items-center pb-12 pt-16 sm:pt-24 px-6 flex-grow">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-24 space-y-6"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-tight min-h-[1.2em]">
                        <EncryptedText
                            text="Global Event Ledger"
                            encryptedClassName="text-zinc-600 font-mono tracking-normal"
                            revealedClassName="text-white"
                            revealDelayMs={50} 
                        />
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-500 max-w-xl mx-auto font-normal leading-relaxed tracking-wide">
                        Secure, multi-tenant state management for enterprise conferences, global exhibitions, and exclusive summits.
                    </p>
                </motion.div>

                <div className="w-full mb-12 flex flex-col">
                    <div className="w-full flex-grow flex flex-col min-h-[300px]">
                        {loading ? (
                            <div className="flex-grow flex flex-col items-center justify-center py-20">
                                <svg className="animate-spin h-6 w-6 text-zinc-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : error ? (
                            <div className="px-6 py-4 bg-rose-500/5 border border-rose-500/10 rounded-[32px] text-rose-400/80 text-xs font-medium tracking-wide text-center">
                                {error}
                            </div>
                        ) : (
                            <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="w-full flex flex-col gap-16"
                            >
                                {/* 1. Command Center: Holographic Bento Grid */}
                                {featuredNodes.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full auto-rows-[minmax(180px,auto)]">
                                        {featuredNodes.map((event, index) => {
                                            const isAlpha = index === 0;
                                            const config = nodeConfigs[index] || nodeConfigs[0];
                                            
                                            let spanClass = 'col-span-1 md:col-span-1 md:row-span-1 min-h-[180px]';
                                            if (index === 0) spanClass = 'md:col-span-2 md:row-span-2 min-h-[320px]';
                                            if (index === 4) spanClass = 'md:col-span-2 md:row-span-1 min-h-[180px]';

                                            return (
                                                <div 
                                                    key={event.slug} 
                                                    className={`group relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-6 sm:p-8 flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 ${config.shadow} ${spanClass}`}
                                                >
                                                    {/* ARCHITECTURE: Hardware-Accelerated Holographic Sweep (Optimized Physics) */}
                                                    <div className={`absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent ${config.holo} to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] transition-all duration-300 ease-out z-0 pointer-events-none`} />

                                                    <div 
                                                        className={`absolute ${config.pos} w-96 h-96 ${config.bg} rounded-full blur-[100px] animate-pulse pointer-events-none transition-opacity duration-300 ease-out opacity-50 group-hover:opacity-100 z-0`} 
                                                        style={{ animationDuration: config.duration }} 
                                                    />
                                                    
                                                    <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
                                                            <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                                                                {formatLedgerDate(event.start_date)}
                                                            </span>
                                                        </div>
                                                        
                                                        {event.location && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
                                                                <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.2em] truncate max-w-[150px]">
                                                                    {event.location}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="mt-auto relative z-10 flex flex-col gap-3">
                                                        <h3 className={`${isAlpha ? 'text-4xl font-light tracking-tight' : 'text-xl md:text-2xl font-light'} text-zinc-100 leading-tight group-hover:text-white transition-colors`}>
                                                            {event.title}
                                                        </h3>
                                                        
                                                        {isAlpha && (
                                                            <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-2">
                                                                {event.desc || 'No configuration data provided for this tenant.'}
                                                            </p>
                                                        )}
                                                        
                                                        <Link 
                                                            href={`/${event.slug}`} 
                                                            className="w-fit py-3 px-6 bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.05] rounded-full text-[10px] font-bold tracking-[0.2em] transition-all duration-300 ease-out text-zinc-300 hover:text-white uppercase flex items-center gap-3 mt-2"
                                                        >
                                                            <span>Access Node</span>
                                                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* 2. Master Ledger: Cascading List Nodes */}
                                {ledgerNodes.length > 0 && (
                                    <div className="w-full flex flex-col">
                                        <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mb-8 px-4 border-b border-white/[0.05] pb-4">
                                            <h2 className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">
                                                Extended Ledger
                                            </h2>
                                        </motion.div>
                                        
                                        <div className="flex flex-col">
                                            {ledgerNodes.map((event, index) => {
                                                const colorConfig = ledgerColors[index % ledgerColors.length];

                                                return (
                                                    <motion.div 
                                                        key={event.slug}
                                                        variants={{
                                                            hidden: { opacity: 0, x: -20 },
                                                            show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                                                        }}
                                                    >
                                                        <Link 
                                                            href={`/${event.slug}`}
                                                            className={`group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-transparent hover:bg-white/[0.02] border-b border-white/[0.02] last:border-b-0 border-l-[3px] border-l-transparent ${colorConfig.border} transition-all duration-300 ease-out`}
                                                        >
                                                            <div className={`absolute inset-0 bg-gradient-to-r ${colorConfig.sweep} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none`} />
                                                            
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-12 flex-grow relative z-10">
                                                                <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase w-32 shrink-0">
                                                                    {formatLedgerDate(event.start_date)}
                                                                </span>
                                                                <span className="text-base text-zinc-300 font-light tracking-wide group-hover:text-white transition-colors flex items-center gap-4">
                                                                    {event.title}
                                                                    {event.location && (
                                                                        <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase hidden md:inline-block border border-white/[0.05] bg-white/[0.02] px-2 py-1 rounded-full">
                                                                            {event.location}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className={`mt-4 sm:mt-0 flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ${colorConfig.text} transition-colors relative z-10`}>
                                                                <span>Enter Node</span>
                                                                <svg className="w-3.5 h-3.5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}