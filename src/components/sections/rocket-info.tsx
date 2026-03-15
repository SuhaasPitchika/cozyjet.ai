
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const STEPS = [
  {
    id: "01",
    title: "THE VISION",
    description: "DESCRIBE YOUR PROJECT ONCE. OUR AGENTS ANALYZE YOUR MARKET, NICHE, AND TONE TO BUILD A PERSISTENT CONTEXT THAT GUIDES EVERY SINGLE CREATION.",
  },
  {
    id: "02",
    title: "THE ENGINE",
    description: "YOUR TEAM EXECUTES ON A DISTRIBUTED BACKEND. THEY HANDLE THE COMPLEX REASONING REQUIRED TO GENERATE HIGH-FIDELITY ASSETS ACROSS EVERY PLATFORM.",
  },
  {
    id: "03",
    title: "THE RESULT",
    description: "LAUNCH WITH DATA-BACKED CONFIDENCE. YOUR CONTENT IS OPTIMIZED FOR SPECIFIC PLATFORM HOOKS AND VIRAL PSYCHOLOGY TO HIT THE ALGORITHM PERFECTLY.",
  }
];

export function RocketInfo() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create scroll progress for the tall container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const sketchImg = PlaceHolderImages.find(img => img.id === "jet-sketch");
  const metalImg = PlaceHolderImages.find(img => img.id === "jet-metal");

  // Wipe transition: clip-path goes from bottom to top (100% to 0%)
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
    <section ref={containerRef} className="relative h-[400vh] bg-white overflow-hidden font-pixel">
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
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Phase 01</span>
              </div>
              <h3 className="text-xl lg:text-3xl font-bold mb-6 text-black tracking-tighter leading-tight uppercase">
                {STEPS[0].title}
              </h3>
              <p className="text-[10px] leading-relaxed text-black/50 max-w-sm uppercase">
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
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Phase 02</span>
              </div>
              <h3 className="text-xl lg:text-3xl font-bold mb-6 text-black tracking-tighter leading-tight uppercase">
                {STEPS[1].title}
              </h3>
              <p className="text-[10px] leading-relaxed text-black/50 max-w-sm uppercase">
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
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Phase 03</span>
              </div>
              <h3 className="text-xl lg:text-3xl font-bold mb-6 text-black tracking-tighter leading-tight uppercase">
                {STEPS[2].title}
              </h3>
              <p className="text-[10px] leading-relaxed text-black/50 max-w-sm uppercase">
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
                  className="object-contain opacity-40 grayscale"
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

            {/* Decorative Background Text */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none -rotate-90">
              <span className="text-[20vw] font-bold text-black whitespace-nowrap">COZYJET</span>
            </div>

          </div>
        </div>

      </div>

      {/* Background Decorative Grid */}
      <div className="absolute inset-0 hero-grid opacity-10 pointer-events-none" />
    </section>
  );
}
