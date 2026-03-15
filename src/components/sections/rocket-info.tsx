"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const STEPS = [
  {
    phase: "PHASE 01",
    title: "THE VISION",
    description: "DESCRIBE YOUR PROJECT ONCE. OUR AGENTS ANALYZE YOUR MARKET TO BUILD A PERSISTENT AI CONTEXT.",
  },
  {
    phase: "PHASE 02",
    title: "THE ENGINE",
    description: "YOUR TEAM EXECUTES ON A DISTRIBUTED BACKEND, HANDLING COMPLEX REASONING ACROSS PLATFORMS.",
  },
  {
    phase: "PHASE 03",
    title: "THE RESULT",
    description: "LAUNCH WITH CONFIDENCE. YOUR CONTENT IS OPTIMIZED FOR SPECIFIC PLATFORM HOOKS AND VIRAL FLOWS.",
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

  // Wipe transition for the Jet: Sketch to Metal
  const clipPath = useTransform(
    scrollYProgress, 
    [0.1, 0.9], 
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  // Text slide animations
  const opacity1 = useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const x1 = useTransform(scrollYProgress, [0, 0.25, 0.35], [0, 0, -20]);

  const opacity2 = useTransform(scrollYProgress, [0.35, 0.45, 0.65, 0.75], [0, 1, 1, 0]);
  const x2 = useTransform(scrollYProgress, [0.35, 0.45, 0.65, 0.75], [20, 0, 0, -20]);

  const opacity3 = useTransform(scrollYProgress, [0.75, 0.85, 1], [0, 1, 1]);
  const x3 = useTransform(scrollYProgress, [0.75, 0.85, 1], [20, 0, 0]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-white overflow-visible font-pixel">
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-12 lg:px-24 overflow-hidden">
        
        {/* Left Side: Text Slides */}
        <div className="relative w-full lg:w-1/2 h-64 lg:h-full flex flex-col justify-center z-20 order-2 lg:order-1">
          <div className="relative h-48 w-full max-w-md">
            {/* Slide 1 */}
            <motion.div style={{ opacity: opacity1, x: x1 }} className="absolute inset-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">{STEPS[0].phase}</span>
              </div>
              <h3 className="text-lg font-bold mb-4 text-black uppercase leading-tight">{STEPS[0].title}</h3>
              <p className="text-[8px] leading-loose text-black/40 uppercase">{STEPS[0].description}</p>
            </motion.div>

            {/* Slide 2 */}
            <motion.div style={{ opacity: opacity2, x: x2 }} className="absolute inset-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">{STEPS[1].phase}</span>
              </div>
              <h3 className="text-lg font-bold mb-4 text-black uppercase leading-tight">{STEPS[1].title}</h3>
              <p className="text-[8px] leading-loose text-black/40 uppercase">{STEPS[1].description}</p>
            </motion.div>

            {/* Slide 3 */}
            <motion.div style={{ opacity: opacity3, x: x3 }} className="absolute inset-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">{STEPS[2].phase}</span>
              </div>
              <h3 className="text-lg font-bold mb-4 text-black uppercase leading-tight">{STEPS[2].title}</h3>
              <p className="text-[8px] leading-loose text-black/40 uppercase">{STEPS[2].description}</p>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Smaller Visual centerpiece */}
        <div className="relative w-full lg:w-1/3 aspect-[3/4] flex items-center justify-center z-10 order-1 lg:order-2">
          <div className="relative w-full h-full max-h-[70vh]">
            {/* Base Layer: Technical Sketch */}
            <div className="absolute inset-0">
               <Image 
                  src={sketchImg?.imageUrl || "https://picsum.photos/seed/jet-sketch-top/800/1200"}
                  alt="Jet Technical Blueprint"
                  fill
                  className="object-contain opacity-20 grayscale"
                  priority
                  data-ai-hint="jet sketch"
               />
            </div>

            {/* Top Layer: Metallic Finish (Wiping in) */}
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

            {/* Subtle Lighting Effect */}
            <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full pointer-events-none -z-10" />
          </div>
        </div>

      </div>

      {/* Background Decorative Grid (Light) */}
      <div className="absolute inset-0 bg-white pointer-events-none -z-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      </div>
    </section>
  );
}
