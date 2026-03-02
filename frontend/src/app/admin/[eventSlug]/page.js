"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link'; 
// ARCHITECT NOTE: Import path is exactly 3 levels up to hit src/services/api.js
import { getAllGuests, updateGuestState, fetchGuestDetails } from '../../../services/api';

export default function GuestLedgerDashboard() {
    const params = useParams();
    const eventSlug = params.eventSlug; 
    const context = `[Guest Ledger - ${eventSlug}]`;
    
    const router = useRouter();

    const [guests, setGuests] = useState([]);
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('');
    
    // Modal & Lazy Load State
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [inspectLoading, setInspectLoading] = useState(null); 
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGuests, setTotalGuests] = useState(0);
    const [limit, setLimit] = useState(10);

    const fetchLedger = useCallback(async (pageToFetch = currentPage, limitToFetch = limit) => {
        console.log(`${context} Step 1: Triggering ledger fetch. Page: ${pageToFetch}, Limit: ${limitToFetch}`);
        setStatus('loading');
        try {
            const result = await getAllGuests(eventSlug, pageToFetch, limitToFetch); 
            setGuests(result.data);
            setCurrentPage(result.pagination.currentPage);
            setTotalPages(result.pagination.totalPages);
            setTotalGuests(result.pagination.totalGuests);
            setStatus('success');
            console.log(`${context} Step 2: Ledger successfully rendered in UI.`);
        } catch (error) {
            console.error(`${context} Failure Point T: UI failed to load ledger.`, error.message);
            setStatus('error');
            setMessage(error.message);

            if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
                sessionStorage.removeItem('adminSession');
                // ARCHITECT NOTE: Routing to Master Vault
                router.push('/admin/login');
            }
        }
    }, [currentPage, limit, router, eventSlug, context]);

    useEffect(() => {
        const validateGatekeeper = () => {
            const sessionString = sessionStorage.getItem('adminSession');
            if (!sessionString) {
                console.warn(`${context} Failure Point V: No session found. Redirecting to master vault.`);
                router.push('/admin/login');
                return false;
            }

            try {
                const sessionData = JSON.parse(sessionString);
                if (Date.now() > sessionData.expiresAt) {
                    console.warn(`${context} Failure Point W: Active session expired. Enforcing logout.`);
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
            fetchLedger(1, 10); 
        }

        const passiveSecurityCheck = setInterval(() => {
            validateGatekeeper();
        }, 60000);

        return () => clearInterval(passiveSecurityCheck);
    }, [fetchLedger, router, context]);

    const handleStateChange = async (guestId, newState) => {
        console.log(`${context} Action: Admin overriding transition to State ${newState} for ${guestId}`);
        try {
            await updateGuestState(eventSlug, guestId, newState);
            fetchLedger(currentPage, limit); 
        } catch (error) {
            alert(`Failed to update state: ${error.message}`);
        }
    };

    const handleInspectGuest = async (guestId) => {
        console.log(`${context} Action: Admin initiating lazy-load for guest ${guestId}`);
        setInspectLoading(guestId);
        try {
            const fullProfile = await fetchGuestDetails(eventSlug, guestId);
            setSelectedGuest(fullProfile);
        } catch (error) {
            alert(`Failed to retrieve extended details: ${error.message}`);
        } finally {
            setInspectLoading(null);
        }
    };

    const handleLockVault = () => {
        console.log(`${context} Action: Admin manually locking the vault.`);
        sessionStorage.removeItem('adminSession');
        router.push('/admin/login');
    };

    // Pagination Handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) fetchLedger(currentPage + 1, limit);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) fetchLedger(currentPage - 1, limit);
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        setLimit(newLimit);
        fetchLedger(1, newLimit); 
    };

    const renderStateBadge = (state) => {
        switch(state) {
            case 0: 
                return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-600 rounded-full text-xs font-medium tracking-wide shadow-sm">0: Invited</span>;
            case 1: 
                return <span className="px-2.5 py-1 bg-amber-900/40 text-amber-400 border border-amber-700/50 rounded-full text-xs font-medium tracking-wide shadow-sm shadow-amber-900/20">1: Submitted</span>;
            case 2: 
                return <span className="px-2.5 py-1 bg-emerald-900/40 text-emerald-400 border border-emerald-700/50 rounded-full text-xs font-medium tracking-wide shadow-sm shadow-emerald-900/20">2: Verified</span>;
            case -1: 
                return <span className="px-2.5 py-1 bg-rose-900/40 text-rose-400 border border-rose-700/50 rounded-full text-xs font-medium tracking-wide shadow-sm shadow-rose-900/20">-1: Action Req</span>;
            default: 
                return <span className="px-2.5 py-1 bg-slate-800 text-slate-500 rounded-full text-xs">Unknown</span>;
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black p-6 md:p-10 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-slate-800/20 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto z-10 relative">
                
                {/* ARCHITECT NOTE: Added breadcrumb back to Master Dashboard */}
                <div className="mb-6">
                    <Link href="/admin" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Control Plane
                    </Link>
                </div>

                <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Ledger Explorer</h1>
                        </div>
                        <p className="text-slate-400 text-sm">Target Environment: <span className="text-emerald-400 font-mono">/{eventSlug}</span></p>
                    </div>
                    
                    <button 
                        onClick={handleLockVault}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-900/80 hover:text-rose-200 hover:border-rose-700/50 text-slate-300 border border-slate-700 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        Lock Vault
                    </button>
                </header>

                {status === 'error' && (
                    <div className="p-4 bg-red-900/30 border-l-4 border-red-500 text-red-300 rounded-r-md mb-8 backdrop-blur-sm">
                        {message}
                    </div>
                )}

                {status === 'loading' ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg className="animate-spin h-8 w-8 text-slate-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-slate-500 font-mono text-sm tracking-widest uppercase">Syncing Ledger...</span>
                    </div>
                ) : (
                    <div className="bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden border border-slate-700/50 flex flex-col">
                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-slate-800 text-sm text-left">
                                <thead className="bg-slate-800/80 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-5">Guest Identity</th>
                                        <th className="px-6 py-5">Contact Node</th>
                                        <th className="px-6 py-5">Ledger State</th>
                                        <th className="px-6 py-5">Timestamp</th>
                                        <th className="px-6 py-5 text-right">Execution</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                    {guests.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-mono">No records found in ledger.</td></tr>
                                    ) : (
                                        guests.map((guest) => (
                                            <tr key={guest.id} className="hover:bg-slate-800/40 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-200">{guest.full_name}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[150px]">{guest.id}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">{guest.email}</td>
                                                <td className="px-6 py-4">{renderStateBadge(guest.current_state)}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                    {new Date(guest.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        
                                                        <button 
                                                            onClick={() => handleInspectGuest(guest.id)}
                                                            disabled={inspectLoading === guest.id}
                                                            className="text-blue-400 bg-blue-900/20 hover:bg-blue-600 hover:text-white border border-blue-800/50 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px]"
                                                        >
                                                            {inspectLoading === guest.id ? (
                                                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                            ) : (
                                                                'INSPECT'
                                                            )}
                                                        </button>

                                                        <button 
                                                            onClick={() => handleStateChange(guest.id, 2)} 
                                                            className="text-emerald-400 bg-emerald-900/20 hover:bg-emerald-600 hover:text-white border border-emerald-800/50 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm"
                                                        >
                                                            VERIFY
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStateChange(guest.id, -1)} 
                                                            className="text-rose-400 bg-rose-900/20 hover:bg-rose-600 hover:text-white border border-rose-800/50 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm"
                                                        >
                                                            REJECT
                                                        </button>
                                                        {guest.current_state !== 1 && (
                                                            <button 
                                                                onClick={() => handleStateChange(guest.id, 1)} 
                                                                className="text-amber-400 bg-amber-900/20 hover:bg-amber-600 hover:text-white border border-amber-800/50 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm"
                                                            >
                                                                RESET
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalGuests > 0 && (
                            <div className="bg-slate-800/50 border-t border-slate-700/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-slate-400">
                                    Showing <span className="font-medium text-slate-200">{((currentPage - 1) * limit) + 1}</span> to <span className="font-medium text-slate-200">{Math.min(currentPage * limit, totalGuests)}</span> of <span className="font-medium text-slate-200">{totalGuests}</span> guests
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="limit-select" className="text-sm text-slate-400">Rows:</label>
                                        <select 
                                            id="limit-select"
                                            value={limit} 
                                            onChange={handleLimitChange}
                                            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded focus:ring-slate-500 focus:border-slate-500 block p-1"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handlePrevPage} 
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${currentPage === 1 ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                        >
                                            Prev
                                        </button>
                                        <div className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-sm font-medium">
                                            {currentPage} / {totalPages}
                                        </div>
                                        <button 
                                            onClick={handleNextPage} 
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${currentPage === totalPages || totalPages === 0 ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedGuest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{selectedGuest.full_name}</h2>
                                <p className="text-slate-400 font-mono text-xs">{selectedGuest.id}</p>
                            </div>
                            <button onClick={() => setSelectedGuest(null)} className="text-slate-500 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</span>
                                    <span className="text-sm text-slate-300">{selectedGuest.email}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</span>
                                    <span className="text-sm text-slate-300">{selectedGuest.phone || 'Not Provided'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dietary Restrictions</span>
                                <span className="text-sm text-slate-300">{selectedGuest.dietary_restrictions || 'None listed'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ID Document</span>
                                {selectedGuest.id_document_url ? (
                                    <a href={selectedGuest.id_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                                        View Attached Document
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                ) : (
                                    <span className="text-sm text-slate-500 italic">No document on file</span>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-end">
                            <button onClick={() => setSelectedGuest(null)} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors">
                                Close Vault
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}