
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const STEPS = [
  {
    id: "step-1",
    label: "One prompt",
    title: "One prompt. Full Agency. No kidding.",
    description: "While others make you prompt for every single post or task, CozyJet is different. Describe your vision once and get a full autonomous team that reads your mind.",
    items: [
      { id: "1.1", text: "Jet does deep research about your market (seriously)" },
      { id: "1.2", text: "Contextualizes your problem and decides feature set" },
      { id: "1.3", text: "Designs optimum user experience and interface (UI/UX)" },
      { id: "1.4", text: "Writes awesome copy that ranks high in SEO" },
      { id: "1.5", text: "Automates multi-platform delivery on autopilot" }
    ]
  },
  {
    id: "step-2",
    label: "Backend",
    title: "Scalable Infrastructure. Built In.",
    description: "Your agents don't just talk; they execute. We provide the serverless power required to process complex data and generate high-fidelity marketing assets instantly.",
    items: [
      { id: "2.1", text: "Edge-computed agentic reasoning" },
      { id: "2.2", text: "Distributed task execution queues" },
      { id: "2.3", text: "Vector memory storage for long-term context" }
    ]
  },
  {
    id: "step-3",
    label: "Launch",
    title: "Zero to Viral in Seconds.",
    description: "Launch your campaigns with confidence. Our agents analyze real-time trends to ensure your content hits the algorithm at the perfect moment.",
    items: [
      { id: "3.1", text: "Real-time trend analysis and sync" },
      { id: "3.2", text: "Automated distribution to 5+ platforms" },
      { id: "3.3", text: "Performance tracking and self-correction" }
    ]
  }
];

export function RocketInfo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map scroll progress to the sketch-to-metal transition
  const wipeY = useTransform(smoothProgress, [0, 1], ["100%", "0%"]);
  
  // Determine which step is active based on scroll
  const activeIndex = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [0, 0, 1, 2]);
  
  const sketchImg = PlaceHolderImages.find(img => img.id === "jet-sketch");
  const metalImg = PlaceHolderImages.find(img => img.id === "jet-metal");

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-white">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden px-6 lg:px-24">
        
        {/* Left Side: Navigation Links */}
        <div className="hidden lg:flex flex-col gap-8 w-1/4">
          {STEPS.map((step, i) => {
            const isActive = useTransform(smoothProgress, (p) => {
              if (i === 0) return p < 0.33;
              if (i === 1) return p >= 0.33 && p < 0.66;
              return p >= 0.66;
            });

            return (
              <div key={step.id} className="relative group">
                <motion.div 
                  style={{ opacity: isActive ? 1 : 0.2 }}
                  className="flex items-center gap-4 cursor-pointer transition-opacity"
                >
                  <div className="w-1 h-1 rounded-full bg-black" />
                  <span className="font-pixel text-[10px] uppercase tracking-widest">{step.label}</span>
                </motion.div>
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-full h-[1px] bg-black/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
            );
          })}
        </div>

        {/* Center: The Jet Animation */}
        <div className="flex-1 h-full relative flex items-center justify-center py-20">
          <div className="relative w-full max-w-md aspect-[2/3]">
            {/* Sketch Layer */}
            <div className="absolute inset-0 z-10 grayscale opacity-40">
              <Image 
                src={sketchImg?.imageUrl || ""} 
                alt="Sketch" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            
            {/* Metal Layer (Wiping in) */}
            <motion.div 
              className="absolute inset-0 z-20 overflow-hidden"
              style={{ clipPath: useTransform(wipeY, (val) => `inset(${val} 0 0 0)`) }}
            >
              <Image 
                src={metalImg?.imageUrl || ""} 
                alt="Metal" 
                fill 
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Background Blueprint Grid Lines */}
            <div className="absolute inset-0 border-x border-black/5 z-0 pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/5 z-0 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Content Card */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center gap-8 pl-0 lg:pl-12">
          <motion.div 
            className="bg-[#f9fafb] p-8 lg:p-12 rounded-3xl border border-black/5 shadow-2xl relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            {/* Dynamic Step Content */}
            <AnimatePresence mode="wait">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`${i === 0 ? "block" : "hidden"}`} // simplified for logic-less cross-fade
                >
                  <h2 className="font-headline text-3xl font-bold mb-4 leading-tight">{step.title}</h2>
                  <p className="text-foreground/60 text-sm leading-relaxed mb-8">{step.description}</p>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">What actually happens:</p>
                    <div className="space-y-4 border-t border-black/5 pt-4">
                      {step.items.map((item) => (
                        <div key={item.id} className="flex gap-4 items-start">
                          <span className="text-[10px] font-bold text-black/40 pt-1">{item.id}</span>
                          <span className="text-sm font-medium leading-tight">{item.text}</span>
                        </div>
                      ))}
                      <div className="flex gap-4 items-center pt-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold italic">CozyJet adds features you didn't know you needed!</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-black/5">
              <Button className="w-full py-8 bg-black text-white hover:bg-black/90 text-md font-bold rounded-2xl shadow-xl shadow-black/10">
                Sounds unbelievable? Try it
              </Button>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
