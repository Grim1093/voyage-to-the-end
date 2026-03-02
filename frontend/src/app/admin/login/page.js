"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MasterAdminLogin() {
    const context = '[Master Admin Login]';
    const [adminKey, setAdminKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (!adminKey.trim()) {
            setError('System override key is required.');
            setLoading(false);
            return;
        }

        console.log(`${context} Establishing secure session...`);

        // Create a session object valid for 2 hours (7200000 ms)
        const sessionData = {
            key: adminKey,
            expiresAt: Date.now() + 7200000
        };

        sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
        
        // ARCHITECT NOTE: The crucial fix! Redirecting strictly to the Master Control Plane.
        setTimeout(() => {
            router.push('/admin');
        }, 800); // Slight delay for UX polish
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-slate-800/20 rounded-full filter blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-md">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return to Public Directory
                    </Link>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-600 shadow-inner">
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-center text-white tracking-tight mb-2">Master Override</h1>
                    <p className="text-center text-slate-400 text-sm mb-8">Enter your security key to access the Master Control Plane.</p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-900/30 border-l-4 border-red-500 text-red-300 text-sm rounded-r-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Security Key</label>
                            <input 
                                type="password" 
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all text-center tracking-widest font-mono"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 px-6 bg-slate-200 hover:bg-white text-slate-900 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                'Authenticate'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}