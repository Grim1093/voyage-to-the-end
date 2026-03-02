"use client";

import { useParams } from 'next/navigation';
import GuestIntakeForm from '../../../components/GuestIntakeForm';
import Link from 'next/link';

export default function RegisterPage() {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[RegisterPage Component - ${eventSlug}]`;

    console.log(`${context} Rendering registration wrapper for event: ${eventSlug}`);

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 text-zinc-200 relative selection:bg-indigo-500/30 overflow-hidden">
            
            {/* Highly desaturated, elegant ambient glows */}
            <div className="absolute inset-0 pointer-events-none z-0 flex justify-center">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full filter blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full filter blur-[120px]" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="max-w-3xl mx-auto w-full z-10 relative flex flex-col items-center pt-8">
                
                {/* Floating Navigation Pill */}
                <div className="mb-10 w-full flex justify-center">
                    <Link href={`/${eventSlug}`} className="inline-flex items-center text-[11px] font-medium tracking-[0.1em] uppercase text-zinc-400 hover:text-white transition-colors bg-white/[0.02] px-4 py-2 rounded-full border border-white/[0.05] backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return to Event Hub
                    </Link>
                </div>

                {/* Minimalist Page Header */}
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-[11px] font-medium tracking-[0.15em] uppercase backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                        Secure Registration
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white capitalize leading-tight">
                        {eventSlug.replace(/-/g, ' ')} Intake
                    </h1>
                    <p className="text-sm text-zinc-500 max-w-xl mx-auto font-normal leading-relaxed tracking-wide">
                        Submit your credentials for this event. All entries are verified before being committed to the multi-tenant ledger.
                    </p>
                </div>

                {/* Form Wrapper with Ultra-Soft Frosted Glass */}
                <div className="w-full bg-white/[0.02] backdrop-blur-2xl rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] border border-white/[0.05] p-4 sm:p-8">
                    {/* ARCHITECT NOTE: We pass the eventSlug down as a prop so the form knows where to submit */}
                    <GuestIntakeForm eventSlug={eventSlug} />
                </div>
                
            </div>
        </main>
    );
}