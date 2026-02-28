"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
    const context = '[AdminLogin Component]';
    const router = useRouter();
    
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        console.log(`${context} Step 1: Admin login attempt triggered.`);
        setError('');
        setIsUnlocking(true);

        if (!inputKey.trim()) {
            console.warn(`${context} Failure Point U: Empty admin key submitted.`);
            setError('Please enter the administrative key.');
            setIsUnlocking(false);
            return;
        }

        // --- TTL SESSION LOGIC ---
        const SESSION_DURATION_MS = 60 * 60 * 1000; 
        const expiresAt = Date.now() + SESSION_DURATION_MS;

        const sessionData = {
            key: inputKey.trim(),
            expiresAt: expiresAt
        };

        console.log(`${context} Step 2: Saving admin key with TTL timestamp to sessionStorage.`);
        sessionStorage.setItem('adminSession', JSON.stringify(sessionData));

        console.log(`${context} Step 3: Redirecting to the secure Admin Dashboard.`);
        router.push('/admin');
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col items-center justify-center p-6 text-left relative overflow-hidden">
            
            {/* Ambient Security Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-700/20 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div className="max-w-md w-full z-10">
                
                {/* Navigation Breadcrumb */}
                <div className="mb-6 flex justify-center">
                    <Link href="/" className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 backdrop-blur-md">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return to Hub
                    </Link>
                </div>

                {/* Vault Terminal UI */}
                <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 p-8 border border-slate-700/50 relative overflow-hidden">
                    
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-50"></div>

                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-slate-900/80 rounded-lg flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-inner">
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-wide mb-1">System Override</h1>
                        <p className="text-sm text-slate-400 font-mono">Authenticate to access the ledger.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="flex items-center p-3 bg-red-900/30 border-l-2 border-red-500 rounded text-sm text-red-200 backdrop-blur-sm">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Administrative Key</label>
                            <input 
                                type="password" 
                                value={inputKey} 
                                onChange={(e) => setInputKey(e.target.value)} 
                                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent text-white placeholder-slate-600 font-mono text-sm tracking-widest transition-all outline-none shadow-inner" 
                                placeholder="••••••••••••••••" 
                                disabled={isUnlocking}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isUnlocking}
                            className="w-full bg-slate-200 hover:bg-white text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-70 flex justify-center items-center"
                        >
                            {isUnlocking ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                'Unlock Ledger'
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </main>
    );
}