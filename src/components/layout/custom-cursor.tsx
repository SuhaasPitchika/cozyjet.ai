
"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor({ name = "Guest" }: { name?: string }) {
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
        {/* Arrow SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          <path d="M4 4L20 12L4 20V4Z" fill="#A36BEE" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        
        {/* User Label */}
        <motion.div 
          className="absolute top-6 left-4 bg-primary px-2 py-0.5 rounded-sm border border-white/20 shadow-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-[10px] font-bold text-white uppercase tracking-tighter whitespace-nowrap">
            {name}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
