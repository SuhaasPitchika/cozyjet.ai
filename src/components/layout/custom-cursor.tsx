"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor({ name = "Studio User" }: { name?: string }) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 250, mass: 0.5 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{
        translateX: springX,
        translateY: springY,
      }}
      className="fixed top-0 left-0 z-[9999] pointer-events-none select-none hidden md:block"
    >
      <div className="relative -left-2 -top-2">
        <div className="w-4 h-4 bg-black/80 rounded-full flex items-center justify-center border border-white/20">
          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
        </div>
        
        <motion.div 
          className="absolute top-6 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-black/5 shadow-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-[8px] font-bold text-black uppercase tracking-tight whitespace-nowrap">
            {name}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}