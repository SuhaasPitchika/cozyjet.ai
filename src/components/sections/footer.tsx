
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress specifically for the footer section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const text = "COZYJET.AI";
  const chars = text.split("");

  // Map scroll progress (0 to 1) to the "bend" intensity (120 to 0)
  const bendIntensity = useTransform(scrollYProgress, [0, 1], [120, 0]);
  
  // Opacity for the button and final state
  const contentOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.8, 1], [20, 0]);

  return (
    <footer 
      ref={containerRef} 
      className="bg-black py-20 px-6 overflow-hidden flex items-center justify-center min-h-[40vh]"
    >
      <div className="w-full max-w-7xl flex flex-col items-center gap-16">
        {/* Animated Text Signature */}
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
                className="font-pixel text-[8vw] md:text-[10vw] leading-none tracking-tighter text-white select-none whitespace-pre"
              >
                {char}
              </motion.span>
            );
          })}
        </div>

        {/* Glassmorphic Get Started Button */}
        <motion.div 
          style={{ 
            opacity: contentOpacity,
            y: contentY
          }}
          className="flex flex-col items-center"
        >
          <Button
            asChild
            className="group relative h-16 px-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-pixel text-[10px] hover:bg-white/20 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            <Link href="/auth" className="flex items-center gap-4">
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </footer>
  );
}
