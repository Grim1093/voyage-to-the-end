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

        // ARCHITECT NOTE: Inactivity is now handled dynamically by the dashboard.
        const sessionData = {
            key: adminKey
        };

        sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
        
        // ARCHITECT NOTE: Redirecting to the Master Control Plane.
        setTimeout(() => {
            router.push('/admin');
        }, 800);
    };

    return (
        // ARCHITECT NOTE: Softened background to match the Luma-esque zinc-950 aesthetic
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-zinc-200 overflow-hidden relative selection:bg-indigo-500/30">
            
            {/* Highly desaturated, elegant ambient glows */}
            <div className="absolute inset-0 pointer-events-none z-0 flex justify-center">
                <div className="absolute top-[-20%] w-[800px] h-[600px] bg-white/[0.02] rounded-full filter blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full filter blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md z-10">
                {/* Navigation Breadcrumb as a floating pill */}
                <div className="mb-10 text-center flex justify-center">
                    <Link href="/" className="inline-flex items-center text-[10px] font-bold tracking-[0.1em] uppercase text-zinc-400 hover:text-white transition-colors bg-white/[0.02] px-4 py-2 rounded-full border border-white/[0.05] backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Public Directory
                    </Link>
                </div>

                {/* Ultra-Soft Frosted Admin Container */}
                <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[32px] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center border border-white/[0.08] shadow-inner transform rotate-3">
                            <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-medium text-center text-white tracking-tight mb-2">Master Override</h1>
                    <p className="text-center text-zinc-500 text-xs font-normal mb-10 leading-relaxed tracking-wide">Authorized access only to the Master Control Plane.</p>

                    {error && (
                        <div className="mb-8 flex items-center p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400/80 text-xs font-medium rounded-2xl tracking-wide">
                            <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Security Key</label>
                            <input 
                                type="password" 
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-center tracking-[0.4em] font-mono text-sm shadow-inner placeholder-zinc-700"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 px-6 bg-white hover:bg-zinc-200 text-black rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] active:scale-[0.98]"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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