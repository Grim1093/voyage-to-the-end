"use client";

import { motion } from 'framer-motion';

export const AmbientAurora = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px]"
        />
        <motion.div
            animate={{ x: [0, -100, 50, 0], y: [0, 100, -50, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-violet-500/10 blur-[120px]"
        />
        <motion.div
            animate={{ x: [0, 50, -100, 0], y: [0, -100, 50, 0], scale: [1, 1.2, 0.8, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-fuchsia-500/10 blur-[120px]"
        />
    </div>
);