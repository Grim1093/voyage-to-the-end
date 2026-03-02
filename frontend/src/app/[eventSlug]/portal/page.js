"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link'; 
import { loginGuest } from '../../../services/api'; 

export default function GuestPortalLogin() {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[GuestPortalLogin Component - ${eventSlug}]`;
    
    const router = useRouter();
    
    const [formData, setFormData] = useState({ email: '', accessCode: '' });
    const [status, setStatus] = useState('idle'); 
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
            
            // ARCHITECT NOTE: Pass eventSlug to the API layer
            const result = await loginGuest(eventSlug, formData.email, formData.accessCode);
            
            console.log(`${context} Step 4: Authentication successful! Storing guest state.`);
            sessionStorage.setItem('guestData', JSON.stringify(result.data));

            console.log(`${context} Step 5: Redirecting to secure guest dashboard.`);
            // ARCHITECT NOTE: Route to the dynamic dashboard
            router.push(`/${eventSlug}/portal/dashboard`);

        } catch (error) {
            console.error(`${context} CRITICAL FAILURE (Failure Point DD):`, error.message);
            setStatus('error');
            setMessage(error.message || 'Invalid email or access code. Please try again.');
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 text-left relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/40 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-200/40 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>

            <div className="max-w-md w-full z-10">
                
                {/* Navigation Breadcrumb */}
                <div className="mb-6 flex justify-center">
                    <Link href={`/${eventSlug}`} className="inline-flex items-center text-xs font-medium text-purple-700 hover:text-purple-900 transition-colors bg-white/60 px-4 py-2 rounded-full border border-purple-100 backdrop-blur-md shadow-sm hover:shadow active:scale-95 transform duration-150">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return to Event Hub
                    </Link>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white p-8">
                    
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-200 shadow-sm">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Guest Portal</h1>
                        <p className="text-sm text-gray-500 font-medium capitalize">{eventSlug.replace(/-/g, ' ')}</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {status === 'error' && (
                            <div className="flex items-start p-3 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 rounded-r-md text-sm text-red-800 shadow-sm">
                                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registered Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-gray-900 placeholder-gray-400" 
                                placeholder="john@example.com" 
                                disabled={status === 'loading'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">6-Character Access Code</label>
                            <input 
                                type="text" 
                                name="accessCode"
                                value={formData.accessCode} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-gray-900 placeholder-gray-400 uppercase tracking-[0.2em] font-mono" 
                                placeholder="A1B2C3" 
                                maxLength={6}
                                disabled={status === 'loading'}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-purple-500/30 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center group"
                        >
                            {status === 'loading' ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Access Dashboard
                                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}