"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState, memo } from 'react';
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

// ARCHITECTURE: Full-Bleed Cinematic Hero Engine
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
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--tenant-bg)]">
            {images.map((src, index) => {
                const isActive = currentIndex === index;
                
                return (
                    <motion.div
                        key={src}
                        initial={false} 
                        animate={{
                            opacity: isActive ? 1 : 0,
                            scale: isActive ? 1.05 : 1,
                            zIndex: isActive ? 10 : 0
                        }}
                        transition={{ 
                            opacity: { duration: 1.5, ease: "easeInOut" },
                            scale: { duration: 10, ease: "linear" } 
                        }}
                        className="absolute inset-0 will-change-transform transform-gpu"
                    >
                        <Image 
                            src={src} 
                            alt="Event Atmosphere" 
                            fill
                            priority={index === 0} 
                            sizes="100vw"
                            className="object-cover object-center opacity-50" 
                        />
                    </motion.div>
                );
            })}

            {/* Hardware-Accelerated CSS Masks using dynamic tenant background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--tenant-bg)_120%)] opacity-80 z-20 transform-gpu" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--tenant-bg)]/60 to-[var(--tenant-bg)] z-20 transform-gpu" />
        </div>
    );
};

// [Architecture] Dynamic Surface Texture Generator (Optimized for Zero-Lag Tab Switching)
const SurfaceTexture = memo(({ type }) => {
    if (!type || type === 'none') return null;

    if (type === 'grid') {
        return (
            <div 
                className="fixed inset-0 z-0 pointer-events-none opacity-20 transform-gpu"
                style={{
                    backgroundImage: `linear-gradient(to right, var(--tenant-text) 1px, transparent 1px), linear-gradient(to bottom, var(--tenant-text) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
                }}
            />
        );
    }

    if (type === 'dots') {
        return (
            <div 
                className="fixed inset-0 z-0 pointer-events-none opacity-20 transform-gpu"
                style={{
                    backgroundImage: `radial-gradient(var(--tenant-text) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
                }}
            />
        );
    }

    if (type === 'grain') {
        // Architect Note: numOctaves reduced to 1 and animation stripped to prevent GPU memory dumping on tab switch
        return (
            <div 
                className="fixed inset-0 z-10 pointer-events-none opacity-[0.05] transform-gpu mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}
            />
        );
    }

    return null;
});
SurfaceTexture.displayName = 'SurfaceTexture';

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
                const data = await fetchEventDetails(eventSlug);
                if (!data) throw new Error("Null payload returned from API.");

                setEvent(data);
                setError(null);
                console.log(`${context} Step 2: MSaaS Edge payload hydrated. Theme mapping initiated.`);
            } catch (err) {
                console.error(`${context} Failure Point Hub-Fetch: Failed to load event details.`, err);
                setError('Event node not found in the global ledger.');
            } finally {
                setLoading(false);
            }
        };

        if (eventSlug) loadEvent();
    }, [eventSlug, context]);

    const formatEventTime = (start, end) => {
        if (!start && !end) return null;
        const opts = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' };
        if (start && end) return `${new Date(start).toLocaleDateString('en-US', opts)} - ${new Date(end).toLocaleDateString('en-US', opts)}`;
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

    // --- MSAAS THEME ENGINE EXTRACTOR ---
    const theme = event.theme_config || {};
    
    // Resolve Radius
    let radiusVar = '32px'; // default 'full' mapping for cards
    let buttonRadiusVar = '9999px'; // default 'full' mapping for buttons
    if (theme.radius === 'none') {
        radiusVar = '0px';
        buttonRadiusVar = '0px';
    } else if (theme.radius === 'sm') {
        radiusVar = '8px';
        buttonRadiusVar = '4px';
    }

    // Resolve Font Family
    let fontClass = 'font-sans';
    if (theme.fontFamily === 'serif') fontClass = 'font-serif';
    if (theme.fontFamily === 'mono') fontClass = 'font-mono';

    const cssVariables = {
        '--tenant-bg': theme.background || '#09090b',
        '--tenant-text': theme.text || '#ffffff',
        '--tenant-primary': theme.primary || '#8b5cf6',
        '--tenant-accent': theme.accent || '#3b82f6',
        '--tenant-radius': radiusVar,
        '--tenant-btn-radius': buttonRadiusVar
    };

    if (event.is_expired) {
        return (
            <main style={cssVariables} className={`min-h-screen bg-[var(--tenant-bg)] flex flex-col items-center justify-center p-4 relative overflow-hidden ${fontClass}`}>
                <SurfaceTexture type={theme.texture} />
                {hasImages ? <HeroSlideshow images={event.images} /> : <AmbientAurora />}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/[0.03] rounded-full filter blur-[150px] pointer-events-none z-0 transform-gpu"></div>
                <div 
                    className="bg-black/60 border border-white/[0.05] p-12 max-w-md text-center backdrop-blur-2xl z-20 shadow-2xl relative"
                    style={{ borderRadius: 'var(--tenant-radius)' }}
                >
                    <h1 className="text-2xl font-bold text-[var(--tenant-text)] mb-2 tracking-tight">Event Concluded</h1>
                    <p className="text-[var(--tenant-text)] opacity-60 text-sm mb-8 leading-relaxed font-light">
                        The timeline for <span className="font-bold opacity-100">{event.title}</span> has officially elapsed. The registration portal and guest hub are now securely locked.
                    </p>
                    <Link 
                        href="/" 
                        className="inline-flex w-full justify-center py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-[var(--tenant-text)] font-bold text-[10px] uppercase tracking-widest transition-all"
                        style={{ borderRadius: 'var(--tenant-btn-radius)' }}
                    >
                        Return to Global Directory
                    </Link>
                </div>
            </main>
        );
    }

    const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
    const itemVariant = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

    return (
        <main style={cssVariables} className={`min-h-screen bg-[var(--tenant-bg)] flex flex-col items-center text-[var(--tenant-text)] relative selection:bg-[var(--tenant-primary)]/30 overflow-hidden transition-colors duration-1000 ${fontClass}`}>

            <SurfaceTexture type={theme.texture} />
            {hasImages ? <HeroSlideshow images={event.images} /> : <AmbientAurora />}
            <InteractiveAura />

            <header className="w-full max-w-6xl flex items-center justify-between px-6 py-5 z-20 relative">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[var(--tenant-text)] text-[var(--tenant-bg)] flex items-center justify-center font-bold text-[10px] tracking-tighter" style={{ borderRadius: 'var(--tenant-btn-radius)' }}>
                        NX
                    </div>
                    <span className="font-semibold text-[var(--tenant-text)] opacity-90 tracking-[0.2em] text-xs uppercase drop-shadow-md">Nexus</span>
                </div>
                
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--tenant-text)] hover:opacity-80 transition-opacity bg-black/20 hover:bg-black/40 border border-white/10 px-4 py-2 backdrop-blur-md shadow-lg"
                    style={{ borderRadius: 'var(--tenant-btn-radius)' }}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Global Directory
                </Link>
            </header>

            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-w-4xl w-full z-20 flex flex-col items-center pb-12 pt-16 px-4 relative"
            >
                <motion.div variants={itemVariant} className="text-center mb-16 space-y-4">
                    <div 
                        className="inline-flex items-center gap-2 mb-2 px-3 py-1.5 bg-black/20 backdrop-blur-md border border-white/10 text-[var(--tenant-text)] opacity-80 text-[10px] font-bold tracking-[0.15em] uppercase shadow-lg"
                        style={{ borderRadius: 'var(--tenant-btn-radius)' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--tenant-primary)] animate-pulse shadow-[0_0_10px_var(--tenant-primary)]"></span>
                        Active Tenant Portal
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--tenant-text)] leading-tight min-h-[1.2em] drop-shadow-xl">
                        <EncryptedText
                            text={event.title}
                            encryptedClassName="opacity-50 font-mono tracking-normal"
                            revealedClassName="text-[var(--tenant-text)]"
                            revealDelayMs={50} 
                        />
                    </h1>
                    <p className="text-sm text-[var(--tenant-text)] opacity-60 max-w-lg mx-auto font-normal leading-relaxed tracking-wide drop-shadow-md">
                        {event.desc || `Accessing dynamic data for the ${event.title} node.`}
                    </p>
                    
                    {(formattedDate || event.location) && (
                        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-[var(--tenant-text)] opacity-90 mt-6 font-medium uppercase tracking-widest">
                            {formattedDate && (
                                <span 
                                    className="flex items-center gap-2 px-4 py-2 bg-black/30 border border-white/10 shadow-lg backdrop-blur-md"
                                    style={{ borderRadius: 'var(--tenant-btn-radius)' }}
                                >
                                    <svg className="w-3 h-3 text-[var(--tenant-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {formattedDate}
                                </span>
                            )}
                            {event.location && (
                                <span 
                                    className="flex items-center gap-2 px-4 py-2 bg-black/30 border border-white/10 shadow-lg backdrop-blur-md"
                                    style={{ borderRadius: 'var(--tenant-btn-radius)' }}
                                >
                                    <svg className="w-3 h-3 text-[var(--tenant-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {event.location}
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    
                    {/* Node 1: Register (Branded with Primary Color) */}
                    <motion.div variants={itemVariant}>
                        <div 
                            className="group relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/[0.08] p-8 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1"
                            style={{ '--hover-shadow': 'var(--tenant-primary)', borderRadius: 'var(--tenant-radius)' }} 
                        >
                            <style jsx>{`
                                div.group:hover { box-shadow: 0 0 40px color-mix(in srgb, var(--hover-shadow) 20%, transparent); }
                            `}</style>
                            
                            <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] transition-all duration-300 ease-out z-0 pointer-events-none transform-gpu" style={{ backgroundImage: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--tenant-primary) 20%, transparent), transparent)' }} />
                            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-opacity duration-300 ease-out opacity-50 group-hover:opacity-100 z-0 transform-gpu" style={{ backgroundColor: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)' }} />

                            <div 
                                className="w-12 h-12 bg-white/[0.05] flex items-center justify-center mb-6 border border-white/[0.1] relative z-10 shadow-inner"
                                style={{ borderRadius: 'var(--tenant-btn-radius)' }}
                            >
                                <svg className="w-5 h-5 text-[var(--tenant-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-[var(--tenant-text)] mb-3 tracking-tight relative z-10 drop-shadow-md">Register</h2>
                            <p className="text-[var(--tenant-text)] opacity-60 text-xs mb-8 flex-grow leading-relaxed relative z-10">Secure your clearance for this event. Submit your identity document for ledger verification.</p>
                            <Link 
                                href={`/${eventSlug}/register`} 
                                className="w-full py-3 px-4 font-bold text-[11px] uppercase tracking-wider transition-all relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 text-[var(--tenant-bg)] hover:opacity-90" 
                                style={{ backgroundColor: 'var(--tenant-text)', borderRadius: 'var(--tenant-btn-radius)' }}
                            >
                                Start Registration
                            </Link>
                        </div>
                    </motion.div>

                    {/* Node 2: Portal (Branded with Accent Color) */}
                    <motion.div variants={itemVariant}>
                        <div 
                            className="group relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/[0.08] p-8 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1"
                            style={{ '--hover-shadow': 'var(--tenant-accent)', borderRadius: 'var(--tenant-radius)' }}
                        >
                            <style jsx>{`
                                div.group:hover { box-shadow: 0 0 40px color-mix(in srgb, var(--hover-shadow) 20%, transparent); }
                            `}</style>
                            
                            <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] transition-all duration-300 ease-out z-0 pointer-events-none transform-gpu" style={{ backgroundImage: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--tenant-accent) 20%, transparent), transparent)' }} />
                            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-opacity duration-300 ease-out opacity-50 group-hover:opacity-100 z-0 transform-gpu" style={{ backgroundColor: 'color-mix(in srgb, var(--tenant-accent) 10%, transparent)' }} />

                            <div 
                                className="w-12 h-12 bg-white/[0.05] flex items-center justify-center mb-6 border border-white/[0.1] relative z-10 shadow-inner"
                                style={{ borderRadius: 'var(--tenant-btn-radius)' }}
                            >
                                <svg className="w-5 h-5 text-[var(--tenant-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-[var(--tenant-text)] mb-3 tracking-tight relative z-10 drop-shadow-md">Portal</h2>
                            <p className="text-[var(--tenant-text)] opacity-60 text-xs mb-8 flex-grow leading-relaxed relative z-10">Already committed to the ledger? View your live verification state and event dashboard.</p>
                            <Link 
                                href={`/${eventSlug}/portal`} 
                                className="w-full py-3 px-4 bg-white/[0.05] hover:bg-white/[0.15] border border-white/[0.1] font-bold text-[11px] uppercase tracking-wider transition-all relative z-10 active:scale-95" 
                                style={{ color: 'var(--tenant-text)', borderRadius: 'var(--tenant-btn-radius)' }}
                            >
                                Enter Portal
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </main>
    );
}