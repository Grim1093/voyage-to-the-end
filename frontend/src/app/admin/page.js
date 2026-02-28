"use client";

import { useState, useEffect } from 'react';
import { getAllGuests, updateGuestState } from '../../services/api';

export default function AdminDashboard() {
    const context = '[AdminDashboard Component]';

    const [guests, setGuests] = useState([]);
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    // Fetch the ledger when the component mounts
    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        console.log(`${context} Step 1: Component mounted. Triggering ledger fetch.`);
        setStatus('loading');
        try {
            const result = await getAllGuests(1); // Fetching page 1, all states for MVP
            setGuests(result.data);
            setStatus('success');
            console.log(`${context} Step 2: Ledger successfully rendered in UI.`);
        } catch (error) {
            console.error(`${context} Failure Point T: UI failed to load ledger.`, error.message);
            setStatus('error');
            setMessage(error.message);
        }
    };

    // Handler for the Verify/Reject buttons
    const handleStateChange = async (guestId, newState) => {
        console.log(`${context} Action: Admin clicked transition to State ${newState} for ${guestId}`);
        try {
            await updateGuestState(guestId, newState);
            // Refresh the ledger to show the updated state
            fetchLedger(); 
        } catch (error) {
            alert(`Failed to update state: ${error.message}`);
        }
    };

    // Helper to render beautiful state badges
    const renderStateBadge = (state) => {
        switch(state) {
            case 0: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">0: Invited</span>;
            case 1: return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">1: Submitted</span>;
            case 2: return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">2: Verified</span>;
            case -1: return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">-1: Error</span>;
            default: return <span>Unknown</span>;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">MICE Ledger Explorer</h1>
                    <p className="text-gray-500">Administrative Dashboard for Guest Verification</p>
                </header>

                {status === 'error' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md mb-6">{message}</div>
                )}

                {status === 'loading' ? (
                    <div className="text-gray-500 text-center py-10">Syncing with backend ledger...</div>
                ) : (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Guest Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Current State</th>
                                    <th className="px-6 py-4">Registration Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-800">
                                {guests.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No guests found in ledger.</td></tr>
                                ) : (
                                    guests.map((guest) => (
                                        <tr key={guest.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{guest.full_name}</td>
                                            <td className="px-6 py-4">{guest.email}</td>
                                            <td className="px-6 py-4">{renderStateBadge(guest.current_state)}</td>
                                            <td className="px-6 py-4">{new Date(guest.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {/* Only show actions if they are in State 1 (Submitted) */}
                                                {guest.current_state === 1 && (
                                                    <>
                                                        <button onClick={() => handleStateChange(guest.id, 2)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition">Verify</button>
                                                        <button onClick={() => handleStateChange(guest.id, -1)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition">Reject</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </main>
    );
}