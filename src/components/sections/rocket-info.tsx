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
  const y1 = useTransform(scrollYProgress, [0, 0.25, 0.35], [0, 0, -40]);

  const opacity2 = useTransform(scrollYProgress, [0.35, 0.45, 0.65, 0.75], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.35, 0.45, 0.65, 0.75], [40, 0, 0, -40]);

  const opacity3 = useTransform(scrollYProgress, [0.75, 0.85, 1], [0, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.75, 0.85, 1], [40, 0, 0]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-black overflow-visible font-pixel">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
        
        {/* The Visual Centerpiece */}
        <div className="relative w-full max-w-2xl aspect-[3/4] flex items-center justify-center z-10 mb-20 lg:mb-0">
          <div className="relative w-full h-full">
            {/* Base Layer: Technical Sketch */}
            <div className="absolute inset-0">
               <Image 
                  src={sketchImg?.imageUrl || "https://picsum.photos/seed/jet-sketch-top/800/1200"}
                  alt="Jet Technical Blueprint"
                  fill
                  className="object-contain opacity-30 brightness-0 invert"
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

            {/* Decorative Background Glow */}
            <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          </div>
        </div>

        {/* Text Slides Overlay */}
        <div className="absolute bottom-12 left-0 right-0 lg:left-24 lg:bottom-1/2 lg:-translate-y-1/2 lg:w-1/3 px-12 z-20 pointer-events-none">
          <div className="relative h-48">
            {/* Slide 1 */}
            <motion.div style={{ opacity: opacity1, y: y1 }} className="absolute inset-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">{STEPS[0].phase}</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase">{STEPS[0].title}</h3>
              <p className="text-[9px] leading-loose text-white/40 uppercase max-w-xs">{STEPS[0].description}</p>
            </motion.div>

            {/* Slide 2 */}
            <motion.div style={{ opacity: opacity2, y: y2 }} className="absolute inset-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">{STEPS[1].phase}</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase">{STEPS[1].title}</h3>
              <p className="text-[9px] leading-loose text-white/40 uppercase max-w-xs">{STEPS[1].description}</p>
            </motion.div>

            {/* Slide 3 */}
            <motion.div style={{ opacity: opacity3, y: y3 }} className="absolute inset-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">{STEPS[2].phase}</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase">{STEPS[2].title}</h3>
              <p className="text-[9px] leading-loose text-white/40 uppercase max-w-xs">{STEPS[2].description}</p>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-black opacity-10 pointer-events-none -z-20">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 0.5px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
    </section>
  );
}
