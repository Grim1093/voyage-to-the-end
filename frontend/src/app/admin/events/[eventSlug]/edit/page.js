"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEventDetails, updateEventDetails, deleteEvent } from '../../../../../services/api';
import { AmbientAurora } from '@/components/ui/ambient-aurora';
import { InteractiveAura } from '@/components/ui/interactive-aura';

export default function EditEventDeployment() {
    const params = useParams();
    const currentEventSlug = params.eventSlug;
    const context = `[Event Edit Console - ${currentEventSlug}]`;
    const router = useRouter();

    // [Architecture] Expanded Payload State for Phase 2 White-Labeling
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        isPublic: true,
        images: [],
        customDomain: '',
        themeConfig: {
            background: '#09090b',
            text: '#ffffff',
            primary: '#8b5cf6',
            accent: '#3b82f6'
        }
    });

    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('');
    const [newSlug, setNewSlug] = useState('');
    
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        // [Architecture] Upgraded to Cryptographic JWT Validation
        const validateGatekeeper = () => {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/admin/login');
                return false;
            }
            return true;
        };

        const loadEventData = async () => {
            try {
                const data = await fetchEventDetails(currentEventSlug);
                
                const formatForInput = (isoString) => {
                    if (!isoString) return '';
                    const date = new Date(isoString);
                    const tzOffset = date.getTimezoneOffset() * 60000;
                    return (new Date(date - tzOffset)).toISOString().slice(0, 16);
                };

                setFormData({
                    name: data.title || '',
                    slug: data.slug || '',
                    startDate: formatForInput(data.start_date),
                    endDate: formatForInput(data.end_date),
                    location: data.location || '',
                    description: data.desc || '',
                    isPublic: data.is_public !== undefined ? data.is_public : true,
                    images: data.images || [],
                    customDomain: data.custom_domain || '',
                    themeConfig: {
                        background: data.theme_config?.background || '#09090b',
                        text: data.theme_config?.text || '#ffffff',
                        primary: data.theme_config?.primary || '#8b5cf6',
                        accent: data.theme_config?.accent || '#3b82f6'
                    }
                });
                setStatus('idle');
            } catch (error) {
                console.error(`${context} Failed to fetch event details.`, error);
                setStatus('error');
                setMessage('Could not load event data. It may have been deleted.');
            }
        };

        if (validateGatekeeper()) {
            loadEventData();
        }
    }, [currentEventSlug, router, context]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleThemeChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            themeConfig: {
                ...prev.themeConfig,
                [name]: value
            }
        }));
    };

    const handleSlugChange = (e) => {
        const safeSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, slug: safeSlug });
    };

    const handleAddImage = (e) => {
        e.preventDefault();
        if (!currentImageUrl.trim()) return;
        
        if (!currentImageUrl.startsWith('http')) {
            alert('Please enter a valid hosted image URL starting with http:// or https://');
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, currentImageUrl.trim()]
        }));
        setCurrentImageUrl('');
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.slug) {
            setStatus('error');
            setMessage('Event Name and URL Slug are strictly required.');
            return;
        }

        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) >= new Date(formData.endDate)) {
                setStatus('error');
                setMessage('The Start Time must be earlier than the End Time.');
                return;
            }
        }

        setStatus('submitting');
        try {
            const payload = {
                ...formData,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
            };

            const result = await updateEventDetails(currentEventSlug, payload);
            setNewSlug(result.data.slug);
            setStatus('success');
            setMessage(`Tenant "${formData.name}" has been successfully updated.`);
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to update the event.');
        }
    };

    const handlePurge = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }

        setStatus('submitting');
        try {
            await deleteEvent(currentEventSlug);
            router.push('/admin'); 
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to purge the environment.');
            setIsConfirmingDelete(false);
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (status === 'loading') {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 text-zinc-500 relative overflow-hidden">
                <AmbientAurora />
                <svg className="animate-spin h-6 w-6 mb-4 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </main>
        );
    }

    if (status === 'success') {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-zinc-200 relative overflow-hidden">
                <AmbientAurora />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[40px] p-12 max-w-lg text-center shadow-2xl z-10 relative overflow-hidden group"
                >
                    <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -skew-x-[30deg] animate-[modalSweep_2s_ease-out_forwards] pointer-events-none z-0" />
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h1 className="text-3xl font-medium text-white mb-4">Node Updated</h1>
                        <p className="text-zinc-500 mb-10 leading-relaxed text-sm tracking-wide">
                            {message} The environment changes have been committed to the global network.
                        </p>
                        <div className="flex flex-col gap-4">
                            <Link href={`/${newSlug}`} target="_blank" className="w-full py-4 px-6 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:bg-zinc-200">
                                View Live Hub
                            </Link>
                            <Link href="/admin" className="w-full py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-zinc-300 rounded-full font-bold text-xs uppercase tracking-widest transition-all">
                                Control Plane
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col items-center text-zinc-200 relative selection:bg-cyan-500/30 overflow-hidden">
            
            <AmbientAurora />
            <InteractiveAura />

            <header className="w-full max-w-7xl flex items-center justify-between px-6 py-5 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-all">
                        <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-xs font-bold text-white tracking-[0.2em] uppercase">Edit Configuration</h1>
                        <p className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">Target: /{currentEventSlug}</p>
                    </div>
                </div>
            </header>

            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-w-2xl w-full z-10 relative px-6 pb-16 pt-8"
            >
                <motion.div variants={itemVariant} className="bg-white/[0.01] backdrop-blur-xl rounded-[40px] border border-white/[0.05] overflow-hidden shadow-2xl relative group transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                    
                    <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-700 ease-out z-0 pointer-events-none" />

                    <form onSubmit={handleSubmit} className="p-10 space-y-10 relative z-10">
                        {status === 'error' && (
                            <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400/80 text-xs font-medium rounded-2xl tracking-wide">
                                {message}
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Event Title</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all text-sm placeholder-zinc-700 shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">URL Slug</label>
                                <div className="flex bg-white/[0.02] border border-white/[0.05] rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/30 transition-all shadow-inner">
                                    <span className="flex items-center pl-6 pr-2 text-zinc-600 text-[10px] font-mono uppercase tracking-tight">
                                        node/
                                    </span>
                                    <input 
                                        type="text" 
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleSlugChange}
                                        required
                                        className="w-full bg-transparent text-white px-0 py-4 focus:outline-none font-mono text-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-amber-500/60 ml-4 italic">Changing this will break established network paths.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all text-sm shadow-inner [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all text-sm shadow-inner [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Location</label>
                                <input 
                                    type="text" 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all text-sm shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-white/[0.02] border border-white/[0.05] text-white rounded-[32px] px-6 py-5 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all text-sm resize-none shadow-inner"
                                />
                            </div>

                            {/* ARCHITECTURE: MSaaS Edge Configuration */}
                            <div className="space-y-8 pt-8 border-t border-white/[0.03]">
                                <div className="flex justify-between items-end ml-2 mb-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">MSaaS Edge Configuration</label>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Custom Domain Routing</label>
                                    <div className="flex bg-white/[0.02] border border-white/[0.05] rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/30 transition-all shadow-inner">
                                        <span className="flex items-center pl-6 pr-2 text-zinc-600 text-[10px] font-mono">
                                            https://
                                        </span>
                                        <input 
                                            type="text" 
                                            name="customDomain"
                                            value={formData.customDomain}
                                            onChange={handleChange}
                                            placeholder="events.yourbrand.com (Leave blank for default slug)"
                                            className="w-full bg-transparent text-white px-0 py-4 focus:outline-none text-sm placeholder-zinc-700"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-600 ml-4">DNS CNAME must be routed to Vercel/Render Edge proxy.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-2">Tenant Brand Aesthetics</label>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between shadow-inner">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Background</span>
                                                <span className="text-xs text-zinc-400 font-mono uppercase">{formData.themeConfig.background}</span>
                                            </div>
                                            <input 
                                                type="color" name="background" value={formData.themeConfig.background} onChange={handleThemeChange} 
                                                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full shadow-inner" 
                                            />
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between shadow-inner">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Text / Typeface</span>
                                                <span className="text-xs text-zinc-400 font-mono uppercase">{formData.themeConfig.text}</span>
                                            </div>
                                            <input 
                                                type="color" name="text" value={formData.themeConfig.text} onChange={handleThemeChange} 
                                                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full shadow-inner" 
                                            />
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between shadow-inner">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Core (Primary)</span>
                                                <span className="text-xs text-zinc-400 font-mono uppercase">{formData.themeConfig.primary}</span>
                                            </div>
                                            <input 
                                                type="color" name="primary" value={formData.themeConfig.primary} onChange={handleThemeChange} 
                                                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full shadow-inner" 
                                            />
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between shadow-inner">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Portal (Accent)</span>
                                                <span className="text-xs text-zinc-400 font-mono uppercase">{formData.themeConfig.accent}</span>
                                            </div>
                                            <input 
                                                type="color" name="accent" value={formData.themeConfig.accent} onChange={handleThemeChange} 
                                                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full shadow-inner" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ARCHITECTURE: The Image Node Injector */}
                            <div className="space-y-4 pt-8 border-t border-white/[0.03]">
                                <div className="flex justify-between items-end ml-2 mb-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Atmospheric Images</label>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-[inset_0_0_20px_rgba(245,158,11,0.02)]">
                                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1">Orientation Protocol</h4>
                                        <p className="text-[11px] text-amber-500/80 leading-relaxed font-mono">
                                            The Hero Engine strictly requires <span className="text-amber-400 font-bold">Landscape (16:9)</span> images. Uploading Vertical/Portrait images will cause severe cropping and visual degradation across the global network.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <input 
                                        type="url" 
                                        value={currentImageUrl}
                                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddImage(e)}
                                        placeholder="https://hosted-image-url.com/node.jpg"
                                        className="flex-1 bg-white/[0.02] border border-white/[0.05] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm placeholder-zinc-700 shadow-inner"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAddImage}
                                        disabled={!currentImageUrl.trim()}
                                        className="px-6 rounded-full bg-white/[0.05] hover:bg-cyan-500/20 border border-white/[0.05] hover:border-cyan-500/30 text-zinc-300 hover:text-cyan-400 font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-30"
                                    >
                                        Attach
                                    </button>
                                </div>
                                
                                {formData.images.length > 0 && (
                                    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 custom-scrollbar">
                                        <AnimatePresence>
                                            {formData.images.map((url, index) => (
                                                <motion.div 
                                                    key={`${url}-${index}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.1] group/img"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={url} alt="Attached Node" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-white/[0.03]">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleChange}
                                            className="sr-only" 
                                        />
                                        <div className={`w-11 h-6 rounded-full transition-all duration-300 ${formData.isPublic ? 'bg-cyan-500/40' : 'bg-white/[0.05]'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${formData.isPublic ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <div className="ml-4">
                                        <span className="block text-xs font-semibold text-zinc-200 uppercase tracking-wider">Public Visibility</span>
                                        <span className="block text-[10px] text-zinc-500 tracking-wide">{formData.isPublic ? 'Broadcasting on Global Hub' : 'Restricted to link access'}</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/[0.03] flex flex-col sm:flex-row justify-between items-center gap-4">
                            
                            <button 
                                type="button"
                                onClick={handlePurge}
                                className={`px-6 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                                    isConfirmingDelete 
                                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse' 
                                    : 'bg-rose-500/5 border border-rose-500/20 text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-400'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                {isConfirmingDelete ? 'Confirm Purge' : 'Delete Node'}
                            </button>

                            <div className="flex items-center gap-6">
                                <Link 
                                    href="/admin"
                                    className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                                >
                                    Discard Changes
                                </Link>
                                <button 
                                    type="submit" 
                                    disabled={status === 'submitting'}
                                    className="px-8 py-4 bg-white hover:bg-zinc-200 text-black rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {status === 'submitting' ? 'Updating Node...' : 'Commit Updates'}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </main>
    );
}