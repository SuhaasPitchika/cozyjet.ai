"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const STEPS = [
  {
    id: "01",
    phase: "PHASE 01",
    title: "THE VISION",
    description: "DESCRIBE YOUR PROJECT ONCE. OUR AGENTS ANALYZE YOUR MARKET, NICHE, AND TONE TO BUILD A PERSISTENT CONTEXT THAT GUIDES EVERY SINGLE CREATION.",
  },
  {
    id: "02",
    phase: "PHASE 02",
    title: "THE ENGINE",
    description: "YOUR TEAM EXECUTES ON A DISTRIBUTED BACKEND. THEY HANDLE THE COMPLEX REASONING REQUIRED TO GENERATE HIGH-FIDELITY ASSETS ACROSS EVERY PLATFORM.",
  },
  {
    id: "03",
    phase: "PHASE 03",
    title: "THE RESULT",
    description: "LAUNCH WITH DATA-BACKED CONFIDENCE. YOUR CONTENT IS OPTIMIZED FOR SPECIFIC PLATFORM HOOKS AND VIRAL PSYCHOLOGY TO HIT THE ALGORITHM PERFECTLY.",
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

  // Wipe transition: clip-path goes from bottom to top
  const clipPath = useTransform(
    scrollYProgress, 
    [0.1, 0.9], 
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );
  
  // Text transforms for Step 1
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 0, -50]);

  // Text transforms for Step 2
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [50, 0, 0, -50]);

  // Text transforms for Step 3
  const opacity3 = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.7, 0.8, 1], [50, 0, 0]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-black overflow-hidden font-pixel">
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-12 lg:px-24">
        
        {/* Left Side: Scrolling Text Slides */}
        <div className="relative w-full lg:w-2/5 h-[40vh] lg:h-full flex items-center z-20">
          <div className="relative w-full h-64 lg:h-96">
            
            {/* Slide 1 */}
            <motion.div 
              style={{ opacity: opacity1, y: y1 }} 
              className="absolute inset-0 flex flex-col justify-center"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{STEPS[0].phase}</span>
              </div>
              <h3 className="text-xl lg:text-3xl font-bold mb-6 text-white tracking-tighter leading-tight uppercase">
                {STEPS[0].title}
              </h3>
              <p className="text-[10px] leading-relaxed text-white/40 max-w-sm uppercase">
                {STEPS[0].description}
              </p>
            </motion.div>

            {/* Slide 2 */}
            <motion.div 
              style={{ opacity: opacity2, y: y2 }} 
              className="absolute inset-0 flex flex-col justify-center"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{STEPS[1].phase}</span>
              </div>
              <h3 className="text-xl lg:text-3xl font-bold mb-6 text-white tracking-tighter leading-tight uppercase">
                {STEPS[1].title}
              </h3>
              <p className="text-[10px] leading-relaxed text-white/40 max-w-sm uppercase">
                {STEPS[1].description}
              </p>
            </motion.div>

            {/* Slide 3 */}
            <motion.div 
              style={{ opacity: opacity3, y: y3 }} 
              className="absolute inset-0 flex flex-col justify-center"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{STEPS[2].phase}</span>
              </div>
              <h3 className="text-xl lg:text-3xl font-bold mb-6 text-white tracking-tighter leading-tight uppercase">
                {STEPS[2].title}
              </h3>
              <p className="text-[10px] leading-relaxed text-white/40 max-w-sm uppercase">
                {STEPS[2].description}
              </p>
            </motion.div>

          </div>
        </div>

        {/* Right Side: The Jet Transition (Sketch -> Metal) */}
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-full flex items-center justify-center z-10">
          <div className="relative w-full aspect-[2/3] max-w-md">
            
            {/* Technical Sketch (Base Layer) */}
            <div className="absolute inset-0">
               <Image 
                  src={sketchImg?.imageUrl || "https://picsum.photos/seed/jet-sketch-top/800/1200"}
                  alt="Jet Technical Blueprint"
                  fill
                  className="object-contain opacity-40 brightness-0 invert"
                  priority
                  data-ai-hint="jet sketch"
               />
            </div>

            {/* Polished Metallic Jet (Wipe Layer) */}
            <motion.div 
              className="absolute inset-0 z-10"
              style={{ clipPath }}
            >
               <Image 
                  src={metalImg?.imageUrl || "https://picsum.photos/seed/jet-metal-top/800/1200"}
                  alt="Metallic Jet Render"
                  fill
                  className="object-contain"
                  priority
                  data-ai-hint="metallic jet"
               />
            </motion.div>

            {/* Decorative Background Glow */}
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />

          </div>
        </div>

      </div>

      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-black opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
    </section>
  );
}
