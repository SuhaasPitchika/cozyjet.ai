
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

  const clipPath = useTransform(
    scrollYProgress, 
    [0.1, 0.9], 
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

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
    <section ref={containerRef} className="relative h-[300vh] bg-white overflow-visible font-pixel">
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 overflow-hidden">
        
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
                <div className="w-full max-w-[360px] p-10 border-2 border-black/10 rounded-sm bg-[#fffdfa] shadow-[16px_16px_0px_0px_rgba(0,0,0,0.05)] relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black/5 border border-black/10" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-px bg-primary" />
                    <span className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">{step.phase}</span>
                  </div>
                  
                  <h3 className="text-sm md:text-lg font-bold mb-6 text-black uppercase leading-tight tracking-tighter">
                    {step.title}
                  </h3>
                  
                  <p className="text-[9px] md:text-[10px] leading-relaxed text-black/50 uppercase font-bold">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-2/5 aspect-[3/4] flex items-center justify-center z-10">
          <div className="relative w-full h-full max-h-[60vh]">
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

            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
          </div>
        </div>

      </div>

      <div className="absolute inset-0 bg-white pointer-events-none -z-20">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 0)', backgroundSize: '64px 64px' }} />
      </div>
    </section>
  );
}
