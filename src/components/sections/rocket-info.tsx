
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const STEPS = [
  {
    phase: "PHASE 01",
    title: "VISION",
    description: "DESCRIBE YOUR PROJECT ONCE. OUR AGENTS ANALYZE YOUR MARKET TO BUILD A PERSISTENT AI CONTEXT.",
  },
  {
    phase: "PHASE 02",
    title: "SECURITY",
    description: "FULLY LOCAL ENCRYPTED AI. OUR AGENTS OPERATE ON AIR-GAPPED LOGIC—THEY SEE, THEY UNDERSTAND, BUT THEY NEVER STORE. 100% PRIVATE, UNHACKABLE EXECUTION.",
  },
  {
    phase: "PHASE 03",
    title: "ENGINE",
    description: "DISTRIBUTED BACKEND REASONING. YOUR TEAM EXECUTES COMPLEX CROSS-PLATFORM TASKS ON OUR AUTONOMOUS ENGINE.",
  },
  {
    phase: "PHASE 04",
    title: "RESULT",
    description: "OPTIMIZED VIRAL LAUNCH. HIGH-FIDELITY CONTENT TAILORED FOR PLATFORM-SPECIFIC HOOKS AND FLOWS.",
  }
];

export function RocketInfo() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const sketchImg = PlaceHolderImages.find(img => img.id === "jet-sketch");
  const metalImg = PlaceHolderImages.find(img => img.id === "jet-metal");

  // Animation range mappings for the image wipe
  const clipPath = useTransform(
    scrollYProgress, 
    [0.1, 0.9], 
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  // Background shading transforms - gets more "blue" and "textured" as we scroll
  const bgBlueIntensity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.6, 1]);
  const cloudParallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const textureScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const skyColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#f8fbff", "#e0f2fe", "#bae6fd"]
  );

  // Card animations for the left side
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.2, 0.25], [0, 0, -50]);

  const opacity2 = useTransform(scrollYProgress, [0.25, 0.3, 0.45, 0.5], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.25, 0.3, 0.45, 0.5], [50, 0, 0, -50]);

  const opacity3 = useTransform(scrollYProgress, [0.5, 0.55, 0.7, 0.75], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.55, 0.7, 0.75], [50, 0, 0, -50]);

  const opacity4 = useTransform(scrollYProgress, [0.75, 0.8, 1], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.75, 0.8, 1], [50, 0, 0]);

  const opacities = [opacity1, opacity2, opacity3, opacity4];
  const ys = [y1, y2, y3, y4];

  return (
    <section ref={containerRef} className="relative h-[500vh] overflow-visible font-pixel">
      {/* Dynamic Sky Background - Layered for depth */}
      <motion.div 
        style={{ backgroundColor: skyColor }}
        className="fixed inset-0 pointer-events-none -z-20 transition-colors duration-500"
      >
        {/* Layered clouds that move with scroll */}
        <motion.div 
          style={{ y: cloudParallaxY, scale: textureScale }}
          className="absolute inset-0 overflow-hidden"
        >
          {/* Top Cloud */}
          <div className="absolute top-[10%] left-[15%] w-[50vw] h-[50vw] bg-white/60 blur-[120px] rounded-full" />
          {/* Middle Cloud */}
          <div className="absolute top-[40%] right-[10%] w-[60vw] h-[60vw] bg-white/40 blur-[150px] rounded-full" />
          {/* Bottom Shading Overlay */}
          <motion.div 
            style={{ opacity: bgBlueIntensity }}
            className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/10 to-blue-500/20 mix-blend-overlay"
          />
        </motion.div>

        {/* Technical Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 0)', 
            backgroundSize: '48px 48px' 
          }} 
        />
      </motion.div>

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 overflow-hidden">
        
        {/* Left Side: Scrolling Sticky Notes (Locked side-by-side) */}
        <div className="relative w-full lg:w-1/2 h-full flex flex-col justify-center z-20">
          <div className="relative h-[400px] w-full max-w-md mx-auto lg:mx-0">
            {STEPS.map((step, index) => (
              <motion.div 
                key={step.phase}
                style={{ 
                  opacity: opacities[index], 
                  y: ys[index],
                  rotate: index % 2 === 0 ? -1.5 : 1.5
                }} 
                className="absolute inset-0 flex items-center justify-center lg:justify-start"
              >
                <div className="w-full max-w-[380px] p-10 border border-black/5 rounded-sm bg-[#fffdfa]/95 backdrop-blur-xl shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.1)] relative group hover:rotate-0 transition-transform duration-500">
                  {/* Sticky Note Thumbtack Hole */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black/5 border border-black/10 shadow-inner" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-[2px] bg-primary" />
                    <span className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">{step.phase}</span>
                  </div>
                  
                  <h3 className="text-sm md:text-xl font-bold mb-6 text-black uppercase leading-tight tracking-tighter">
                    {step.title}
                  </h3>
                  
                  <p className="text-[9px] md:text-[11px] leading-relaxed text-black/60 uppercase font-bold">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Jet Visual with Whitish Halo (Locked side-by-side) */}
        <div className="relative w-full lg:w-2/5 aspect-[3/4] flex items-center justify-center z-10">
          <div className="relative w-full h-full max-h-[70vh]">
            {/* Whitish Cloud-like Halo centered around the images */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white blur-[100px] rounded-full -z-10 opacity-90 shadow-[0_0_120px_60px_rgba(255,255,255,0.8)]" />
            
            {/* Base Image (Sketch) */}
            <div className="absolute inset-0">
               <Image 
                  src={sketchImg?.imageUrl || "https://picsum.photos/seed/jet-sketch-top/800/1200"}
                  alt="Jet Technical Blueprint"
                  fill
                  className="object-contain opacity-30 grayscale"
                  priority
                  data-ai-hint="jet sketch"
               />
            </div>

            {/* Wipe Image (Metal Render) */}
            <motion.div 
              className="absolute inset-0 z-10"
              style={{ clipPath }}
            >
               <Image 
                  src={metalImg?.imageUrl || "https://picsum.photos/seed/jet-metal-top/800/1200"}
                  alt="Metallic Jet Render"
                  fill
                  className="object-contain drop-shadow-[0_20px_80px_rgba(0,0,0,0.1)]"
                  priority
                  data-ai-hint="metallic jet"
               />
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
