"use client";

import { useState } from 'react';
import { registerGuest } from '../services/api';

export default function GuestIntakeForm() {
    const context = '[GuestIntakeForm Component]';

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
            console.log(`${context} Step 3: Validation passed. Handing off to API Service Layer.`);
            const result = await registerGuest(formData);
            
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
        <form onSubmit={handleSubmit} className="space-y-6 text-left p-2">
            
            {/* Feedback Banners */}
            {status === 'error' && (
                <div className="flex items-start p-4 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 rounded-r-lg shadow-sm">
                    <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm font-medium text-red-800">{message}</p>
                </div>
            )}
            
            {status === 'success' && (
                <div className="flex flex-col p-5 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl shadow-sm text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm font-medium text-green-800 mb-1">{message}</p>
                    <p className="text-xs text-green-600">Check your email for your 6-character access code.</p>
                </div>
            )}

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} 
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-gray-900" 
                        placeholder="e.g. Satoshi Nakamoto" disabled={status === 'loading'} />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} 
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-gray-900" 
                        placeholder="satoshi@network.com" disabled={status === 'loading'} />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} 
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-gray-900" 
                        placeholder="+1 234 567 8900" disabled={status === 'loading'} />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Number *</label>
                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} 
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-gray-900 font-mono text-sm" 
                        placeholder="Passport / Govt ID" disabled={status === 'loading'} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Document URL *</label>
                    <input type="text" name="idDocumentUrl" value={formData.idDocumentUrl} onChange={handleChange} 
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-gray-900" 
                        placeholder="https://secure.storage.com/id-scan.jpg" disabled={status === 'loading'} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dietary Restrictions</label>
                    <input type="text" name="dietaryRestrictions" value={formData.dietaryRestrictions} onChange={handleChange} 
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-gray-300 text-gray-900" 
                        placeholder="None" disabled={status === 'loading'} />
                </div>
            </div>

            <button type="submit" disabled={status === 'loading'} 
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center group">
                
                {status === 'loading' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Committing to Ledger...
                    </>
                ) : (
                    <>
                        Secure Registration
                        <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                )}
            </button>
        </form>
    );
}