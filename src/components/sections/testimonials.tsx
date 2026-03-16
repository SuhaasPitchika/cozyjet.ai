
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
    rotation: "-2deg"
  },
  {
    name: "Sarah Chen",
    role: "Fullstack Developer",
    image: "https://picsum.photos/seed/sarah/100/100",
    comment: "Flippo's deep work score is the only metric I care about now. No more 'fake' productivity.",
    font: "font-hand-1",
    rotation: "1deg"
  },
  {
    name: "Marcus Thorne",
    role: "Growth @ TechFlow",
    image: "https://picsum.photos/seed/marcus/100/100",
    comment: "Snooks' viral hooks generated 2M impressions in 48 hours. I'm firing my agency.",
    font: "font-hand-2",
    rotation: "-1deg"
  },
  {
    name: "Elena Rossi",
    role: "Creative Director",
    image: "https://picsum.photos/seed/elena/100/100",
    comment: "Finally, agents that don't need hand-holding. Skippy just... knows what I'm doing.",
    font: "font-hand-3",
    rotation: "2deg"
  },
  {
    name: "Julian K.",
    role: "Solopreneur",
    image: "https://picsum.photos/seed/julian/100/100",
    comment: "Snooks handles my entire social calendar. It's like having a marketing head for $0.",
    font: "font-pixel",
    rotation: "-1.5deg"
  },
  {
    name: "Priyah S.",
    role: "Product Designer",
    image: "https://picsum.photos/seed/priyah/100/100",
    comment: "I was stuck on a component and Skippy pulled up my old Figma notes automatically. Spooky good.",
    font: "font-hand-1",
    rotation: "1.5deg"
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
            className={`w-[350px] bg-white p-8 border border-black/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] rounded-sm flex flex-col justify-between shrink-0 relative`}
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black/10 border border-black/5" />
            
            <p className={`text-xl text-black/80 leading-relaxed whitespace-normal mb-6 ${item.font === 'font-hand-1' ? 'font-caveat' : item.font === 'font-hand-2' ? 'font-indie' : item.font === 'font-hand-3' ? 'font-gloria' : 'font-pixel text-[10px]'}`}>
              "{item.comment}"
            </p>

            <div className="flex items-center gap-4 mt-auto border-t border-black/5 pt-4">
              <Avatar className="w-10 h-10 border border-black/5">
                <AvatarImage src={item.image} />
                <AvatarFallback className="text-[10px]">{item.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-[10px] font-bold text-black tracking-tight uppercase">{item.name}</h4>
                <p className="text-[8px] text-black/40 uppercase font-bold">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-[80vh] py-24 overflow-hidden flex flex-col items-center justify-center bg-[#fdfaf5] group"
    >
      {/* Interactive Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 0)',
          backgroundSize: '32px 32px',
          maskImage: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.2) 60%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.2) 60%, transparent 100%)`,
        }}
      />

      <div className="relative z-10 w-full">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-2xl font-bold uppercase tracking-tight text-black">
            Studio <span className="text-primary">Dispatches</span>
          </h2>
          <p className="font-pixel text-[8px] text-black/40 mt-4 uppercase tracking-widest">
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
