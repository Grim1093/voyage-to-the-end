"use client";

import { useState, useEffect } from 'react';
import { registerGuest } from '../services/api';

// ARCHITECT NOTE: We receive the eventSlug from the parent page wrapper
export default function GuestIntakeForm({ eventSlug }) {
    const context = `[GuestIntakeForm Component - ${eventSlug}]`;

    useEffect(() => {
        console.log(`${context} Component mounted - Royal Blue / Electric Violet theme active`);
    }, [context]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        idNumber: '',
        idDocumentUrl: '',
        dietaryRestrictions: ''
    });

    const [status, setStatus] = useState('idle'); 
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`${context} Step 1: Form submission triggered by user.`);
        setStatus('loading');
        setMessage('');

        if (!formData.fullName || !formData.email || !formData.idNumber || !formData.idDocumentUrl) {
            console.warn(`${context} Failure Point N: Frontend validation failed. Missing required fields.`);
            setStatus('error');
            setMessage('Please fill out all required fields (Name, Email, ID Number, ID URL).');
            return;
        }

        try {
            console.log(`${context} Step 3: Validation passed. Handing off to API Service Layer for event: ${eventSlug}`);
            
            // ARCHITECT NOTE: Passing the eventSlug down to the service layer
            const result = await registerGuest(eventSlug, formData);
            
            console.log(`${context} Step 4: UI received success confirmation. Guest State is initialized at 1.`);
            setStatus('success');
            setMessage(`Registration successful! Your secure Guest ID is: ${result.guestId}`);
            
            setFormData({
                fullName: '', email: '', phone: '', idNumber: '', idDocumentUrl: '', dietaryRestrictions: ''
            });

        } catch (error) {
            console.error(`${context} CRITICAL FAILURE: Caught error from API service.`, error.message);
            setStatus('error');
            setMessage(error.message || 'An error occurred during registration. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 text-left p-4 sm:p-8">
            
            {/* Minimalist Feedback Banners */}
            {status === 'error' && (
                <div className="flex items-start p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-xs text-rose-400/80 shadow-sm tracking-wide">
                    <svg className="w-4 h-4 text-rose-500/80 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="font-medium">{message}</p>
                </div>
            )}
            
            {status === 'success' && (
                <div className="flex flex-col p-6 bg-[#7C3AED]/5 border border-[#7C3AED]/10 rounded-3xl shadow-[0_0_20px_rgba(124,58,237,0.05)] text-center">
                    <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-[#7C3AED]/10 mb-3 border border-[#7C3AED]/20">
                        <svg className="h-5 w-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-[#7C3AED] mb-1">{message}</p>
                    <p className="text-[11px] text-[#7C3AED]/60 tracking-wide font-medium">Check your email for your 6-character access code.</p>
                </div>
            )}

            {/* Input Grid - Optimized for Luma minimalist aesthetic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} 
                        className="w-full px-5 py-3.5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-full focus:ring-1 focus:ring-[#2563EB]/50 focus:border-[#2563EB]/30 outline-none transition-all duration-300 shadow-inner hover:bg-white/[0.04] text-zinc-200 placeholder-zinc-700 text-sm" 
                        placeholder="Satoshi Nakamoto" disabled={status === 'loading'} />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} 
                        className="w-full px-5 py-3.5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-full focus:ring-1 focus:ring-[#2563EB]/50 focus:border-[#2563EB]/30 outline-none transition-all duration-300 shadow-inner hover:bg-white/[0.04] text-zinc-200 placeholder-zinc-700 text-sm" 
                        placeholder="satoshi@network.com" disabled={status === 'loading'} />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} 
                        className="w-full px-5 py-3.5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-full focus:ring-1 focus:ring-[#2563EB]/50 focus:border-[#2563EB]/30 outline-none transition-all duration-300 shadow-inner hover:bg-white/[0.04] text-zinc-200 placeholder-zinc-700 text-sm" 
                        placeholder="+1 234 567 8900" disabled={status === 'loading'} />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">ID Number</label>
                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} 
                        className="w-full px-5 py-3.5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-full focus:ring-1 focus:ring-[#2563EB]/50 focus:border-[#2563EB]/30 outline-none transition-all duration-300 shadow-inner hover:bg-white/[0.04] text-zinc-200 placeholder-zinc-700 font-mono text-sm tracking-wider" 
                        placeholder="Passport / Govt ID" disabled={status === 'loading'} />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Identity Document URL</label>
                    <input type="text" name="idDocumentUrl" value={formData.idDocumentUrl} onChange={handleChange} 
                        className="w-full px-5 py-3.5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-full focus:ring-1 focus:ring-[#2563EB]/50 focus:border-[#2563EB]/30 outline-none transition-all duration-300 shadow-inner hover:bg-white/[0.04] text-zinc-200 placeholder-zinc-700 text-sm" 
                        placeholder="https://secure.storage.com/id-scan.jpg" disabled={status === 'loading'} />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Dietary Restrictions</label>
                    <input type="text" name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} 
                        className="w-full px-5 py-3.5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-full focus:ring-1 focus:ring-[#2563EB]/50 focus:border-[#2563EB]/30 outline-none transition-all duration-300 shadow-inner hover:bg-white/[0.04] text-zinc-200 placeholder-zinc-700 text-sm" 
                        placeholder="e.g. Vegetarian, Gluten-free" disabled={status === 'loading'} />
                </div>
            </div>

            <button type="submit" disabled={status === 'loading'} 
                className="w-full mt-10 bg-white text-black hover:bg-zinc-200 font-bold py-4 px-6 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.1)] transform transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center group text-xs uppercase tracking-[0.2em]">
                
                {status === 'loading' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Encrypting...
                    </>
                ) : (
                    <>
                        Complete Registration
                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                )}
            </button>
        </form>
    );
}