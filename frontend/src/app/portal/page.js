"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// We will import loginGuest from api.js in the next step!
import { loginGuest } from '../../services/api'; 

export default function GuestPortalLogin() {
    const context = '[GuestPortalLogin Component]';
    const router = useRouter();
    
    const [formData, setFormData] = useState({ email: '', accessCode: '' });
    const [status, setStatus] = useState('idle'); // idle, loading, error
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log(`${context} Step 1: Guest login attempt triggered for ${formData.email}`);
        setStatus('loading');
        setMessage('');

        // Step 2: Frontend Validation (Failure Point CC)
        if (!formData.email || !formData.accessCode) {
            console.warn(`${context} Failure Point CC: Missing email or access code.`);
            setStatus('error');
            setMessage('Please provide both your registered email and your 6-character access code.');
            return;
        }

        try {
            console.log(`${context} Step 3: Hitting backend authentication endpoint...`);
            
            // We pass the credentials to our API service
            const result = await loginGuest(formData.email, formData.accessCode);
            
            console.log(`${context} Step 4: Authentication successful! Storing guest state.`);
            
            // We store the guest's public data in sessionStorage so the Dashboard can read it
            sessionStorage.setItem('guestData', JSON.stringify(result.data));

            console.log(`${context} Step 5: Redirecting to secure guest dashboard.`);
            router.push('/portal/dashboard');

        } catch (error) {
            console.error(`${context} CRITICAL FAILURE (Failure Point DD):`, error.message);
            setStatus('error');
            setMessage(error.message || 'Invalid email or access code. Please try again.');
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-left">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Guest Portal</h1>
                    <p className="text-sm text-gray-500">Track your verification status</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                            {message}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registered Email</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400" 
                            placeholder="john@example.com" 
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">6-Character Access Code</label>
                        <input 
                            type="text" 
                            name="accessCode"
                            value={formData.accessCode} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 uppercase tracking-widest" 
                            placeholder="A1B2C3" 
                            maxLength={6}
                            disabled={status === 'loading'}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                    >
                        {status === 'loading' ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>

            </div>
        </main>
    );
}