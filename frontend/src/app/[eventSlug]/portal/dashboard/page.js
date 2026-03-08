"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
// ARCHITECT NOTE: Adjusted import path for the new deeper folder structure
import { fetchGuestStatus } from '../../../../services/api'; 
import { AmbientAurora } from '@/components/ui/ambient-aurora';
import { InteractiveAura } from '@/components/ui/interactive-aura';

export default function GuestDashboard() {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[GuestDashboard Component - ${eventSlug}]`;
    
    const router = useRouter();
    const [guest, setGuest] = useState(null);

    useEffect(() => {
        console.log(`${context} Component mounted - Dynamic Theme Active (Light/Dark Mode Ready)`);
        console.log(`${context} Step 1: Dashboard mounted. Checking for secure session data.`);
        const sessionData = sessionStorage.getItem('guestData');
        
        if (!sessionData) {
            console.warn(`${context} Failure Point EE: Unauthorized access attempt. No guest data found. Redirecting to portal.`);
            router.push(`/${eventSlug}/portal`);
            return;
        }

        try {
            const parsedData = JSON.parse(sessionData);
            console.log(`${context} Step 2: Session valid. Rendering initial dashboard for: ${parsedData.full_name}`);
            setGuest(parsedData); 

            const syncStatus = async () => {
                try {
                    console.log(`${context} Step 3: Fetching live status from ledger for ID: ${parsedData.id}`);
                    const liveState = await fetchGuestStatus(eventSlug, parsedData.id);
                    
                    if (liveState !== parsedData.current_state) {
                        console.log(`${context} Step 4: State upgrade detected! Updating UI from ${parsedData.current_state} to ${liveState}`);
                        const updatedGuest = { ...parsedData, current_state: liveState };
                        setGuest(updatedGuest);
                        sessionStorage.setItem('guestData', JSON.stringify(updatedGuest));
                    }
                } catch (error) {
                    console.warn(`${context} Background sync failed. Falling back to cached state.`);
                }
            };

            syncStatus();

        } catch (error) {
            console.error(`${context} Failure Point FF: Corrupted session data.`, error);
            sessionStorage.removeItem('guestData');
            router.push(`/${eventSlug}/portal`);
        }
    }, [router, eventSlug, context]);

    const handleLogout = () => {
        console.log(`${context} Step 5: Guest initiated logout. Purging session data.`);
        sessionStorage.removeItem('guestData');
        router.push(`/${eventSlug}/portal`);
    };

    if (!guest) {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-muted-foreground relative overflow-hidden transition-colors duration-300">
                <AmbientAurora />
                <svg className="animate-spin h-6 w-6 mb-4 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </main>
        );
    }

    // ARCHITECT NOTE: Luma-styled status badges (Desaturated, pill-shaped, softly glowing)
    const renderStatusBadge = (state) => {
        switch(state) {
            case 0: 
                return <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-wider border border-border shadow-inner">Invited</span>;
            case 1: 
                return <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500/80 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 shadow-inner">Pending Review</span>;
            case 2: 
                return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">Verified Access</span>;
            case -1: 
                return <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-rose-500/20 shadow-inner">Action Required</span>;
            default: 
                return <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-wider border border-border shadow-inner">Unknown</span>;
        }
    };

    // Orchestration Configuration
    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center text-foreground relative selection:bg-primary/30 overflow-hidden transition-colors duration-300">
            
            <AmbientAurora />
            <InteractiveAura />

            {/* Seamless Top Navigation Bar */}
            <header className="w-full max-w-6xl flex items-center justify-between px-6 py-5 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[10px] tracking-tighter">
                        NX
                    </div>
                    <span className="font-semibold text-foreground tracking-[0.2em] text-xs uppercase hidden sm:block">Nexus</span>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors bg-black/[0.02] dark:bg-white/[0.02] border border-border px-4 py-2.5 rounded-full backdrop-blur-md hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Secure Logout
                </button>
            </header>

            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-w-4xl w-full z-10 flex flex-col items-center pb-12 pt-8 px-6"
            >
                
                {/* Dashboard Intro */}
                <motion.div variants={itemVariant} className="w-full text-left mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight mb-2">Welcome back, {guest.full_name.split(' ')[0]}</h1>
                            <p className="text-sm text-muted-foreground font-normal tracking-wide">Accessing your secure event node and credentials.</p>
                        </div>
                        <div className="flex sm:justify-end">
                            {renderStatusBadge(guest.current_state)}
                        </div>
                    </div>
                </motion.div>

                {/* Free-Floating Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                    
                    {/* Identity Credentials Card (Primary Holographic) */}
                    <motion.div variants={itemVariant}>
                        <div className="group relative overflow-hidden bg-card/50 dark:bg-white/[0.02] backdrop-blur-xl border border-border rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] shadow-md dark:shadow-none">
                            {/* Holographic Beam */}
                            <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-primary/15 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-500 ease-out z-0 pointer-events-none" />
                            {/* Ambient Pulse Aura */}
                            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse pointer-events-none transition-opacity duration-300 ease-out opacity-50 group-hover:opacity-100 z-0" style={{ animationDuration: '6s' }} />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-black/[0.03] dark:bg-white/[0.03] rounded-full flex items-center justify-center border border-border shadow-inner">
                                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </div>
                                    <h2 className="text-sm font-semibold text-foreground tracking-wide">Identity Node</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Secure ID</span>
                                        <span className="font-mono text-foreground/80 text-xs block bg-black/[0.03] dark:bg-white/[0.03] p-3 rounded-2xl border border-border break-all shadow-inner">{guest.id}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Government ID</span>
                                        <a href={guest.id_document_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-foreground/80 hover:text-foreground flex items-center gap-2 transition-colors">
                                            Verify Submission
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Profile Details Card (Accent Holographic) */}
                    <motion.div variants={itemVariant}>
                        <div className="group relative overflow-hidden bg-card/50 dark:bg-white/[0.02] backdrop-blur-xl border border-border rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] dark:hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] shadow-md dark:shadow-none">
                            {/* Holographic Beam */}
                            <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-accent/15 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-500 ease-out z-0 pointer-events-none" />
                            {/* Ambient Pulse Aura */}
                            <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-pulse pointer-events-none transition-opacity duration-300 ease-out opacity-50 group-hover:opacity-100 z-0" style={{ animationDuration: '7s' }} />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-black/[0.03] dark:bg-white/[0.03] rounded-full flex items-center justify-center border border-border shadow-inner">
                                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <h2 className="text-sm font-semibold text-foreground tracking-wide">Profile Attributes</h2>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-border pb-4">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Contact</span>
                                        <span className="text-xs font-mono text-foreground/80">{guest.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dietary Specs</span>
                                        <span className="text-xs text-foreground/80 font-medium leading-relaxed">{guest.dietary_restrictions || 'No restrictions committed to ledger.'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Event Itinerary Container */}
                <motion.div variants={itemVariant} className="w-full">
                    <div className="group relative overflow-hidden w-full bg-card/50 dark:bg-white/[0.02] backdrop-blur-2xl border border-border rounded-[32px] transition-all duration-500 shadow-md dark:shadow-none dark:hover:shadow-[0_0_30px_rgba(15,23,42,0.5)]">
                        {/* Holographic Beam */}
                        <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-foreground/5 dark:via-background/80 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-700 ease-out z-0 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="px-8 py-5 border-b border-border bg-muted/20">
                                <h2 className="text-xs font-bold text-muted-foreground tracking-[0.2em] uppercase">Event Itinerary</h2>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected Hub</span>
                                        <p className="text-sm text-foreground font-medium capitalize group-hover:text-accent transition-colors">{eventSlug.replace(/-/g, ' ')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Schedule</span>
                                        <p className="text-sm text-muted-foreground/80 font-normal italic">TBD by Node Admin</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Venue Protocol</span>
                                        <p className="text-sm text-muted-foreground/80 font-normal italic">Pending Live Update</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </main>
    );
}