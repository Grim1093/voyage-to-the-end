"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link'; 
import { motion } from 'framer-motion';
import { loginGuest, resendAccessCode } from '../../../services/api'; 
import { AmbientAurora } from '@/components/ui/ambient-aurora';
import { InteractiveAura } from '@/components/ui/interactive-aura';

export default function GuestPortalLogin() {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[GuestPortalLogin Component - ${eventSlug}]`;
    
    const router = useRouter();

    useEffect(() => {
        console.log(`${context} Component mounted - Dynamic Theme Active (Light/Dark Mode Ready)`);
    }, [context]);
    
    const [formData, setFormData] = useState({ email: '', accessCode: '' });
    const [status, setStatus] = useState('idle'); // idle | loading | error | success
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log(`${context} Step 1: Guest login attempt triggered for ${formData.email}`);
        setStatus('loading');
        setMessage('');

        if (!formData.email || !formData.accessCode) {
            console.warn(`${context} Failure Point CC: Missing email or access code.`);
            setStatus('error');
            setMessage('Please provide both your registered email and your 6-character access code.');
            return;
        }

        try {
            console.log(`${context} Step 3: Hitting backend authentication endpoint for event: ${eventSlug}...`);
            
            const result = await loginGuest(eventSlug, formData.email, formData.accessCode);
            
            console.log(`${context} Step 4: Authentication successful! Storing guest state.`);
            sessionStorage.setItem('guestData', JSON.stringify(result.data));

            console.log(`${context} Step 5: Redirecting to secure guest dashboard.`);
            router.push(`/${eventSlug}/portal/dashboard`);

        } catch (error) {
            console.error(`${context} CRITICAL FAILURE (Failure Point DD):`, error.message);
            setStatus('error');
            setMessage(error.message || 'Invalid email or access code. Please try again.');
        }
    };

    // ARCHITECT NOTE: Handler for the code recovery mechanism
    const handleResendCode = async () => {
        console.log(`${context} Step 1: Guest code recovery triggered.`);
        
        if (!formData.email) {
            console.warn(`${context} Failure Point R-UI: Email missing for recovery.`);
            setStatus('error');
            setMessage('Please enter your registered email address above to resend the code.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            console.log(`${context} Step 2: Hitting backend code recovery endpoint...`);
            await resendAccessCode(eventSlug, formData.email);
            
            console.log(`${context} Step 3: Code recovery request successful.`);
            setStatus('success');
            setMessage('A new access code has been dispatched to your email.');
        } catch (error) {
            console.error(`${context} CRITICAL FAILURE (Failure Point R-UI-Fail):`, error.message);
            setStatus('error');
            setMessage(error.message || 'Failed to resend access code. Please verify your email or try again.');
        }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-foreground relative selection:bg-primary/30 overflow-hidden transition-colors duration-300">
            
            {/* Global Mesh Background & Cursor Aura */}
            <AmbientAurora />
            <InteractiveAura />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="max-w-md w-full z-10 flex flex-col items-center"
            >
                
                {/* Floating Navigation Pill */}
                <div className="mb-8 w-full flex justify-center">
                    <Link href={`/${eventSlug}`} className="inline-flex items-center text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors bg-black/[0.02] dark:bg-white/[0.02] px-4 py-2 rounded-full border border-border backdrop-blur-md shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return to Event Hub
                    </Link>
                </div>

                {/* Ultra-Soft Frosted Container with Holographic Sweep */}
                <div className="group relative overflow-hidden w-full bg-card/50 dark:bg-white/[0.02] backdrop-blur-2xl rounded-[32px] shadow-xl dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] border border-border p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.15)]">
                    
                    {/* ARCHITECTURE: Hardware-Accelerated Holographic Sweep */}
                    <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-primary/15 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-700 ease-out z-0 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <div className="w-14 h-14 bg-black/[0.03] dark:bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-5 border border-border shadow-inner">
                                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </div>
                            <h1 className="text-3xl font-medium text-foreground mb-2 tracking-tight">Guest Portal</h1>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.2em]">{eventSlug.replace(/-/g, ' ')}</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            
                            {/* Dynamic Status Badges: Refined Luma Styling */}
                            {status === 'error' && (
                                <div className="flex items-start p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-xs text-rose-600 dark:text-rose-400/80 shadow-sm tracking-wide">
                                    <svg className="w-4 h-4 text-rose-500/80 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {message}
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="flex items-start p-4 bg-accent/10 border border-accent/20 rounded-2xl text-xs text-accent shadow-sm transition-all tracking-wide">
                                    <svg className="w-4 h-4 text-accent mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {message}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-[0.15em]">Registered Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    className="w-full px-5 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-sm border border-border rounded-full focus:ring-1 focus:ring-primary/50 focus:border-primary/30 outline-none transition-all duration-300 shadow-inner hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-foreground placeholder-muted-foreground/50 text-sm" 
                                    placeholder="guest@enterprise.com" 
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-[0.15em]">6-Character Access Code</label>
                                <input 
                                    type="text" 
                                    name="accessCode"
                                    value={formData.accessCode} 
                                    onChange={handleChange} 
                                    className="w-full px-5 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-sm border border-border rounded-full focus:ring-1 focus:ring-primary/50 focus:border-primary/30 outline-none transition-all duration-300 shadow-inner hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-foreground placeholder-muted-foreground/50 uppercase tracking-[0.3em] font-mono text-sm" 
                                    placeholder="A1B2C3" 
                                    maxLength={6}
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={status === 'loading'}
                                className="w-full bg-foreground text-background hover:bg-foreground/80 font-semibold py-3.5 px-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.1)] transform transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center group text-sm tracking-wide mt-2"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Access Secure Dashboard
                                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Minimalist Code Recovery UI */}
                        <div className="mt-8 pt-6 border-t border-border text-center">
                            <p className="text-[11px] text-muted-foreground font-medium flex flex-col sm:flex-row items-center justify-center gap-1.5 tracking-wide">
                                <span>Didn't receive your access code?</span>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={status === 'loading'}
                                    className="text-foreground/80 font-semibold hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline decoration-border hover:decoration-foreground/20 underline-offset-4"
                                >
                                    Resend it
                                </button>
                            </p>
                        </div>

                    </div>
                </div>
            </motion.div>
        </main>
    );
}