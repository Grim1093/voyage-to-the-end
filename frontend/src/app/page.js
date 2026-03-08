"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPublicEvents } from '../services/api';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

const EncryptedText = dynamic(
    () => import('@/components/ui/encrypted-text').then((mod) => mod.EncryptedText),
    { ssr: false }
);

// ARCHITECTURE: Global Ambient Aurora Background (Inline Version)
const AmbientAurora = () => {
    useEffect(() => {
        console.log("[page.js - AmbientAurora] Inline Aurora mounted with Royal Blue / Electric Violet / Deep Midnight theme");
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
                animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], scale: [1, 1.1, 0.9, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#2563EB]/15 blur-[120px]"
            />
            <motion.div
                animate={{ x: [0, -100, 50, 0], y: [0, 100, -50, 0], scale: [1, 0.9, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#7C3AED]/15 blur-[120px]"
            />
            <motion.div
                animate={{ x: [0, 50, -100, 0], y: [0, -100, 50, 0], scale: [1, 1.2, 0.8, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[#0F172A]/60 blur-[120px]"
            />
        </div>
    );
};

// ARCHITECTURE: Cinematic Image Slideshow Component (Desynchronized & Optimized)
const EventSlideshow = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        
        let intervalTimer;
        // Generate a random delay between 0 and 4 seconds for organic desynchronization
        const randomOffset = Math.random() * 4000;

        const startSlideshow = () => {
            intervalTimer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 8000); // Luxurious 8-second cycle
        };

        const initialDelay = setTimeout(startSlideshow, randomOffset);
        
        return () => {
            clearTimeout(initialDelay);
            if (intervalTimer) clearInterval(intervalTimer);
        };
    }, [images]);

    if (!images || images.length === 0) return null;

    return (
        <div 
            className="absolute inset-y-0 right-0 w-[70%] sm:w-[60%] z-0 pointer-events-none overflow-hidden rounded-r-[24px] opacity-40 group-hover:opacity-70 transition-opacity duration-700"
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 40%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)'
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1.05 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                        opacity: { duration: 2, ease: "easeInOut" }, // 2-second ultra-smooth crossfade
                        scale: { duration: 12, ease: "linear" } // 12-second constant movement to outlast the 8s interval
                    }}
                    className="absolute inset-0"
                >
                    <Image 
                        src={images[currentIndex]} 
                        alt="Event Atmosphere" 
                        fill
                        priority={currentIndex === 0} 
                        sizes="(max-width: 768px) 100vw, 50vw" 
                        className="object-cover object-center"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default function GlobalPlatformHub() {
    const context = '[Global Platform Hub]';

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        console.log(`${context} Page successfully mounted. Theme capabilities active.`);
        const loadEvents = async () => {
            console.log(`${context} Step 1: Initializing ledger connection for event resolution... Theme config integrated.`);
            try {
                const fetchedEvents = await fetchPublicEvents();
                setEvents(fetchedEvents);
                setError(null);
                console.log(`${context} Step 2: Global events successfully hydrated.`);
            } catch (err) {
                console.error(`${context} Failure Point Hub-Fetch: Failed to load events:`, err);
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

    // ARCHITECTURE: Updated Theme Nodes (Royal Blue, Electric Violet, Deep Midnight)
    const nodeConfigs = [
        { pos: '-top-32 -right-32', bg: 'bg-[#2563EB]/15', duration: '7s', holo: 'via-[#2563EB]/20', shadow: 'hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]' },
        { pos: '-bottom-32 -left-32', bg: 'bg-[#7C3AED]/15', duration: '5s', holo: 'via-[#7C3AED]/20', shadow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]' },
        { pos: '-top-32 -left-32', bg: 'bg-[#0F172A]/50', duration: '8s', holo: 'via-[#0F172A]/40', shadow: 'hover:shadow-[0_0_30px_rgba(15,23,42,0.4)]' },
        { pos: '-bottom-32 -right-32', bg: 'bg-[#2563EB]/10', duration: '6s', holo: 'via-[#2563EB]/20', shadow: 'hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]' },
        { pos: 'top-0 right-1/4', bg: 'bg-[#7C3AED]/10', duration: '9s', holo: 'via-[#7C3AED]/20', shadow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]' }
    ];

    // ARCHITECTURE: Updated Ledger Sweeps
    const ledgerColors = [
        { border: 'hover:border-l-[#2563EB]', sweep: 'from-[#2563EB]/[0.05]', text: 'group-hover:text-[#2563EB]' },
        { border: 'hover:border-l-[#7C3AED]', sweep: 'from-[#7C3AED]/[0.05]', text: 'group-hover:text-[#7C3AED]' },
        { border: 'hover:border-l-[#0F172A]', sweep: 'from-[#0F172A]/[0.2]', text: 'group-hover:text-white' }, // Text left white for visibility against midnight background
        { border: 'hover:border-l-[#2563EB]', sweep: 'from-[#2563EB]/[0.05]', text: 'group-hover:text-[#2563EB]' },
        { border: 'hover:border-l-[#7C3AED]', sweep: 'from-[#7C3AED]/[0.05]', text: 'group-hover:text-[#7C3AED]' },
        { border: 'hover:border-l-[#0F172A]', sweep: 'from-[#0F172A]/[0.2]', text: 'group-hover:text-white' },
    ];

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <main className="min-h-screen flex flex-col items-center text-foreground relative selection:bg-[#2563EB]/30 overflow-hidden bg-background">
            
            <AmbientAurora />
            
            <header className="w-full max-w-7xl flex items-center justify-between px-6 py-6 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[10px] tracking-tighter">
                        NX
                    </div>
                    <span className="font-semibold text-foreground tracking-[0.2em] text-xs uppercase hidden sm:block">
                        Nexus
                    </span>
                </div>

                <div className="flex-1 max-w-md mx-6 relative group">
                    <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#2563EB] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search active tenants..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-border focus:border-[#2563EB]/30 text-foreground placeholder-muted-foreground text-sm rounded-full py-3 pl-12 pr-6 outline-none transition-all duration-300 backdrop-blur-md"
                    />
                </div>

                {/* Theme Toggle and Vault Access Group */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link 
                        href="/admin/login" 
                        className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] border border-border px-5 py-3 rounded-full backdrop-blur-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="hidden sm:block">Vault Access</span>
                    </Link>
                </div>
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
                            encryptedClassName="text-muted-foreground font-mono tracking-normal"
                            revealedClassName="text-foreground"
                            revealDelayMs={50} 
                        />
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-normal leading-relaxed tracking-wide">
                        Secure, multi-tenant state management for enterprise conferences, global exhibitions, and exclusive summits.
                    </p>
                </motion.div>

                <div className="w-full mb-12 flex flex-col">
                    <div className="w-full flex-grow flex flex-col min-h-[300px]">
                        {loading ? (
                            <div className="flex-grow flex flex-col items-center justify-center py-20">
                                <svg className="animate-spin h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                    <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full auto-rows-[minmax(180px,auto)]">
                                        <AnimatePresence mode="popLayout">
                                            {featuredNodes.map((event, index) => {
                                                const isAlpha = index === 0;
                                                const config = nodeConfigs[index] || nodeConfigs[0];
                                                
                                                let spanClass = 'col-span-1 md:col-span-1 md:row-span-1 min-h-[180px]';
                                                if (index === 0) spanClass = 'md:col-span-2 md:row-span-2 min-h-[320px]';
                                                if (index === 4) spanClass = 'md:col-span-2 md:row-span-1 min-h-[180px]';

                                                const hasImages = event.images && event.images.length > 0;
                                                
                                                const cardBgClass = hasImages ? 'bg-card/90' : 'bg-card/50 backdrop-blur-xl';
                                                const titleClass = hasImages ? 'text-foreground drop-shadow-md' : 'text-foreground/80 group-hover:text-foreground transition-colors';
                                                const descClass = hasImages ? 'text-muted-foreground drop-shadow-md' : 'text-muted-foreground';
                                                
                                                const pillBgClass = hasImages ? 'bg-white/[0.04] dark:bg-black/[0.2] shadow-sm' : 'bg-transparent';
                                                const pillTextClass = hasImages ? 'text-foreground/80' : 'text-muted-foreground';
                                                const pillIconClass = hasImages ? 'text-foreground/80' : 'text-muted-foreground';
                                                
                                                const buttonClass = hasImages 
                                                    ? 'bg-foreground hover:bg-foreground/80 text-background shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95' 
                                                    : 'bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.1] dark:hover:bg-white/[0.1] text-foreground/80 hover:text-foreground';

                                                return (
                                                    <motion.div 
                                                        key={event.slug} 
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.3 }}
                                                        className={`group relative overflow-hidden border border-border rounded-[32px] p-6 sm:p-8 flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 ${cardBgClass} ${config.shadow} ${spanClass}`}
                                                    >
                                                        {hasImages && <EventSlideshow images={event.images} />}

                                                        {!hasImages && (
                                                            <>
                                                                <div className={`absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent ${config.holo} to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] transition-all duration-300 ease-out z-0 pointer-events-none`} />
                                                                <div 
                                                                    className={`absolute ${config.pos} w-96 h-96 ${config.bg} rounded-full blur-[100px] animate-pulse pointer-events-none transition-opacity duration-300 ease-out opacity-50 group-hover:opacity-100 z-0`} 
                                                                    style={{ animationDuration: config.duration }} 
                                                                />
                                                            </>
                                                        )}
                                                        
                                                        <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
                                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-border backdrop-blur-md ${pillBgClass}`}>
                                                                <svg className={`w-3.5 h-3.5 ${pillIconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                <span className={`${pillTextClass} text-[9px] font-bold uppercase tracking-[0.2em]`}>
                                                                    {formatLedgerDate(event.start_date)}
                                                                </span>
                                                            </div>
                                                            
                                                            {event.location && (
                                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-border backdrop-blur-md ${pillBgClass}`}>
                                                                    <svg className={`w-3.5 h-3.5 ${pillIconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                    <span className={`${pillTextClass} text-[9px] font-bold uppercase tracking-[0.2em] truncate max-w-[150px]`}>
                                                                        {event.location}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="mt-auto relative z-10 flex flex-col gap-3">
                                                            <h3 className={`${isAlpha ? 'text-4xl font-light tracking-tight' : 'text-xl md:text-2xl font-light'} leading-tight ${titleClass}`}>
                                                                {event.title}
                                                            </h3>
                                                            
                                                            {isAlpha && (
                                                                <p className={`text-sm leading-relaxed line-clamp-2 mb-2 ${descClass}`}>
                                                                    {event.desc || 'No configuration data provided for this tenant.'}
                                                                </p>
                                                            )}
                                                            
                                                            <Link 
                                                                href={`/${event.slug}`} 
                                                                className={`w-fit py-3 px-6 rounded-full text-[10px] font-bold tracking-[0.2em] transition-all duration-300 ease-out uppercase flex items-center gap-3 mt-2 ${buttonClass}`}
                                                            >
                                                                <span>Access Node</span>
                                                                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                            </Link>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* 2. Master Ledger: Tactical Data Bars with Slideshow Integration */}
                                {ledgerNodes.length > 0 && (
                                    <div className="w-full flex flex-col relative z-20">
                                        <motion.div layout className="mb-6 px-2 flex items-center justify-between">
                                            <h2 className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
                                                Extended Ledger
                                            </h2>
                                            <div className="h-[1px] flex-grow bg-border ml-6"></div>
                                        </motion.div>
                                        
                                        <motion.div layout className="flex flex-col gap-3">
                                            <AnimatePresence mode="popLayout">
                                                {ledgerNodes.map((event, index) => {
                                                    const colorConfig = ledgerColors[index % ledgerColors.length];
                                                    
                                                    const hasImages = event.images && event.images.length > 0;
                                                    const rowBgClass = hasImages ? 'bg-card/90' : 'bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]';

                                                    return (
                                                        <motion.div 
                                                            key={event.slug}
                                                            layout
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                                        >
                                                            <Link 
                                                                href={`/${event.slug}`}
                                                                className={`group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border border-border rounded-[24px] border-l-[3px] border-l-transparent ${colorConfig.border} transition-all duration-300 ease-out hover:shadow-sm ${rowBgClass}`}
                                                            >
                                                                {hasImages && <EventSlideshow images={event.images} />}

                                                                {!hasImages && (
                                                                    <div className={`absolute inset-0 bg-gradient-to-r ${colorConfig.sweep} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none`} />
                                                                )}
                                                                
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 flex-grow relative z-10">
                                                                    <div className="w-32 shrink-0">
                                                                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border backdrop-blur-md ${hasImages ? 'bg-black/[0.04] dark:bg-white/[0.04] border-border text-foreground/80' : 'bg-transparent border-border text-muted-foreground'}`}>
                                                                            {formatLedgerDate(event.start_date)}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="flex flex-col gap-1.5 flex-grow">
                                                                        <span className={`text-lg font-medium tracking-wide transition-colors ${hasImages ? 'text-foreground drop-shadow-md' : 'text-foreground/80 group-hover:text-foreground'}`}>
                                                                            {event.title}
                                                                        </span>
                                                                        {event.location && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <svg className={`w-3.5 h-3.5 ${hasImages ? 'text-muted-foreground' : 'text-muted-foreground/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                                                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${hasImages ? 'text-foreground/80 drop-shadow-sm' : 'text-muted-foreground'}`}>
                                                                                    {event.location}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="mt-4 sm:mt-0 flex items-center gap-4 sm:gap-6 relative z-10 shrink-0">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner ${hasImages ? 'bg-black/[0.08] dark:bg-white/[0.08] group-hover:bg-black/[0.2] dark:group-hover:bg-white/[0.2] border border-border text-foreground' : `bg-black/[0.05] dark:bg-white/[0.05] group-hover:bg-black/[0.15] dark:group-hover:bg-white/[0.15] border border-border ${colorConfig.text}`}`}>
                                                                        <svg className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </motion.div>
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