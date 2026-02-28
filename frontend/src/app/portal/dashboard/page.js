"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchGuestStatus } from '../../../services/api'; // NEW: Import the live sync function

export default function GuestDashboard() {
    const context = '[GuestDashboard Component]';
    const router = useRouter();
    
    const [guest, setGuest] = useState(null);

    useEffect(() => {
        console.log(`${context} Step 1: Dashboard mounted. Checking for secure session data.`);
        const sessionData = sessionStorage.getItem('guestData');
        
        // Failure Point EE: Gatekeeper intercepting unauthenticated users
        if (!sessionData) {
            console.warn(`${context} Failure Point EE: Unauthorized access attempt. No guest data found. Redirecting to portal.`);
            router.push('/portal');
            return;
        }

        try {
            const parsedData = JSON.parse(sessionData);
            console.log(`${context} Step 2: Session valid. Rendering initial dashboard for: ${parsedData.full_name}`);
            setGuest(parsedData); // Render the cached UI instantly

            // --- NEW: LIVE STATE SYNC ENGINE ---
            const syncStatus = async () => {
                try {
                    console.log(`${context} Step 3: Fetching live status from ledger for ID: ${parsedData.id}`);
                    const liveState = await fetchGuestStatus(parsedData.id);
                    
                    if (liveState !== parsedData.current_state) {
                        console.log(`${context} Step 4: State upgrade detected! Updating UI from ${parsedData.current_state} to ${liveState}`);
                        
                        // Update the local state to trigger a re-render
                        const updatedGuest = { ...parsedData, current_state: liveState };
                        setGuest(updatedGuest);
                        
                        // Overwrite the stale cache in sessionStorage so the next refresh is accurate
                        sessionStorage.setItem('guestData', JSON.stringify(updatedGuest));
                    } else {
                        console.log(`${context} Step 4: Cache is fully synced with ledger.`);
                    }
                } catch (error) {
                    // We don't crash the UI if the network blips. We just rely on the cached data.
                    console.warn(`${context} Background sync failed. Falling back to cached state.`);
                }
            };

            // Fire the sync engine in the background
            syncStatus();

        } catch (error) {
            console.error(`${context} Failure Point FF: Corrupted session data.`, error);
            sessionStorage.removeItem('guestData');
            router.push('/portal');
        }
    }, [router]);

    const handleLogout = () => {
        console.log(`${context} Step 5: Guest initiated logout. Purging session data.`);
        sessionStorage.removeItem('guestData');
        router.push('/portal');
    };

    if (!guest) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
                Verifying secure session...
            </div>
        );
    }

    const renderStateBanner = (state) => {
        switch(state) {
            case 0: 
                return <div className="bg-gray-100 text-gray-800 p-4 rounded-lg text-center font-semibold border border-gray-200">Status: Invited - Please complete your profile.</div>;
            case 1: 
                return <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-center font-semibold border border-yellow-200">Status: Submitted - Awaiting Admin Verification.</div>;
            case 2: 
                return <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center font-semibold border-2 border-green-500">Status: VERIFIED - You are cleared for the event!</div>;
            case -1: 
                return <div className="bg-red-50 text-red-800 p-4 rounded-lg text-center font-semibold border border-red-200">Status: Action Required - There was an issue with your verification.</div>;
            default: 
                return <div className="bg-gray-100 text-gray-800 p-4 rounded-lg text-center font-semibold">Status: Unknown</div>;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome, {guest.full_name}</h1>
                        <p className="text-gray-500">Your Personal Event Dashboard</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md font-medium transition shadow-sm"
                    >
                        Log Out
                    </button>
                </header>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Verification Status</h2>
                    {renderStateBanner(guest.current_state)}
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Registration Details</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-3">
                            <span className="text-gray-500 mb-1 sm:mb-0">Guest ID</span>
                            <span className="font-mono text-gray-900 break-all">{guest.id}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-3">
                            <span className="text-gray-500 mb-1 sm:mb-0">ID Document</span>
                            <a href={guest.id_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                                View Submitted Document ↗
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}