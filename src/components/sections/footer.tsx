
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress specifically for the footer section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const text = "COZYJET.AI";
  const chars = text.split("");

  // Map scroll progress (0 to 1) to the "bend" intensity (100 to 0)
  const bendIntensity = useTransform(scrollYProgress, [0, 1], [120, 0]);

  return (
    <footer 
      ref={containerRef} 
      className="bg-black py-20 px-6 overflow-hidden flex items-center justify-center"
    >
      <div className="w-full max-w-7xl flex flex-col items-center">
        <div className="flex justify-center gap-[0.5vw] md:gap-[1vw]">
          {chars.map((char, i) => {
            // Calculate horizontal position relative to center (-1 to 1)
            const normalizedPos = (i / (chars.length - 1)) * 2 - 1;
            
            // Parabolic offset: y = x^2 * intensity
            // This creates the U-shape (concave) bend
            const yOffset = useTransform(bendIntensity, (intensity) => {
              return Math.pow(normalizedPos, 2) * intensity;
            });

            // Subtle rotation based on position to enhance the "bent" look
            const rotation = useTransform(bendIntensity, (intensity) => {
              return normalizedPos * (intensity / 4);
            });

            return (
              <motion.span
                key={i}
                style={{
                  y: yOffset,
                  rotate: rotation,
                  display: "inline-block",
                }}
                className="font-pixel text-[8vw] md:text-[10vw] leading-none tracking-tighter text-white/10 select-none whitespace-pre"
              >
                {char}
              </motion.span>
            );
          })}
        </div>

        <motion.div 
          style={{ 
            opacity: useTransform(scrollYProgress, [0.8, 1], [0, 1]),
            y: useTransform(scrollYProgress, [0.8, 1], [20, 0])
          }}
          className="mt-24 flex flex-col items-center gap-4 text-white/20 text-[10px] font-pixel uppercase tracking-widest"
        >
          <div className="w-12 h-[1px] bg-primary/30" />
          <p>© 2024 CozyJet.AI Systems Inc.</p>
        </motion.div>
      </div>
    </footer>
  );
}
