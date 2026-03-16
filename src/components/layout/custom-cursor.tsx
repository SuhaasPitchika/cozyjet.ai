"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor({ name = "Studio User" }: { name?: string }) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 40, stiffness: 400, mass: 0.5 };
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
      <div className="relative -left-4 -top-4">
        {/* Cartoon Arrow SVG */}
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="drop-shadow-[2px_4px_0px_rgba(0,0,0,0.2)]"
        >
          <path
            d="M4 4L20 12L12 13.5L11 21L4 4Z"
            fill="white"
            stroke="black"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="8" r="1.5" fill="black" />
        </motion.svg>
        
        <motion.div 
          className="absolute top-10 left-6 bg-black text-white px-3 py-1 rounded-lg border-2 border-white shadow-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-[6px] font-pixel uppercase tracking-tight whitespace-nowrap">
            {name}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
