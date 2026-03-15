
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const sketchImg = PlaceHolderImages.find(img => img.id === "jet-sketch");
  const metalImg = PlaceHolderImages.find(img => img.id === "jet-metal");

  // Wipe progress: 0 to 1 (Bottom to Top)
  const clipPath = useTransform(scrollYProgress, [0, 1], ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]);
  
  // Text transforms for each step
  // Phase 01: Active 0.0 -> 0.3
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 0, -20]);

  // Phase 02: Active 0.35 -> 0.65
  const opacity2 = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], [20, 0, 0, -20]);

  // Phase 03: Active 0.7 -> 1.0
  const opacity3 = useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.7, 0.8, 1], [20, 0, 0]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-white overflow-hidden">
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-12 lg:px-24">
        
        {/* Background Decorative Text */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.03] select-none pointer-events-none">
          <span className="font-pixel text-[40vw] leading-none text-black">JET</span>
        </div>

        {/* Content Side: Animated Text */}
        <div className="relative w-full lg:w-2/5 h-[40vh] lg:h-full flex items-center z-20">
          <div className="relative w-full h-64 lg:h-96">
            {/* Step 1 */}
            <motion.div 
              style={{ opacity: opacity1, y: y1 }} 
              className="absolute inset-0 flex flex-col justify-center"
            >
              <span className="font-pixel text-[10px] text-primary mb-4 block uppercase tracking-widest">Phase 01</span>
              <h3 className="font-pixel text-xl lg:text-3xl font-bold mb-6 text-black tracking-tighter leading-tight">
                {STEPS[0].title}
              </h3>
              <p className="font-pixel text-[10px] leading-relaxed text-black/50 max-w-sm uppercase">
                {STEPS[0].description}
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              style={{ opacity: opacity2, y: y2 }} 
              className="absolute inset-0 flex flex-col justify-center"
            >
              <span className="font-pixel text-[10px] text-primary mb-4 block uppercase tracking-widest">Phase 02</span>
              <h3 className="font-pixel text-xl lg:text-3xl font-bold mb-6 text-black tracking-tighter leading-tight">
                {STEPS[1].title}
              </h3>
              <p className="font-pixel text-[10px] leading-relaxed text-black/50 max-w-sm uppercase">
                {STEPS[1].description}
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              style={{ opacity: opacity3, y: y3 }} 
              className="absolute inset-0 flex flex-col justify-center"
            >
              <span className="font-pixel text-[10px] text-primary mb-4 block uppercase tracking-widest">Phase 03</span>
              <h3 className="font-pixel text-xl lg:text-3xl font-bold mb-6 text-black tracking-tighter leading-tight">
                {STEPS[2].title}
              </h3>
              <p className="font-pixel text-[10px] leading-relaxed text-black/50 max-w-sm uppercase">
                {STEPS[2].description}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Visual Side: The Jet Transition */}
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-full flex items-center justify-center z-10">
          <div className="relative w-full aspect-square max-w-xl group">
            {/* Sketch (Bottom Layer) */}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.02]">
               <Image 
                  src={sketchImg?.imageUrl || "https://picsum.photos/seed/jet-sketch-top/800/1200"}
                  alt="Blueprint Sketch"
                  fill
                  className="object-contain grayscale opacity-20"
                  priority
                  data-ai-hint="jet sketch"
               />
            </div>

            {/* Metal (Top Layer with Wipe) */}
            <motion.div 
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.02]"
              style={{ clipPath }}
            >
               <Image 
                  src={metalImg?.imageUrl || "https://picsum.photos/seed/jet-metal-top/800/1200"}
                  alt="Metallic Render"
                  fill
                  className="object-contain"
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
