"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAbyss } from '@/components/AbyssProvider';
import { fetchGuestDirectory, fetchGuestEchoState, fetchDirectMessages } from '@/services/api'; 

export function GuestDirectory({ eventSlug, currentGuestId }) {
    const { socket, isConnected } = useAbyss();
    const [directory, setDirectory] = useState([]);
    const [onlineGuests, setOnlineGuests] = useState(new Set());
    const [inboundEchos, setInboundEchos] = useState([]);
    const [pendingOutbound, setPendingOutbound] = useState(new Set());
    const [connections, setConnections] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Chat State
    const [activeChat, setActiveChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatScrollRef = useRef(null);
    
    // Typing State Engine
    const [typingUsers, setTypingUsers] = useState(new Set());
    const typingTimeoutRef = useRef(null);

    // Initial Hydration
    useEffect(() => {
        let isMounted = true;
        const hydrateState = async () => {
            try {
                const [dirData, stateData] = await Promise.all([
                    fetchGuestDirectory(eventSlug),
                    fetchGuestEchoState(eventSlug)
                ]);
                
                if (isMounted) {
                    setDirectory(dirData.filter(g => g.id !== currentGuestId));
                    setInboundEchos(stateData.inbound);
                    setPendingOutbound(new Set(stateData.outbound));
                    setConnections(new Set(stateData.connections));
                    setOnlineGuests(new Set(stateData.online));
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to hydrate Direct Mesh state", error);
                if (isMounted) setIsLoading(false);
            }
        };
        hydrateState();
        return () => { isMounted = false; };
    }, [eventSlug, currentGuestId]);

    // Socket Nervous System
    useEffect(() => {
        if (!socket || !isConnected) return;

        // [Architecture Fix] Explicitly join the mesh so the backend broadcasts presence!
        socket.emit('join_abyss');

        const handlePresence = (payload) => {
            setOnlineGuests(prev => {
                const newSet = new Set(prev);
                if (payload.action === 'entered') newSet.add(payload.guest_id);
                if (payload.action === 'departed') newSet.delete(payload.guest_id);
                return newSet;
            });
        };

        const handleInboundEcho = (payload) => {
            setInboundEchos(prev => prev.includes(payload.sender_id) ? prev : [...prev, payload.sender_id]);
        };

        const handleEchoResolved = (payload) => {
            if (payload.status === 'accepted') {
                setConnections(prev => new Set(prev).add(payload.target_id));
                setPendingOutbound(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(payload.target_id);
                    return newSet;
                });
            }
        };

        const handleReceiveDM = (payload) => {
            setChatMessages(prev => {
                if (activeChat && (payload.sender_id === activeChat.id || payload.receiver_id === activeChat.id)) {
                    return [...prev, payload];
                }
                return prev;
            });
            // Stop typing indicator when a message actually arrives
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(payload.sender_id);
                return newSet;
            });
            setTimeout(() => {
                if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }, 50);
        };

        // Catch incoming typing signals
        const handleReceiveTypingPulse = (payload) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (payload.is_typing) newSet.add(payload.sender_id);
                else newSet.delete(payload.sender_id);
                return newSet;
            });
            setTimeout(() => {
                if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }, 50);
        };

        socket.on('presence_update', handlePresence);
        socket.on('inbound_echo', handleInboundEcho);
        socket.on('echo_resolved', handleEchoResolved);
        socket.on('receive_direct_message', handleReceiveDM);
        socket.on('receive_typing_pulse', handleReceiveTypingPulse);

        return () => {
            socket.off('presence_update', handlePresence);
            socket.off('inbound_echo', handleInboundEcho);
            socket.off('echo_resolved', handleEchoResolved);
            socket.off('receive_direct_message', handleReceiveDM);
            socket.off('receive_typing_pulse', handleReceiveTypingPulse);
        };
    }, [socket, isConnected, activeChat]);

    const handleSendEcho = (targetId) => {
        if (!socket || !isConnected) return;
        socket.emit('send_echo', { target_guest_id: targetId });
        setPendingOutbound(prev => new Set(prev).add(targetId));
    };

    const handleAcceptEcho = (senderId) => {
        if (!socket || !isConnected) return;
        socket.emit('accept_echo', { sender_guest_id: senderId });
        setInboundEchos(prev => prev.filter(id => id !== senderId));
        setConnections(prev => new Set(prev).add(senderId));
    };

    const openChat = async (guest) => {
        setActiveChat(guest);
        try {
            const msgs = await fetchDirectMessages(eventSlug, guest.id);
            setChatMessages(msgs);
            setTimeout(() => {
                if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }, 100);
        } catch (error) {
            console.error("Failed to load DMs", error);
        }
    };

    // The Typing Engine
    const handleInputChange = (e) => {
        setChatInput(e.target.value);
        if (!socket || !activeChat) return;

        // Emit typing START
        socket.emit('typing_pulse', { target_guest_id: activeChat.id, is_typing: true });

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set a timeout to emit typing STOP if user stops typing for 1.5s
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing_pulse', { target_guest_id: activeChat.id, is_typing: false });
        }, 1500);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !activeChat || !socket) return;

        // Force stop typing on send
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit('typing_pulse', { target_guest_id: activeChat.id, is_typing: false });

        socket.emit('send_direct_message', { target_guest_id: activeChat.id, content: chatInput });
        setChatInput('');
    };

    if (activeChat) {
        return (
            <div className="w-full h-[500px] flex flex-col bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[32px] overflow-hidden shadow-lg shadow-black/50">
                <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveChat(null)} className="p-2 bg-white/[0.05] rounded-full hover:bg-white/[0.1] transition-colors">
                            <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-200">{activeChat.full_name}</h3>
                            <span className="text-[10px] text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${onlineGuests.has(activeChat.id) ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span> 
                                {onlineGuests.has(activeChat.id) ? 'Active Uplink' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>

                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-white/10">
                    {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-60">
                            <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <p className="text-[10px] uppercase tracking-widest font-semibold">End-to-End Ephemeral</p>
                        </div>
                    ) : (
                        chatMessages.map((msg, idx) => {
                            const isMe = msg.sender_id === currentGuestId;
                            return (
                                <div key={msg.id || idx} className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        isMe ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 rounded-br-sm' 
                                             : 'bg-white/[0.05] border border-white/[0.05] text-zinc-200 rounded-bl-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Animated Typing Indicator UI */}
                    {typingUsers.has(activeChat.id) && (
                        <div className="flex flex-col max-w-[80%] mr-auto items-start animate-fade-in">
                            <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] rounded-bl-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/[0.05] bg-black/20">
                    <form onSubmit={handleSendMessage} className="relative flex items-center w-full">
                        <input 
                            type="text"
                            value={chatInput}
                            onChange={handleInputChange}
                            placeholder="Transmit securely..."
                            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-full py-3.5 pl-6 pr-14 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                        <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 w-10 h-10 flex items-center justify-center bg-emerald-500 text-black rounded-full hover:bg-emerald-400 transition-all disabled:opacity-50">
                            <svg className="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-medium text-white tracking-tight">Node Directory</h2>
                <p className="text-sm text-zinc-500">Discover and connect with verified attendees. Echos dissolve when the node closes.</p>
            </div>

            <AnimatePresence>
                {inboundEchos.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full bg-violet-500/10 border border-violet-500/20 rounded-[24px] p-6 mb-2">
                        <h3 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                            Incoming Echos ({inboundEchos.length})
                        </h3>
                        <div className="space-y-3">
                            {inboundEchos.map(senderId => {
                                const sender = directory.find(g => g.id === senderId);
                                return (
                                    <div key={senderId} className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05]">
                                        <div>
                                            <p className="text-sm font-medium text-white">{sender?.full_name || 'Unknown Guest'}</p>
                                        </div>
                                        <button onClick={() => handleAcceptEcho(senderId)} className="px-4 py-2 bg-violet-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-violet-400 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                            Accept Echo
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoading ? (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-600">
                        <svg className="animate-spin w-6 h-6 mb-3 text-zinc-500/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                ) : directory.length === 0 ? (
                    <div className="col-span-full py-12 text-center border border-dashed border-white/[0.05] rounded-[24px]">
                        <p className="text-sm text-zinc-500">You are the only verified guest currently in this node.</p>
                    </div>
                ) : (
                    directory.map((guest) => {
                        const isOnline = onlineGuests.has(guest.id);
                        const isPending = pendingOutbound.has(guest.id);
                        const hasConnection = connections.has(guest.id);

                        return (
                            <div key={guest.id} className="group relative overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-[24px] p-5 transition-all hover:bg-white/[0.04]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-zinc-300">
                                            {guest.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-zinc-200">{guest.full_name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{isOnline ? 'Active' : 'Offline'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/[0.03] flex justify-end">
                                    {hasConnection ? (
                                        <button onClick={() => openChat(guest)} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-emerald-500 hover:text-black transition-colors flex items-center gap-1.5">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                            Secure Channel
                                        </button>
                                    ) : isPending ? (
                                        <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest flex items-center gap-1.5 opacity-70">
                                            <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Echo Traveling...
                                        </span>
                                    ) : (
                                        <button onClick={() => handleSendEcho(guest.id)} className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5">
                                            Cast Echo
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}