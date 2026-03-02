"use client";
import React, { useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export const InteractiveAura = () => {
    // These values track the raw mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring physics make the spotlight feel "heavy" and smooth
    const springConfig = { damping: 25, stiffness: 200 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#09090b] pointer-events-none">
            {/* The Interactive Spotlight */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full bg-indigo-500/[0.10] blur-[120px] "
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
            
            {/* Optional: Subtle center static glow to ensure page isn't pitch black if mouse is off-screen */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-white/[0.01] rounded-full blur-[120px]" />
        </div>
    );
};