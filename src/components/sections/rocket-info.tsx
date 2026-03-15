
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    id: "step-1",
    label: "One prompt",
    title: "One prompt. Full Agency. No kidding.",
    description: "While others make you prompt for every single post or task, CozyJet is different. Describe your vision once and get a full autonomous team that reads your mind.",
    items: [
      { id: "1.1", text: "Jet does deep research about your market (seriously)" },
      { id: "1.2", text: "Contextualizes your problem and decides feature set" },
      { id: "1.3", text: "Designs optimum user experience and interface (UI/UX)" }
    ]
  },
  {
    id: "step-2",
    label: "Backend",
    title: "Scalable Infrastructure. Built In.",
    description: "Your agents don't just talk; they execute. We provide the serverless power required to process complex data and generate high-fidelity assets instantly.",
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
  // We want the metal to wipe from top to bottom
  const wipeY = useTransform(smoothProgress, [0, 0.8], ["100%", "0%"]);
  
  // Opacity controls for content steps
  const step1Opacity = useTransform(smoothProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const step2Opacity = useTransform(smoothProgress, [0.35, 0.45, 0.65, 0.75], [0, 1, 1, 0]);
  const step3Opacity = useTransform(smoothProgress, [0.75, 0.85, 1], [0, 1, 1]);

  const sketchImg = PlaceHolderImages.find(img => img.id === "jet-sketch");
  const metalImg = PlaceHolderImages.find(img => img.id === "jet-metal");

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-white">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden px-6 lg:px-24">
        
        {/* Left Side: Step Progress Indicators */}
        <div className="hidden lg:flex flex-col gap-12 w-1/4">
          {STEPS.map((step, i) => {
            const stepProgress = [
              useTransform(smoothProgress, [0, 0.33], [1, 0.2]),
              useTransform(smoothProgress, [0.33, 0.4, 0.6, 0.66], [0.2, 1, 1, 0.2]),
              useTransform(smoothProgress, [0.66, 1], [0.2, 1])
            ][i];

            return (
              <motion.div 
                key={step.id} 
                className="flex items-center gap-6"
                style={{ opacity: stepProgress }}
              >
                <div className="flex flex-col items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-black" />
                   {i < STEPS.length - 1 && <div className="w-[1px] h-8 bg-black/10" />}
                </div>
                <span className="font-pixel text-[10px] uppercase tracking-[0.2em] font-bold">{step.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Center: The Jet Animation */}
        <div className="flex-1 h-full relative flex items-center justify-center py-20 pointer-events-none">
          <div className="relative w-full max-w-lg aspect-[2/3] transform rotate-[-5deg]">
            {/* Sketch Layer (The base) */}
            <div className="absolute inset-0 z-10 opacity-60">
              <Image 
                src={sketchImg?.imageUrl || "https://picsum.photos/seed/jet-sketch-top/800/1200"} 
                alt="Jet Sketch" 
                fill 
                className="object-contain"
                priority
                data-ai-hint="jet sketch"
              />
            </div>
            
            {/* Metal Layer (The reveal) */}
            <motion.div 
              className="absolute inset-0 z-20 overflow-hidden"
              style={{ clipPath: useTransform(wipeY, (val) => `inset(${val} 0 0 0)`) }}
            >
              <Image 
                src={metalImg?.imageUrl || "https://picsum.photos/seed/jet-metal-top/800/1200"} 
                alt="Metallic Jet" 
                fill 
                className="object-contain"
                priority
                data-ai-hint="metallic jet"
              />
            </motion.div>

            {/* Blueprint Grid Lines (Aesthetic) */}
            <div className="absolute inset-0 border border-black/5 rounded-3xl z-0 overflow-hidden opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[size:24px_24px]" />
            </div>
          </div>
        </div>

        {/* Right Side: Content Cards */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center relative h-[600px]">
          {STEPS.map((step, i) => {
            const opacity = [step1Opacity, step2Opacity, step3Opacity][i];
            const y = useTransform(opacity, [0, 1], [20, 0]);

            return (
              <motion.div
                key={step.id}
                style={{ opacity, y, display: i === 0 ? 'flex' : (i === 1 ? 'flex' : 'flex'), pointerEvents: i === 0 ? 'auto' : 'auto' }}
                className="absolute inset-0 flex flex-col justify-center p-8 lg:p-12 bg-[#f9fafb]/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-2xl"
              >
                <div className="mb-6">
                   <span className="text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                     Phase 0{i+1}
                   </span>
                </div>
                
                <h2 className="font-headline text-3xl font-bold mb-4 leading-tight">{step.title}</h2>
                <p className="text-foreground/60 text-sm leading-relaxed mb-8">{step.description}</p>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-2">Capabilities:</p>
                  <div className="space-y-4 border-t border-black/5 pt-6">
                    {step.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 pt-0.5" />
                        <span className="text-sm font-medium leading-tight">{item.text}</span>
                      </div>
                    ))}
                    <div className="flex gap-3 items-center pt-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-tighter">Autonomous Execution Active</span>
                    </div>
                  </div>
                </div>

                {i === 2 && (
                   <div className="mt-10">
                     <Button className="w-full py-7 bg-black text-white hover:bg-black/90 text-sm font-bold rounded-2xl shadow-xl shadow-black/10 flex items-center gap-2">
                       Launch My Studio
                       <Sparkles className="w-4 h-4" />
                     </Button>
                   </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
