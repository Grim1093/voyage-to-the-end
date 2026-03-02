"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ARCHITECT NOTE: Importing our new highly-secured fetcher
import { fetchAllAdminEvents } from '../../services/api';

export default function MasterDashboard() {
    const context = '[Master Control Plane]';
    const router = useRouter();

    const [events, setEvents] = useState([]);
    const [status, setStatus] = useState('loading'); 

    useEffect(() => {
        const validateGatekeeper = () => {
            const sessionString = sessionStorage.getItem('adminSession');
            if (!sessionString) {
                router.push('/admin/login');
                return false;
            }
            try {
                const sessionData = JSON.parse(sessionString);
                if (Date.now() > sessionData.expiresAt) {
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

        if (validateGatekeeper()) {
            loadTenants();
        }
    }, [router]);

    const loadTenants = async () => {
        console.log(`${context} Fetching deployed tenants from master ledger...`);
        try {
            // ARCHITECT NOTE: Now fetching ALL events, bypassing the public filter
            const data = await fetchAllAdminEvents();
            setEvents(data);
            setStatus('success');
        } catch (error) {
            console.error(`${context} Failed to load events.`, error);
            setStatus('error');
        }
    };

    const handleLockVault = () => {
        console.log(`${context} Action: Admin manually locking the vault.`);
        sessionStorage.removeItem('adminSession');
        router.push('/admin/login');
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black p-6 md:p-10 relative overflow-hidden">
            
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-800/20 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto z-10 relative">
                
                <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Master Control Plane</h1>
                        </div>
                        <p className="text-slate-400 text-sm">Manage deployments, tenants, and global event ledgers.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link 
                            href={`/admin/events/new`}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md shadow-blue-900/20"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Deploy New Tenant
                        </Link>

                        <button 
                            onClick={handleLockVault}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-900/80 hover:text-rose-200 hover:border-rose-700/50 text-slate-300 border border-slate-700 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                            Lock Vault
                        </button>
                    </div>
                </header>

                {status === 'loading' ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-slate-500 font-mono text-sm tracking-widest uppercase">Fetching Tenants...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.length === 0 ? (
                            <div className="col-span-full p-10 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 text-center italic">
                                No active tenants found in the database. Deploy a new event to begin.
                            </div>
                        ) : (
                            events.map((event) => (
                                <div key={event.slug} className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 flex flex-col shadow-lg transition-all hover:border-blue-500/50 hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-800/50">
                                            <span className="text-blue-400 font-bold text-sm uppercase">{event.slug.charAt(0)}</span>
                                        </div>
                                        
                                        {/* ARCHITECT NOTE: Dynamic Visibility Badge */}
                                        {event.is_public ? (
                                            <span className="px-2.5 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-full text-xs font-semibold">Public</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-amber-900/30 text-amber-400 border border-amber-800/50 rounded-full text-xs font-semibold">Private</span>
                                        )}

                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1 truncate">{event.title}</h3>
                                    
                                    <a 
                                        href={`/${event.slug}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-xs mb-6 truncate group w-fit"
                                    >
                                        /{event.slug}
                                        <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                    
                                    <div className="mt-auto flex gap-3">
                                        <Link 
                                            href={`/admin/${event.slug}`} 
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center border border-slate-700"
                                        >
                                            Manage Ledger
                                        </Link>
                                        <Link 
                                            href={`/admin/events/${event.slug}/edit`} 
                                            className="w-10 flex items-center justify-center bg-slate-800/50 hover:bg-blue-600 text-slate-400 hover:text-white rounded transition-colors border border-slate-700/50"
                                            title="Edit Event Details"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}