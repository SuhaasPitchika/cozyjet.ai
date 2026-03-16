"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "VFX Supervisor",
    image: "https://picsum.photos/seed/alex/100/100",
    comment: "Skippy literally spotted a frame jitter I missed in a 4K render. Agentic intelligence is real.",
    font: "font-pixel",
    rotation: "-1.5deg"
  },
  {
    name: "Sarah Chen",
    role: "Fullstack Developer",
    image: "https://picsum.photos/seed/sarah/100/100",
    comment: "Flippo's deep work score is the only metric I care about now. No more 'fake' productivity.",
    font: "font-sans",
    rotation: "1deg"
  },
  {
    name: "Marcus Thorne",
    role: "Growth @ TechFlow",
    image: "https://picsum.photos/seed/marcus/100/100",
    comment: "Snooks' viral hooks generated 2M impressions in 48 hours. I'm firing my agency.",
    font: "font-sans",
    rotation: "-0.5deg"
  },
  {
    name: "Elena Rossi",
    role: "Creative Director",
    image: "https://picsum.photos/seed/elena/100/100",
    comment: "Finally, agents that don't need hand-holding. Skippy just... knows what I'm doing.",
    font: "font-sans",
    rotation: "1.5deg"
  },
  {
    name: "Julian K.",
    role: "Solopreneur",
    image: "https://picsum.photos/seed/julian/100/100",
    comment: "Snooks handles my entire social calendar. It's like having a marketing head for $0.",
    font: "font-pixel",
    rotation: "-1deg"
  },
  {
    name: "Priyah S.",
    role: "Product Designer",
    image: "https://picsum.photos/seed/priyah/100/100",
    comment: "I was stuck on a component and Skippy pulled up my old Figma notes automatically. Spooky good.",
    font: "font-sans",
    rotation: "0.5deg"
  }
];

function MarqueeRow({ items, direction = 1, speed = 40 }: { items: typeof TESTIMONIALS, direction?: 1 | -1, speed?: number }) {
  return (
    <div className="flex overflow-hidden group select-none py-12">
      <motion.div
        animate={{
          x: direction === 1 ? [0, -2500] : [-2500, 0]
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear"
        }}
        className="flex gap-12 pr-12 whitespace-nowrap min-w-full"
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            style={{ transform: `rotate(${item.rotation})` }}
            className={`w-[350px] bg-white p-8 border border-black/5 shadow-[4px_4px_15px_rgba(0,0,0,0.02)] rounded-2xl flex flex-col justify-between shrink-0 relative transition-transform hover:scale-105 hover:z-50`}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black/5" />
            
            <p className={`text-base text-zinc-800 leading-relaxed whitespace-normal mb-6 font-sans italic`}>
              "{item.comment}"
            </p>

            <div className="flex items-center gap-4 mt-auto border-t border-black/5 pt-4">
              <Avatar className="w-9 h-9 border border-black/5">
                <AvatarImage src={item.image} />
                <AvatarFallback className="text-[10px]">{item.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-[10px] font-bold text-black tracking-tight uppercase">{item.name}</h4>
                <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-widest">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative min-h-[80vh] py-32 overflow-hidden flex flex-col items-center justify-center bg-[#fdfaf5]">
      
      {/* Moving Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] animate-move-dots"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full">
        <div className="text-center mb-24">
          <h2 className="font-pixel text-xl md:text-2xl font-bold uppercase tracking-tight text-black">
            Studio <span className="text-[#8c6b4f]">Dispatches</span>
          </h2>
          <p className="font-sans text-[10px] text-zinc-400 mt-4 uppercase font-bold tracking-[0.3em]">
            High-fidelity feedback from the network.
          </p>
        </div>
        
        <div className="space-y-4 max-w-[2400px] mx-auto">
          <MarqueeRow items={TESTIMONIALS} direction={1} speed={60} />
          <MarqueeRow items={[...TESTIMONIALS].reverse()} direction={-1} speed={75} />
        </div>
      </div>
    </section>
  );
}