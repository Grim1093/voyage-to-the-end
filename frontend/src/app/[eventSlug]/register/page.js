"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import GuestIntakeForm from '../../../components/GuestIntakeForm';
import { AmbientAurora } from '@/components/ui/ambient-aurora';
import { InteractiveAura } from '@/components/ui/interactive-aura';

export default function RegisterPage() {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[RegisterPage Component - ${eventSlug}]`;

    useEffect(() => {
        console.log(`${context} Component mounted - Dynamic Theme Active (Light/Dark Mode Ready)`);
    }, [context]);

    // Orchestration Configuration
    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 text-foreground relative selection:bg-primary/30 overflow-hidden transition-colors duration-300">
            
            {/* Global Mesh Background & Cursor Aura */}
            <AmbientAurora />
            <InteractiveAura />
            
            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-w-3xl mx-auto w-full z-10 relative flex flex-col items-center pt-8"
            >
                
                {/* Floating Navigation Pill */}
                <motion.div variants={itemVariant} className="mb-10 w-full flex justify-center">
                    <Link href={`/${eventSlug}`} className="inline-flex items-center text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors bg-black/[0.02] dark:bg-white/[0.02] px-4 py-2 rounded-full border border-border backdrop-blur-md shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Return to Event Hub
                    </Link>
                </motion.div>

                {/* Minimalist Page Header */}
                <motion.div variants={itemVariant} className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-border text-muted-foreground text-[11px] font-medium tracking-[0.15em] uppercase backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(56,189,248,0.8)] dark:shadow-[0_0_8px_rgba(124,58,237,0.8)] animate-pulse"></span>
                        Secure Registration
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground capitalize leading-tight">
                        {eventSlug.replace(/-/g, ' ')} Intake
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto font-normal leading-relaxed tracking-wide">
                        Submit your credentials for this event. All entries are verified before being committed to the multi-tenant ledger.
                    </p>
                </motion.div>

                {/* Form Wrapper with Ultra-Soft Frosted Glass & Holographic Sweep */}
                <motion.div variants={itemVariant} className="w-full">
                    <div className="group relative overflow-hidden w-full bg-card/50 dark:bg-white/[0.02] backdrop-blur-2xl rounded-[32px] shadow-xl dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] border border-border p-4 sm:p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.15)]">
                        
                        {/* ARCHITECTURE: Hardware-Accelerated Holographic Sweep */}
                        <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-primary/15 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-700 ease-out z-0 pointer-events-none" />

                        <div className="relative z-10">
                            {/* ARCHITECT NOTE: We pass the eventSlug down as a prop so the form knows where to submit */}
                            <GuestIntakeForm eventSlug={eventSlug} />
                        </div>
                    </div>
                </motion.div>
                
            </motion.div>
        </main>
    );
}