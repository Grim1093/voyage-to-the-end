"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { fetchEventDetails } from '../../services/api';
import { InteractiveAura } from '@/components/ui/interactive-aura';
import { AmbientAurora } from '@/components/ui/ambient-aurora';

// ARCHITECT NOTE: Dynamically importing the EncryptedText component to prevent hydration mismatches
const EncryptedText = dynamic(
    () => import('@/components/ui/encrypted-text').then((mod) => mod.EncryptedText),
    { ssr: false }
);

// ARCHITECTURE: Full-Bleed Cinematic Hero Engine (Concurrent DOM Strategy)
const HeroSlideshow = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        
        return () => clearInterval(timer);
    }, [images]);

    if (!images || images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#09090b]">
            {images.map((src, index) => {
                const isActive = currentIndex === index;
                
                return (
                    <motion.div
                        key={src}
                        initial={false} // Prevents animation on initial page load
                        animate={{
                            opacity: isActive ? 1 : 0,
                            scale: isActive ? 1.05 : 1,
                            zIndex: isActive ? 10 : 0
                        }}
                        transition={{ 
                            opacity: { duration: 1.5, ease: "easeInOut" },
                            scale: { duration: 10, ease: "linear" } 
                        }}
                        className="absolute inset-0"
                    >
                        <Image 
                            src={src} 
                            alt="Event Atmosphere" 
                            fill
                            priority={index === 0} // Only force preload the first frame. The browser will background-load the rest automatically.
                            sizes="100vw"
                            className="object-cover object-center opacity-50" 
                        />
                    </motion.div>
                );
            })}

            {/* Hardware-Accelerated CSS Masks (Elevated z-index to sit above the crossfading images) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_120%)] opacity-80 z-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/10 via-[#09090b]/60 to-[#09090b] z-20" />
        </div>
    );
};

export default function EventHub() {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[Event Hub - ${eventSlug}]`;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadEvent = async () => {
            console.log(`${context} Step 1: Initializing ledger connection for node resolution...`);
            try {
                console.log(`${context} Step 2: Requesting payload for slug [${eventSlug}]...`);
                const data = await fetchEventDetails(eventSlug);
                
                console.log(`${context} Step 3: Payload received. Validating schema integrity...`, data);
                if (!data) throw new Error("Null payload returned from API.");

                setEvent(data);
                setError(null);
                console.log(`${context} Step 4: Schema validated. Hydrating UI architecture.`);
            } catch (err) {
                console.error(`${context} Failure Point Hub-Fetch: Failed to load event details.`, err);
                setError('Event node not found in the global ledger.');
            } finally {
                setLoading(false);
                console.log(`${context} Step 5: Loading state resolved.`);
            }
        };

        if (eventSlug) loadEvent();
    }, [eventSlug, context]);

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
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 text-zinc-500 relative overflow-hidden">
                <AmbientAurora />
                <svg className="animate-spin h-6 w-6 mb-4 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </main>
        );
    }

    if (error || !event) {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <AmbientAurora />
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 max-w-sm text-center backdrop-blur-xl relative z-10 shadow-2xl">
                    <h1 className="text-lg font-medium text-zinc-200 mb-2">Access Denied</h1>
                    <p className="text-zinc-500 text-xs mb-6">{error}</p>
                    <Link href="/" className="inline-flex py-3 px-6 bg-white text-black rounded-full text-[10px] uppercase tracking-widest font-bold transition-all hover:bg-zinc-200 active:scale-95">
                        Return to Ledger
                    </Link>
                </div>
            </main>
        );
    }

    const formattedDate = formatEventTime(event.start_date, event.end_date);
    const hasImages = event.images && event.images.length > 0;

    // ARCHITECT NOTE: The Auto-Expiry Lock Screen
    if (event.is_expired) {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {hasImages ? <HeroSlideshow images={event.images} /> : <AmbientAurora />}
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/[0.03] rounded-full filter blur-[150px] pointer-events-none z-0"></div>
                
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

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center text-zinc-200 relative selection:bg-indigo-500/30 overflow-hidden">

            {/* ARCHITECTURE: Graceful Degradation Toggle */}
            {hasImages ? <HeroSlideshow images={event.images} /> : <AmbientAurora />}
            <InteractiveAura />

            <header className="w-full max-w-6xl flex items-center justify-between px-6 py-5 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px] tracking-tighter">
                        NX
                    </div>
                    <span className="font-semibold text-zinc-100 tracking-[0.2em] text-xs uppercase drop-shadow-md">Nexus</span>
                </div>
                
                <Link href="/" className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase text-zinc-300 hover:text-white transition-colors bg-black/20 hover:bg-black/40 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md shadow-lg">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Global Directory
                </Link>
            </header>

            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-w-4xl w-full z-10 flex flex-col items-center pb-12 pt-16 px-4"
            >
                <motion.div variants={itemVariant} className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-bold tracking-[0.15em] uppercase shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/[0.6] animate-pulse"></span>
                        Active Tenant Portal
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-tight min-h-[1.2em] drop-shadow-xl">
                        <EncryptedText
                            text={event.title}
                            encryptedClassName="text-zinc-400 font-mono tracking-normal"
                            revealedClassName="text-white"
                            revealDelayMs={50} 
                        />
                    </h1>
                    <p className="text-sm text-zinc-400 max-w-lg mx-auto font-normal leading-relaxed tracking-wide drop-shadow-md">
                        {event.desc || `Accessing dynamic data for the ${event.title} node.`}
                    </p>
                    
                    {(formattedDate || event.location) && (
                        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-zinc-300 mt-6 font-medium uppercase tracking-widest">
                            {formattedDate && (
                                <span className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
                                    <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {formattedDate}
                                </span>
                            )}
                            {event.location && (
                                <span className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
                                    <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {event.location}
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Free-Floating Navigation Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    
                    {/* Node 1: Register */}
                    <motion.div variants={itemVariant}>
                        <div className="group relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-8 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                            <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-violet-400/20 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] transition-all duration-300 ease-out z-0 pointer-events-none" />
                            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none transition-opacity duration-300 ease-out opacity-50 group-hover:opacity-100 z-0" style={{ animationDuration: '5s' }} />

                            <div className="w-12 h-12 bg-white/[0.05] rounded-full flex items-center justify-center mb-6 border border-white/[0.1] relative z-10 shadow-inner">
                                <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            </div>
                            <h2 className="text-xl font-medium text-white mb-3 tracking-tight relative z-10 drop-shadow-md">Register</h2>
                            <p className="text-zinc-400 text-xs mb-8 flex-grow leading-relaxed relative z-10">Secure your clearance for this event. Submit your identity document for ledger verification.</p>
                            <Link href={`/${eventSlug}/register`} className="w-full py-3 px-4 bg-white text-black rounded-full font-bold text-[11px] uppercase tracking-wider transition-all hover:bg-zinc-200 relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
                                Start Registration
                            </Link>
                        </div>
                    </motion.div>

                    {/* Node 2: Portal */}
                    <motion.div variants={itemVariant}>
                        <div className="group relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-8 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                            <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] transition-all duration-300 ease-out z-0 pointer-events-none" />
                            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none transition-opacity duration-300 ease-out opacity-50 group-hover:opacity-100 z-0" style={{ animationDuration: '6s' }} />

                            <div className="w-12 h-12 bg-white/[0.05] rounded-full flex items-center justify-center mb-6 border border-white/[0.1] relative z-10 shadow-inner">
                                <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </div>
                            <h2 className="text-xl font-medium text-white mb-3 tracking-tight relative z-10 drop-shadow-md">Portal</h2>
                            <p className="text-zinc-400 text-xs mb-8 flex-grow leading-relaxed relative z-10">Already committed to the ledger? View your live verification state and event dashboard.</p>
                            <Link href={`/${eventSlug}/portal`} className="w-full py-3 px-4 bg-white/[0.05] hover:bg-white/[0.15] border border-white/[0.1] rounded-full font-bold text-[11px] uppercase tracking-wider transition-all text-white relative z-10 active:scale-95">
                                Enter Portal
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </main>
    );
}