"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const context = '[AdminLogin Component]';
    const router = useRouter();
    
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        console.log(`${context} Step 1: Admin login attempt triggered.`);
        setError('');

        if (!inputKey.trim()) {
            console.warn(`${context} Failure Point U: Empty admin key submitted.`);
            setError('Please enter the administrative key.');
            return;
        }

        // --- NEW: TTL SESSION LOGIC ---
        // Calculate expiration: Current time + 60 minutes (in milliseconds)
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
        <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-left">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">System Override</h1>
                    <p className="text-sm text-gray-400">Enter your credentials to access the ledger.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-900/50 text-red-400 border border-red-800 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Administrative Key</label>
                        <input 
                            type="password" 
                            value={inputKey} 
                            onChange={(e) => setInputKey(e.target.value)} 
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500" 
                            placeholder="Enter 64-character hex key" 
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                        Unlock Ledger
                    </button>
                </form>

            </div>
        </main>
    );
}