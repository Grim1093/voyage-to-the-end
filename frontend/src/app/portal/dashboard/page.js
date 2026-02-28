"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchGuestStatus } from '../../../services/api'; 

export default function GuestDashboard() {
    const context = '[GuestDashboard Component]';
    const router = useRouter();
    
    const [guest, setGuest] = useState(null);

    useEffect(() => {
        console.log(`${context} Step 1: Dashboard mounted. Checking for secure session data.`);
        const sessionData = sessionStorage.getItem('guestData');
        
        if (!sessionData) {
            console.warn(`${context} Failure Point EE: Unauthorized access attempt. No guest data found. Redirecting to portal.`);
            router.push('/portal');
            return;
        }

        try {
            const parsedData = JSON.parse(sessionData);
            console.log(`${context} Step 2: Session valid. Rendering initial dashboard for: ${parsedData.full_name}`);
            setGuest(parsedData); 

            const syncStatus = async () => {
                try {
                    console.log(`${context} Step 3: Fetching live status from ledger for ID: ${parsedData.id}`);
                    const liveState = await fetchGuestStatus(parsedData.id);
                    
                    if (liveState !== parsedData.current_state) {
                        console.log(`${context} Step 4: State upgrade detected! Updating UI from ${parsedData.current_state} to ${liveState}`);
                        
                        const updatedGuest = { ...parsedData, current_state: liveState };
                        setGuest(updatedGuest);
                        
                        sessionStorage.setItem('guestData', JSON.stringify(updatedGuest));
                    } else {
                        console.log(`${context} Step 4: Cache is fully synced with ledger.`);
                    }
                } catch (error) {
                    console.warn(`${context} Background sync failed. Falling back to cached state.`);
                }
            };

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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center text-purple-600 font-medium">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying secure session...
            </div>
        );
    }

    const renderStateBanner = (state) => {
        switch(state) {
            case 0: 
                return <div className="bg-slate-100/80 backdrop-blur-sm text-slate-800 p-4 rounded-xl text-center font-semibold border border-slate-200 shadow-sm">Status: Invited - Please complete your profile.</div>;
            case 1: 
                return <div className="bg-amber-50/80 backdrop-blur-sm text-amber-800 p-4 rounded-xl text-center font-semibold border border-amber-200 shadow-sm">Status: Submitted - Awaiting Admin Verification.</div>;
            case 2: 
                return <div className="bg-emerald-50/80 backdrop-blur-sm text-emerald-800 p-4 rounded-xl text-center font-bold border-2 border-emerald-500 shadow-md shadow-emerald-500/10">Status: VERIFIED - You are cleared for the event!</div>;
            case -1: 
                return <div className="bg-rose-50/80 backdrop-blur-sm text-rose-800 p-4 rounded-xl text-center font-semibold border border-rose-200 shadow-sm">Status: Action Required - There was an issue with your verification.</div>;
            default: 
                return <div className="bg-slate-100/80 backdrop-blur-sm text-slate-800 p-4 rounded-xl text-center font-semibold">Status: Unknown</div>;
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-12 relative overflow-hidden">
            
            {/* Ambient Orbs to match the Login Screen */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200/50 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/50 rounded-full filter blur-[120px] pointer-events-none -z-10"></div>

            <div className="max-w-4xl mx-auto z-10 relative">
                
                <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Welcome, {guest.full_name}</h1>
                        <p className="text-purple-600/80 font-medium">Your Personal Event Dashboard</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-white/70 backdrop-blur-md border border-purple-100 text-purple-700 hover:bg-white hover:text-purple-900 hover:border-purple-200 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm w-full md:w-auto"
                    >
                        Secure Logout
                    </button>
                </header>

                {/* Banner Section */}
                <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl border border-white p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 tracking-wide">Verification Status</h2>
                    {renderStateBanner(guest.current_state)}
                </div>

                {/* Dynamic Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl border border-white p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-5 tracking-wide flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Identity & Access
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex flex-col border-b border-purple-50/50 pb-3">
                                <span className="text-gray-500 mb-1.5 font-medium">Secure Guest ID</span>
                                <span className="font-mono text-indigo-900 break-all bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">{guest.id}</span>
                            </div>
                            <div className="flex flex-col pb-1">
                                <span className="text-gray-500 mb-1.5 font-medium">ID Document</span>
                                <a href={guest.id_document_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline font-semibold inline-flex items-center group">
                                    View Submitted File 
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl border border-white p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-5 tracking-wide flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Contact & Preferences
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-purple-50/50 pb-4">
                                <span className="text-gray-500 mb-1 sm:mb-0 font-medium">Phone Number</span>
                                <span className="text-gray-900 font-semibold">{guest.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between pb-1">
                                <span className="text-gray-500 mb-1 sm:mb-0 font-medium">Dietary Restrictions</span>
                                <span className="text-gray-900 font-semibold text-right max-w-[200px]">{guest.dietary_restrictions || 'None listed'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Static Event Itinerary Card */}
                <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl border border-white overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5">
                        <h2 className="text-lg font-bold text-white tracking-wide flex items-center">
                            <svg className="w-5 h-5 mr-2 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Event & Travel Itinerary
                        </h2>
                    </div>
                    <div className="p-7">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                            <div>
                                <span className="block text-purple-600/80 font-bold mb-1.5 uppercase tracking-wider text-xs">Event</span>
                                <span className="block text-gray-900 font-bold text-base">Global Tech & Finance Summit 2026</span>
                            </div>
                            <div>
                                <span className="block text-purple-600/80 font-bold mb-1.5 uppercase tracking-wider text-xs">Dates</span>
                                <span className="block text-gray-900 font-semibold text-base">October 15 - 18, 2026</span>
                                <span className="block text-gray-500 text-xs mt-1.5 font-medium">Check-in starts 9:00 AM</span>
                            </div>
                            <div>
                                <span className="block text-purple-600/80 font-bold mb-1.5 uppercase tracking-wider text-xs">Venue & Accommodation</span>
                                <span className="block text-gray-900 font-semibold text-base">The Grand Hyatt Complex</span>
                                <span className="block text-gray-500 text-xs mt-1.5 font-medium">Dubai, UAE</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}