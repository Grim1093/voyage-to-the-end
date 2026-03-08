"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllAdminEvents, fetchGlobalGuests } from '../../services/api';
import { AmbientAurora } from '@/components/ui/ambient-aurora';
import { InteractiveAura } from '@/components/ui/interactive-aura';

export default function MasterDashboard() {
    const context = '[Master Control Plane]';
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('active_events'); 
    const [events, setEvents] = useState([]);
    const [globalGuests, setGlobalGuests] = useState([]);
    const [status, setStatus] = useState('loading'); 
    const [selectedGlobalGuest, setSelectedGlobalGuest] = useState(null);

    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

    useEffect(() => {
        // Step log tracking initialization and theme confirmation
        console.log(`${context} Component mounted - Dynamic Theme Active (Light/Dark Mode Ready)`);
        
        let inactivityTimer;

        const validateGatekeeper = () => {
            const sessionString = sessionStorage.getItem('adminSession');
            if (!sessionString) {
                router.push('/admin/login');
                return false;
            }
            try {
                const sessionData = JSON.parse(sessionString);
                if (!sessionData.key) {
                    sessionStorage.removeItem('adminSession');
                    router.push('/admin/login');
                    return false;
                }
                return true;
            } catch (error) {
                sessionStorage.removeItem('adminSession');
                router.push('/admin/login');
                return false;
            }
        };

        const handleLogout = () => {
            console.log(`${context} Action: Session purged due to inactivity.`);
            sessionStorage.removeItem('adminSession');
            router.push('/admin/login');
        };

        const resetInactivityTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                handleLogout();
            }, INACTIVITY_LIMIT_MS);
        };

        if (validateGatekeeper()) {
            if (activeTab === 'active_events' || activeTab === 'previous_events') {
                loadTenants();
            } else {
                loadGlobalGuests();
            }

            resetInactivityTimer();
            const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
            activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer, { passive: true }));

            return () => {
                if (inactivityTimer) clearTimeout(inactivityTimer);
                activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
            };
        }
    }, [router, activeTab]);

    const loadTenants = async () => {
        setStatus('loading');
        try {
            const data = await fetchAllAdminEvents();
            setEvents(data);
            setStatus('success');
        } catch (error) {
            setStatus('error');
        }
    };

    const loadGlobalGuests = async () => {
        setStatus('loading');
        try {
            const result = await fetchGlobalGuests(1, 50); 
            setGlobalGuests(result.data);
            setStatus('success');
        } catch (error) {
            setStatus('error');
        }
    };

    const handleLockVault = () => {
        sessionStorage.removeItem('adminSession');
        router.push('/admin/login');
    };

    const renderStateBadge = (state) => {
        switch(state) {
            case 0: return <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-muted-foreground"></span> Invited</span>;
            case 1: return <span className="flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-accent animate-pulse"></span> Review</span>;
            case 2: return <span className="flex items-center gap-1.5 text-foreground/80 text-[10px] font-bold uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.4)]"></span> Verified</span>;
            case -1: return <span className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-rose-500"></span> Action</span>;
            default: return <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">N/A</span>;
        }
    };

    const activeEvents = events.filter(e => !e.is_expired);
    const previousEvents = events.filter(e => e.is_expired);

    // ARCHITECTURE: Staggered Deployment Configuration
    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const renderEventCards = (eventList) => {
        if (eventList.length === 0) {
            return (
                <motion.div variants={itemVariant} className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-border rounded-[32px] bg-card">
                    <span className="text-muted-foreground text-[10px] font-mono tracking-[0.2em] uppercase">No Data Permutations Found</span>
                </motion.div>
            );
        }
        
        return eventList.map((event) => (
            <motion.div key={event.slug} variants={itemVariant}>
                <div className={`relative overflow-hidden bg-card hover:bg-muted/50 backdrop-blur-xl border border-border rounded-[32px] p-8 flex flex-col transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] group ${event.is_expired ? 'opacity-60 grayscale-[80%]' : ''}`}>
                    
                    {/* ARCHITECTURE: Admin Holographic Scanner (Primary Color) */}
                    <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-primary/15 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-500 ease-out z-0 pointer-events-none" />

                    <div className="relative z-10 flex justify-between items-start mb-8">
                        <div className="w-12 h-12 bg-black/[0.03] dark:bg-white/[0.03] rounded-full flex items-center justify-center border border-border text-sm font-light text-foreground/80 shadow-inner">
                            {event.slug.charAt(0).toUpperCase()}
                        </div>
                        <span className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] ${event.is_expired ? 'text-rose-500/80' : event.is_public ? 'text-muted-foreground' : 'text-accent'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${event.is_expired ? 'bg-rose-500/80' : event.is_public ? 'bg-muted-foreground' : 'bg-accent'}`}></span>
                            {event.is_expired ? 'Archived' : event.is_public ? 'Public' : 'Private'}
                        </span>
                    </div>
                    
                    <div className="relative z-10">
                        <h3 className="text-xl font-medium text-foreground mb-2 tracking-tight truncate">{event.title}</h3>
                        <a 
                            href={`/${event.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-muted-foreground text-[11px] font-mono mb-10 hover:text-primary transition-colors flex items-center gap-2 w-fit group/link"
                        >
                            /{event.slug}
                            <svg className="w-3 h-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                    
                    <div className="relative z-10 mt-auto flex gap-3">
                        <Link href={`/admin/${event.slug}`} className="flex-1 bg-black/[0.03] dark:bg-white/[0.03] hover:bg-foreground text-foreground/80 hover:text-background py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-center transition-all shadow-inner hover:shadow-none">
                            {event.is_expired ? 'View Ledger' : 'Manage Node'}
                        </Link>
                        <Link href={`/admin/events/${event.slug}/edit`} className="w-12 h-12 flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.03] hover:bg-foreground border border-transparent hover:border-foreground text-muted-foreground hover:text-background rounded-full transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </Link>
                    </div>
                </div>
            </motion.div>
        ));
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center text-foreground relative selection:bg-primary/30 overflow-hidden transition-colors duration-300">
            
            {/* Global Mesh Background & Cursor Aura */}
            <AmbientAurora />
            <InteractiveAura />

            <header className="w-full max-w-7xl flex items-center justify-between px-6 py-8 z-20 border-b border-border">
                <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        NX
                    </div>
                    <div>
                        <h1 className="text-3xl font-light text-foreground tracking-tight mb-1">Control Plane</h1>
                        <p className="text-[9px] text-muted-foreground font-bold tracking-[0.3em] uppercase">Master Ledger Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin/events/new"
                        className="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-background bg-foreground hover:bg-foreground/80 px-6 py-3 rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:scale-[1.02] active:scale-95"
                    >
                        Deploy Tenant
                    </Link>
                    <button 
                        onClick={handleLockVault}
                        className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors bg-black/[0.02] dark:bg-white/[0.02] border border-border hover:bg-black/[0.05] dark:hover:bg-white/[0.05] px-6 py-3 rounded-full backdrop-blur-md"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        Lock Vault
                    </button>
                </div>
            </header>

            <div className="max-w-7xl w-full z-10 flex flex-col px-6 pb-16 pt-8">
                
                {/* Admin Tab Architecture */}
                <div className="flex space-x-10 mb-12 border-b border-border">
                    <button 
                        onClick={() => setActiveTab('active_events')} 
                        className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'active_events' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
                    >
                        Active Tenants
                        {activeTab === 'active_events' && <motion.span layoutId="activeTabIndicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground shadow-[0_0_10px_rgba(37,99,235,0.5)]"></motion.span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('previous_events')} 
                        className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'previous_events' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
                    >
                        Historical Nodes
                        {activeTab === 'previous_events' && <motion.span layoutId="activeTabIndicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground shadow-[0_0_10px_rgba(37,99,235,0.5)]"></motion.span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('guests')} 
                        className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'guests' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
                    >
                        Global Directory
                        {activeTab === 'guests' && <motion.span layoutId="activeTabIndicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground shadow-[0_0_10px_rgba(37,99,235,0.5)]"></motion.span>}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'loading' ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32"
                        >
                            <svg className="animate-spin h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </motion.div>
                    ) : activeTab === 'active_events' ? (
                        <motion.div key="active_events" variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderEventCards(activeEvents)}
                        </motion.div>
                    ) : activeTab === 'previous_events' ? (
                        <motion.div key="previous_events" variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderEventCards(previousEvents)}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="guests"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 24 }}
                            className="bg-card backdrop-blur-xl rounded-[32px] border border-border overflow-hidden shadow-2xl"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/20">
                                            <th className="px-8 py-6 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Global Identity</th>
                                            <th className="px-8 py-6 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Communication</th>
                                            <th className="px-8 py-6 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Entry Date</th>
                                            <th className="px-8 py-6 text-right text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {globalGuests.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-20 text-center text-muted-foreground text-[10px] font-mono tracking-[0.2em] uppercase border-dashed border-t border-border">No guests located in ledger.</td>
                                            </tr>
                                        ) : globalGuests.map((guest) => (
                                            <tr key={guest.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="text-sm font-medium text-foreground tracking-tight">{guest.full_name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono mt-1.5">{guest.id}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs text-muted-foreground/80">{guest.email}</div>
                                                    <div className="text-[10px] text-muted-foreground mt-1.5">{guest.phone || 'No phone'}</div>
                                                </td>
                                                <td className="px-8 py-6 text-[10px] font-mono text-muted-foreground">
                                                    {new Date(guest.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => setSelectedGlobalGuest(guest)}
                                                        className="text-[9px] font-bold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-border text-muted-foreground hover:text-background hover:bg-foreground transition-all"
                                                    >
                                                        View Vault
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ARCHITECTURE: High-Fidelity Modal Overlay */}
            <AnimatePresence>
                {selectedGlobalGuest && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-3xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-card border border-border rounded-[40px] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden relative"
                        >
                            {/* Modal Sweep (Primary) */}
                            <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-[30deg] animate-[modalSweep_2s_ease-out_forwards] pointer-events-none z-0" />
                            
                            <div className="p-10 relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-black/[0.05] dark:bg-white/[0.05] rounded-full flex items-center justify-center border border-border text-foreground font-medium text-2xl shadow-inner">
                                            {selectedGlobalGuest.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-medium text-foreground tracking-tight">{selectedGlobalGuest.full_name}</h2>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">UUID: <span className="text-foreground/80">{selectedGlobalGuest.id}</span></p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedGlobalGuest(null)} className="w-10 h-10 flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.03] rounded-full text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-10 p-6 bg-muted/30 rounded-[32px] border border-border shadow-inner">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Network Email</span>
                                        <p className="text-xs text-foreground">{selectedGlobalGuest.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Contact Phone</span>
                                        <p className="text-xs text-foreground">{selectedGlobalGuest.phone || 'Not Provided'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-2">Active Node Registrations</h3>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedGlobalGuest.registered_events?.map((ticket, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-border rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors group">
                                                <div>
                                                    <div className="text-xs font-semibold text-foreground">{ticket.title}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">/{ticket.slug}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {renderStateBadge(ticket.state)}
                                                    <Link href={`/admin/${ticket.slug}`} className="text-muted-foreground hover:text-primary transition-colors group-hover:translate-x-1 duration-300">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="px-10 py-6 bg-card border-t border-border flex justify-end relative z-10">
                                <button onClick={() => setSelectedGlobalGuest(null)} className="text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full bg-foreground text-background transition-all hover:bg-foreground/80 shadow-sm hover:scale-[1.02] active:scale-95">
                                    Close Vault
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}