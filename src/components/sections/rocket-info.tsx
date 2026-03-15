
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

  // Background shading transforms
  const skyColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#ffffff", "#e0f2fe", "#bae6fd"]
  );
  
  const bgIntensity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const cloudY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const cloudScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);

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
    <section ref={containerRef} className="relative h-[500vh] font-pixel">
      {/* Dynamic Sky Engine */}
      <motion.div 
        style={{ backgroundColor: skyColor }}
        className="fixed inset-0 pointer-events-none z-0 transition-colors duration-300"
      >
        {/* Parallax Atmosphere Layers */}
        <motion.div 
          style={{ y: cloudY, scale: cloudScale, opacity: bgIntensity }}
          className="absolute inset-0 overflow-hidden"
        >
          {/* Top Atmosphere Bloom */}
          <div className="absolute top-[5%] left-[10%] w-[70vw] h-[70vw] bg-white/40 blur-[160px] rounded-full" />
          {/* Central Depth Bloom */}
          <div className="absolute top-[30%] right-[5%] w-[60vw] h-[60vw] bg-blue-300/20 blur-[180px] rounded-full" />
          {/* Bottom Shading */}
          <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-blue-400/10 to-transparent" />
        </motion.div>

        {/* Technical Technical Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 0)', 
            backgroundSize: '40px 40px' 
          }} 
        />
      </motion.div>

      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 overflow-hidden z-10">
        
        {/* Left: Phased Sticky Notes */}
        <div className="relative w-full lg:w-1/2 h-full flex flex-col justify-center">
          <div className="relative h-[400px] w-full max-w-md mx-auto lg:mx-0">
            {STEPS.map((step, index) => (
              <motion.div 
                key={step.phase}
                style={{ 
                  opacity: opacities[index], 
                  y: ys[index],
                  rotate: index % 2 === 0 ? -1 : 1
                }} 
                className="absolute inset-0 flex items-center justify-center lg:justify-start"
              >
                <div className="w-full max-w-[400px] p-10 border border-black/5 rounded-sm bg-white/95 backdrop-blur-2xl shadow-[30px_30px_70px_-20px_rgba(0,0,0,0.1)] relative">
                  {/* Note Details */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black/5 border border-black/10" />
                  
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

        {/* Right: Technical Jet Visual */}
        <div className="relative w-full lg:w-2/5 aspect-[3/4] flex items-center justify-center">
          <div className="relative w-full h-full max-h-[75vh]">
            {/* Brilliant White Halo (Fixed relative to the jet) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-white blur-[110px] rounded-full -z-10 opacity-95 shadow-[0_0_150px_80px_rgba(255,255,255,1)]" />
            
            {/* Sketch Layer */}
            <div className="absolute inset-0">
               <Image 
                  src={sketchImg?.imageUrl || "https://picsum.photos/seed/jet-sketch-top/800/1200"}
                  alt="Technical Blueprint"
                  fill
                  className="object-contain opacity-40 grayscale"
                  priority
                  data-ai-hint="jet blueprint"
               />
            </div>

            {/* Render Layer (Animated Wipe) */}
            <motion.div 
              className="absolute inset-0 z-10"
              style={{ clipPath }}
            >
               <Image 
                  src={metalImg?.imageUrl || "https://picsum.photos/seed/jet-metal-top/800/1200"}
                  alt="Metallic Render"
                  fill
                  className="object-contain drop-shadow-[0_30px_100px_rgba(0,0,0,0.15)]"
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
