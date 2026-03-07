"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAbyss } from '@/components/AbyssProvider';
import { fetchEventEchos } from '@/services/api'; // [Architecture] Import the ledger sync

export function GlobalFeed({ eventSlug, guestId }) {
    const { socket, isConnected } = useAbyss();
    const [echos, setEchos] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const scrollRef = useRef(null);

    // [Architecture] Ledger Synchronization (Fetch History on Mount)
    useEffect(() => {
        let isMounted = true;
        const loadHistory = async () => {
            try {
                const history = await fetchEventEchos(eventSlug);
                if (isMounted) {
                    setEchos(history);
                    setIsLoadingHistory(false);
                    // Force scroll to bottom after history loads
                    setTimeout(() => {
                        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }, 100);
                }
            } catch (error) {
                console.error("Failed to load echo history", error);
                if (isMounted) setIsLoadingHistory(false);
            }
        };
        loadHistory();
        return () => { isMounted = false; };
    }, [eventSlug]);

    // [Architecture] Ephemeral Mesh Subscription (Real-time updates)
    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.emit('join_abyss');

        const handleReceiveEcho = (payload) => {
            setEchos((prev) => [...prev, payload]);
            
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 50);
        };

        socket.on('receive_global_echo', handleReceiveEcho);

        return () => {
            socket.off('receive_global_echo', handleReceiveEcho);
        };
    }, [socket, isConnected]);

    const handleSendEcho = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket || !isConnected) return;

        setIsSending(true);
        
        socket.emit('send_global_echo', { content: input }, (response) => {
            setIsSending(false);
            if (response.success) {
                setInput('');
            } else {
                console.error('[Global Feed] Failed to emit echo:', response.message);
            }
        });
    };

    return (
        <div className="group relative overflow-hidden w-full h-[500px] flex flex-col bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(56,189,248,0.08)]">
            <div className="absolute inset-y-0 -left-[150%] w-[150%] bg-gradient-to-r from-transparent via-sky-400/10 to-transparent -skew-x-[30deg] opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-700 ease-out z-0 pointer-events-none" />

            {/* Header */}
            <div className="px-8 py-5 border-b border-white/[0.03] flex items-center justify-between relative z-10 bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                    </div>
                    <h2 className="text-xs font-bold text-zinc-300 tracking-[0.2em] uppercase">Global Event Feed</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        {isConnected ? (
                            <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </>
                        ) : (
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        )}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-widest">{isConnected ? 'Uplink Stable' : 'Connecting...'}</span>
                </div>
            </div>

            {/* Echo Ledger (Scrollable Area) */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {isLoadingHistory ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <svg className="animate-spin w-6 h-6 mb-3 text-sky-500/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-[10px] uppercase tracking-widest font-semibold">Synchronizing Ledger...</p>
                    </div>
                ) : echos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-60">
                        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <p className="text-[11px] uppercase tracking-widest font-semibold">The Abyss is silent.</p>
                        <p className="text-xs mt-1">Be the first to cast an echo.</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {echos.map((echo, idx) => (
                            <motion.div
                                key={echo.id || idx}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`flex flex-col max-w-[85%] ${echo.guest_id === guestId ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                            >
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 px-1">{echo.sender_name}</span>
                                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-md shadow-sm ${
                                    echo.guest_id === guestId 
                                        ? 'bg-sky-500/10 border border-sky-500/20 text-sky-100 rounded-tr-sm' 
                                        : 'bg-white/[0.03] border border-white/[0.05] text-zinc-200 rounded-tl-sm'
                                }`}>
                                    {echo.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Input Gateway */}
            <div className="p-4 border-t border-white/[0.03] relative z-10 bg-black/20">
                <form onSubmit={handleSendEcho} className="relative flex items-center w-full">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Cast an echo into the network..."
                        disabled={!isConnected || isSending}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-full py-3.5 pl-6 pr-14 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/30 transition-all disabled:opacity-50"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || !isConnected || isSending}
                        className="absolute right-2 w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:bg-zinc-200 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                        {isSending ? (
                            <svg className="animate-spin w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}