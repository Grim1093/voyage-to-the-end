"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { AmbientAurora } from '@/components/ui/ambient-aurora';
import { InteractiveAura } from '@/components/ui/interactive-aura';

const EncryptedText = dynamic(
    () => import('@/components/ui/encrypted-text').then((mod) => mod.EncryptedText),
    { ssr: false }
);

export default function MasterAdminLogin() {
    const context = '[Master Admin Login]';
    const [adminKey, setAdminKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        console.log(`${context} Component mounted - Royal Blue / Electric Violet theme active`);
    }, []);

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
            router.push('/admin/');
        }, 800);
    };

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-zinc-200 overflow-hidden relative selection:bg-[#2563EB]/30">
            
            {/* Global Mesh Background & Cursor Aura */}
            <AmbientAurora />
            <InteractiveAura />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="w-full max-w-md z-10"
            >
                {/* Navigation Breadcrumb as a floating pill */}
                <div className="mb-10 text-center flex justify-center">
                    <Link href="/" className="inline-flex items-center text-[10px] font-bold tracking-[0.1em] uppercase text-zinc-400 hover:text-white transition-colors bg-white/[0.02] px-4 py-2 rounded-full border border-white/[0.05] backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Public Directory
                    </Link>
                </div>

                {/* Ultra-Soft Frosted Admin Container */}
                <div className="group relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[32px] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.15)]">
                    
                    {/* ARCHITECTURE: Hardware-Accelerated Holographic Sweep (Royal Blue) */}
                    <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-[#2563EB]/15 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-700 ease-out z-0 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center border border-white/[0.08] shadow-inner transform rotate-3">
                                <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        
                        <h1 className="text-3xl font-medium text-center text-white tracking-tight mb-2 min-h-[1.2em]">
                            <EncryptedText
                                text="Master Override"
                                encryptedClassName="text-zinc-600 font-mono tracking-normal"
                                revealedClassName="text-white"
                                revealDelayMs={50} 
                            />
                        </h1>
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
                                    className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/30 transition-all text-center tracking-[0.4em] font-mono text-sm shadow-inner placeholder-zinc-700"
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
            </motion.div>
        </main>
    );
}