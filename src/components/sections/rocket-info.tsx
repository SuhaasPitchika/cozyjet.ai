
"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CheckCircle2, Zap } from "lucide-react";

const STEPS = [
  {
    id: "step-1",
    title: "The Vision",
    description: "Describe your project once. Our agents analyze your market, niche, and tone to build a persistent context that guides every single creation.",
    items: ["Deep Market Research", "Contextual Persona Building", "Visual Strategy Mapping"]
  },
  {
    id: "step-2",
    title: "The Engine",
    description: "Your team executes on a distributed backend. They handle the complex reasoning required to generate high-fidelity assets across every platform.",
    items: ["Edge-Computed Reasoning", "Distributed Task Queues", "Vector Memory Storage"]
  },
  {
    id: "step-3",
    title: "The Result",
    description: "Launch with data-backed confidence. Your content is optimized for specific platform hooks and viral psychology to hit the algorithm perfectly.",
    items: ["Multi-Platform Distribution", "Real-time Trend Sync", "Performance Tracking"]
  }
];

export function RocketInfo() {
  const metalImg = PlaceHolderImages.find(img => img.id === "jet-metal");

  return (
    <section className="py-32 px-6 bg-white border-y border-black/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <Zap className="w-4 h-4 text-primary fill-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">The Workflow</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-headline text-4xl md:text-6xl font-bold tracking-tighter text-black"
            >
              One Prompt. <br />
              Full Agency Execution.
            </motion.h2>
          </div>
          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="text-black/40 text-sm max-w-xs uppercase leading-relaxed font-medium"
          >
            A high-performance system designed for solopreneurs who demand billionaire-level output.
          </motion.p>
        </div>

        {/* Central Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative w-full aspect-[21/9] bg-black/5 rounded-[2rem] border border-black/5 mb-24 overflow-hidden group shadow-sm"
        >
          <Image 
            src={metalImg?.imageUrl || "https://picsum.photos/seed/jet-metal-top/1200/600"} 
            alt="The CozyJet System" 
            fill 
            className="object-contain scale-110 group-hover:scale-[1.15] transition-transform duration-[2s] ease-out"
            priority
            data-ai-hint="metallic jet"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-6 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-center text-black font-bold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                0{i + 1}
              </div>
              <h3 className="font-headline text-2xl font-bold text-black">{step.title}</h3>
              <p className="text-black/60 text-sm leading-relaxed">
                {step.description}
              </p>
              
              <ul className="space-y-3 pt-4">
                {step.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-black/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Simple Footer CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 pt-12 border-t border-black/5 flex justify-center"
        >
          <button className="font-pixel text-[10px] uppercase tracking-widest text-primary hover:text-black transition-colors">
            Request Access to the Private Studio →
          </button>
        </motion.div>

      </div>
    </section>
  );
}
