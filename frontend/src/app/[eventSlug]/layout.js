"use client";

import { useEffect, useState, memo } from 'react';
import { useParams } from 'next/navigation';
import { fetchEventDetails } from '../../services/api';
import { AmbientAurora } from '@/components/ui/ambient-aurora';
import { InteractiveAura } from '@/components/ui/interactive-aura';

// [Architecture] Dynamic Surface Texture Generator
const SurfaceTexture = memo(({ type }) => {
    if (!type || type === 'none') return null;

    if (type === 'grid') {
        return (
            <div 
                className="fixed inset-0 z-0 pointer-events-none opacity-20 transform-gpu"
                style={{
                    backgroundImage: `linear-gradient(to right, var(--tenant-text) 1px, transparent 1px), linear-gradient(to bottom, var(--tenant-text) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
                }}
            />
        );
    }

    if (type === 'dots') {
        return (
            <div 
                className="fixed inset-0 z-0 pointer-events-none opacity-20 transform-gpu"
                style={{
                    backgroundImage: `radial-gradient(var(--tenant-text) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
                }}
            />
        );
    }

    if (type === 'grain') {
        return (
            <div 
                className="fixed inset-0 z-10 pointer-events-none opacity-[0.05] transform-gpu mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}
            />
        );
    }

    return null;
});
SurfaceTexture.displayName = 'SurfaceTexture';

export default function EventLayout({ children }) {
    const params = useParams();
    const eventSlug = params.eventSlug;
    const context = `[Event Layout Wrapper - ${eventSlug}]`;

    const [themeConfig, setThemeConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            console.log(`${context} Hydrating MSaaS Theme Ecosystem...`);
            try {
                const data = await fetchEventDetails(eventSlug);
                setThemeConfig(data?.theme_config || {});
            } catch (err) {
                console.error(`${context} Failed to extract theme payload. Defaulting to Abyssal Void.`, err);
                setThemeConfig({}); // Will fallback to defaults below
            } finally {
                setLoading(false);
            }
        };

        if (eventSlug) loadTheme();
    }, [eventSlug, context]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden">
                <AmbientAurora />
                <InteractiveAura />
            </div>
        );
    }

    // --- MSAAS THEME ENGINE EXTRACTOR ---
    const theme = themeConfig || {};
    
    // Resolve Radius
    let radiusVar = '32px'; 
    let buttonRadiusVar = '9999px'; 
    if (theme.radius === 'none') {
        radiusVar = '0px';
        buttonRadiusVar = '0px';
    } else if (theme.radius === 'sm') {
        radiusVar = '8px';
        buttonRadiusVar = '4px';
    }

    // Resolve Font Family
    let fontClass = 'font-sans';
    if (theme.fontFamily === 'serif') fontClass = 'font-serif';
    if (theme.fontFamily === 'mono') fontClass = 'font-mono';

    const cssVariables = {
        '--tenant-bg': theme.background || '#09090b',
        '--tenant-text': theme.text || '#ffffff',
        '--tenant-primary': theme.primary || '#8b5cf6',
        '--tenant-accent': theme.accent || '#3b82f6',
        '--tenant-radius': radiusVar,
        '--tenant-btn-radius': buttonRadiusVar
    };

    return (
        <div style={cssVariables} className={`min-h-screen bg-[var(--tenant-bg)] text-[var(--tenant-text)] selection:bg-[var(--tenant-primary)]/30 transition-colors duration-1000 ${fontClass} relative overflow-hidden`}>
            {/* Global Cinematic Layers */}
            <AmbientAurora />
            <SurfaceTexture type={theme.texture} />
            <InteractiveAura />
            
            {/* Rendered Child Pages */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}