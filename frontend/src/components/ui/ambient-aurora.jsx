"use client";

import { motion } from 'framer-motion';
import { useEffect } from 'react';

export function AmbientAurora() {
    // Added log for step tracking and failure identification
    useEffect(() => {
        console.log("[AmbientAurora] Component mounted - Royal Blue / Electric Violet / Midnight theme active");
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* ARCHITECT NOTE: 
              - Removed 'blur-[120px]' entirely.
              - Replaced with hardware-friendly 'radial-gradient'.
              - Added 'willChange: transform' to force the node onto a dedicated GPU layer.
            */}
            
            {/* Main Node: Royal Blue (#2563EB) */}
            <motion.div
                animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], scale: [1, 1.1, 0.9, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                style={{ willChange: "transform" }}
                className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_60%)]"
            />
            
            {/* Accent Node: Electric Violet (#7C3AED) */}
            <motion.div
                animate={{ x: [0, -100, 50, 0], y: [0, 100, -50, 0], scale: [1, 0.9, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ willChange: "transform" }}
                className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15)_0%,transparent_60%)]"
            />
            
            {/* Fade Blend Node: Deep Midnight (#0F172A) */}
            <motion.div
                animate={{ x: [0, 50, -100, 0], y: [0, -100, 50, 0], scale: [1, 1.2, 0.8, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                style={{ willChange: "transform" }}
                className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.4)_0%,transparent_60%)]"
            />
        </div>
    );
}