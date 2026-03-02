"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAllAdminEvents, fetchGlobalGuests } from '../../services/api';

export default function MasterDashboard() {
    const context = '[Master Control Plane]';
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('events'); // 'events' | 'guests'
    const [events, setEvents] = useState([]);
    const [globalGuests, setGlobalGuests] = useState([]);
    const [status, setStatus] = useState('loading'); 
    const [selectedGlobalGuest, setSelectedGlobalGuest] = useState(null);

    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

    useEffect(() => {
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
            if (activeTab === 'events') {
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

    // ARCHITECT NOTE: Status indicators now use the "Dot + Text" blend style with no container
    const renderStateBadge = (state) => {
        switch(state) {
            case 0: return <span className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-zinc-600"></span> Invited</span>;
            case 1: return <span className="flex items-center gap-1.5 text-indigo-400/80 text-[10px] font-bold uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></span> Review</span>;
            case 2: return <span className="flex items-center gap-1.5 text-zinc-300 text-[10px] font-bold uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"></span> Verified</span>;
            case -1: return <span className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-rose-500"></span> Action</span>;
            default: return <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">N/A</span>;
        }
    };

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center text-zinc-200 relative selection:bg-indigo-500/30 overflow-hidden">
            
            <div className="absolute inset-0 pointer-events-none z-0 flex justify-center">
                <div className="absolute top-[-30%] w-[1000px] h-[800px] bg-white/[0.02] rounded-full filter blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full filter blur-[120px]"></div>
            </div>

            <header className="w-full max-w-7xl flex items-center justify-between px-6 py-5 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-[11px] tracking-tighter">
                        NX
                    </div>
                    <div>
                        <h1 className="text-xs font-bold text-white tracking-[0.2em] uppercase">Control Plane</h1>
                        <p className="text-[9px] text-zinc-500 font-medium tracking-wide">Master Ledger Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/events/new"
                        className="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-black bg-white hover:bg-zinc-200 px-4 py-2 rounded-full transition-all"
                    >
                        Deploy Tenant
                    </Link>
                    <button 
                        onClick={handleLockVault}
                        className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors bg-white/[0.02] border border-white/[0.05] px-4 py-2 rounded-full backdrop-blur-md"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        Lock Vault
                    </button>
                </div>
            </header>

            <div className="max-w-7xl w-full z-10 flex flex-col px-6 pb-12">
                
                <div className="flex space-x-8 mb-10 mt-4 border-b border-white/[0.03]">
                    <button 
                        onClick={() => setActiveTab('events')} 
                        className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'events' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Active Tenants
                        {activeTab === 'events' && <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('guests')} 
                        className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'guests' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Global Directory
                        {activeTab === 'guests' && <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white"></span>}
                    </button>
                </div>

                {status === 'loading' ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <svg className="animate-spin h-5 w-5 text-zinc-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : activeTab === 'events' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-zinc-600 text-xs font-medium italic">No active nodes detected.</div>
                        ) : (
                            events.map((event) => (
                                <div key={event.slug} className="bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-8 flex flex-col transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/[0.08] text-xs font-bold text-zinc-400">
                                            {event.slug.charAt(0).toUpperCase()}
                                        </div>
                                        {/* ARCHITECT NOTE: Seamless blend for Public/Private indicators */}
                                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${event.is_public ? 'text-zinc-400' : 'text-indigo-400/80'}`}>
                                            <span className={`w-1 h-1 rounded-full ${event.is_public ? 'bg-zinc-500' : 'bg-indigo-500'}`}></span>
                                            {event.is_public ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-1 truncate">{event.title}</h3>
                                    
                                    <a 
                                        href={`/${event.slug}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-zinc-500 text-[10px] font-mono mb-8 hover:text-indigo-400 transition-colors underline decoration-zinc-800 underline-offset-4 flex items-center gap-1.5"
                                    >
                                        /{event.slug}
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                    
                                    <div className="mt-auto flex gap-3">
                                        <Link href={`/admin/${event.slug}`} className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-zinc-200 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-center transition-all">
                                            Manage Node
                                        </Link>
                                        <Link href={`/admin/events/${event.slug}/edit`} className="w-11 h-11 flex items-center justify-center bg-white/[0.03] hover:bg-indigo-500/20 border border-white/[0.05] text-zinc-400 hover:text-indigo-400 rounded-full transition-all">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="bg-white/[0.01] backdrop-blur-xl rounded-[32px] border border-white/[0.05] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/[0.03]">
                                        <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Global Identity</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Communication</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Entry Date</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {globalGuests.map((guest) => (
                                        <tr key={guest.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-medium text-zinc-200">{guest.full_name}</div>
                                                <div className="text-[10px] text-zinc-600 font-mono mt-1">{guest.id}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-xs text-zinc-400">{guest.email}</div>
                                                <div className="text-[10px] text-zinc-600 mt-1">{guest.phone || 'No phone'}</div>
                                            </td>
                                            <td className="px-8 py-5 text-[10px] font-mono text-zinc-500">
                                                {new Date(guest.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => setSelectedGlobalGuest(guest)}
                                                    className="text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all"
                                                >
                                                    Vault Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {selectedGlobalGuest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-950 border border-white/[0.08] rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="p-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center border border-white/[0.1] text-white font-medium text-2xl">
                                        {selectedGlobalGuest.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-medium text-white tracking-tight">{selectedGlobalGuest.full_name}</h2>
                                        <p className="text-xs text-zinc-600 font-mono mt-1">UUID: {selectedGlobalGuest.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedGlobalGuest(null)} className="w-10 h-10 flex items-center justify-center bg-white/[0.03] rounded-full text-zinc-500 hover:text-white transition-colors border border-white/[0.05]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10 p-6 bg-white/[0.02] rounded-[32px] border border-white/[0.05]">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Network Email</span>
                                    <p className="text-xs text-zinc-300">{selectedGlobalGuest.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Contact Phone</span>
                                    <p className="text-xs text-zinc-300">{selectedGlobalGuest.phone || 'Not Provided'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Active Node Registrations</h3>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedGlobalGuest.registered_events?.map((ticket, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                                            <div>
                                                <div className="text-xs font-semibold text-zinc-200">{ticket.title}</div>
                                                <div className="text-[10px] text-zinc-600 font-mono">/{ticket.slug}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {renderStateBadge(ticket.state)}
                                                <Link href={`/admin/${ticket.slug}`} className="text-zinc-500 hover:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="px-10 py-6 bg-white/[0.02] border-t border-white/[0.05] flex justify-end">
                            <button onClick={() => setSelectedGlobalGuest(null)} className="text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full bg-white text-black transition-all hover:bg-zinc-200">
                                Close Vault
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}